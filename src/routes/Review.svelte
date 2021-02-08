<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import Page from "../components/Page.svelte";
  import ImageZoom from "js-image-zoom";
  import { settings, store } from "../userSettings.js";
  import { moveFiles, saveAsCSV } from "../utils";

  const fs = require("fs");
  const path = require("path");
  const { dialog } = require("electron").remote;

  export let params;

  let currentResults;
  let updatedResults;

  let inputParams;
  let confThresh;
  let colourSplit;
  let currentImg;
  let currentImgIndex;
  let numReviewedImgs = 0;
  let resultsPath;

  onMount(async () => {
    window.$(".ui.modal").modal();
    if (params && params.resultsPath) {
      resultsPath = params.resultsPath;
      readResults();
    }
  });

  onDestroy(() => {
    store.set("processing", false);
  });

  afterUpdate(() => {
    // Delete zoom instance. This is pretty hacky but I can't find a proper way to use the kill method for ImageZoom
    window.$(".js-image-zoom__zoomed-area").remove();
    window.$(".js-image-zoom__zoomed-image").remove();

    new ImageZoom(document.getElementById("imageContainer"), {
      width: 600,
      height: 450,
      zoomWidth: 522,
      offset: { vertical: 0, horizontal: 5 },
      zoomPosition: "right",
      zoomStyle: "z-index: 1000; position: absolute; border-radius: 3px",
    });
  });

  const selectFile = () => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "JSON", extensions: ["json"] }],
      })
      .then((result) => {
        resultsPath = result.filePaths[0];
        readResults();
      });
  };

  const readResults = () => {
    fs.readFile(resultsPath, "utf8", (err, data) => {
      if (err) {
        displayErrorToast("fsError", err.toString());
        logToFile(err.toString(), "ERROR");
      } else {
        // parse JSON string to JSON object
        currentResults = JSON.parse(data);
        updatedResults = JSON.parse(data); // make a copy to preserve the original
        inputParams = updatedResults.info.input_params;
        confThresh = inputParams.render_conf_threshold;
        colourSplit = (1 - confThresh) / 3.0;
        currentImgIndex = 0;

        const alreadySeen = currentResults.images.filter(
          (i) => i.reviewed === true
        ).length;
        if (alreadySeen > 0) {
          currentImgIndex = alreadySeen;
          numReviewedImgs = alreadySeen;
        }
        currentImg = updatedResults.images[currentImgIndex];

        // progress tracks reviewed images, not image index
        window.$("#progress").progress({
          percent: (numReviewedImgs / updatedResults.images.length) * 100,
          onSuccess: () => {
            window.$("#finishedModal").modal("show");
          },
        });

        store.set("processing", true);
      }
    });
  };

  const forceUpdate = () => {
    // pretend to update image so Svelte can pick up the changes
    currentImg = updatedResults.images[currentImgIndex];
  };

  const markAsAnimal = (img) => {
    img.markedAsAnimal = true;
    currentImg.reviewed = true;
  };

  const undoMarkAsAnimal = (img) => {
    img.markedAsAnimal = false;
    forceUpdate();
  };

  const markForDeletion = (d) => {
    d.deleted = true;
    currentImg.reviewed = true;
  };

  const undoMarkForDeletion = (d) => {
    d.deleted = false;
  };

  const nextImage = () => {
    currentImg.reviewed = true;
    if (currentImgIndex < updatedResults.images.length - 1) {
      currentImg = updatedResults.images[currentImgIndex + 1];
      currentImgIndex += 1;
      if (settings.get("showImageTransition")) {
        window.$(".ui.big.image, .horizontal.label").transition("stop");
        window.$(".ui.big.image, .horizontal.label").transition("pulse");
      }
    }

    numReviewedImgs = updatedResults.images.filter((i) => i.reviewed === true)
      .length;

    // update percent
    window
      .$("#progress")
      .progress(
        "set percent",
        (numReviewedImgs / updatedResults.images.length) * 100
      );
  };

  const prevImage = () => {
    if (currentImgIndex > 0) {
      currentImg = updatedResults.images[currentImgIndex - 1];
      currentImgIndex -= 1;
      if (settings.get("showImageTransition")) {
        window.$(".ui.big.image, .horizontal.label").transition("stop");
        window.$(".ui.big.image, .horizontal.label").transition("pulse");
      }
    }
  };

  const processUpdatedResults = () => {
    for (const img of updatedResults.images) {
      // create detections
      if (img.markedAsAnimal) {
        img.detections = [
          {
            label: "animal",
            category: "1",
            conf: 1,
            bbox: [],
          },
        ];
      }

      // delete detections
      img.detections = img.detections.filter((d) => {
        return !d.deleted;
      });
    }
  };

  const saveUpdatedResults = () => {
    // Order of operations here is important

    processUpdatedResults();

    window.$(".ui.primary.button").addClass("loading");

    // move files first and update img.file field with new location
    let basePath = path.join(path.dirname(resultsPath), "..");
    moveFiles(updatedResults, basePath);

    // write JSON
    let data = JSON.stringify(updatedResults, null, 4);
    let savePath = path.join(path.dirname(resultsPath), "updated_results.json");
    fs.writeFileSync(savePath, data);

    // write (enriched) CSV
    savePath = path.join(path.dirname(resultsPath), "updated_results.csv");
    saveAsCSV(updatedResults.images, savePath);

    setTimeout(() => {
      // move operation happens immediately so add a fake timeout for UX purposes
      window.$(".ui.primary.button").removeClass("loading");
      window.$(".ui.modal").modal("hide");
    }, 1000);
  };
</script>

<Page title="Review">
  <div class="column">
    {#if !currentImg}
      <div class="ui placeholder segment">
        <div class="ui icon header">
          <i class="edit icon" />
          Review model predictions
        </div>
        <div class="ui primary button" on:click={selectFile}>
          Select Results File
        </div>
      </div>
    {:else}
      <div
        class="ui fluid horizontal card"
        style="width: 100%; margin-bottom: 0;"
      >
        <div>
          <div class="left aligned floating ui label">
            <i class="images outline icon" />
            {settings.get("showFullImagePath")
              ? currentImg.file
              : path.basename(currentImg.file)}
            <div class="detail">
              {`${
                currentImgIndex + 1 <= updatedResults.images.length
                  ? currentImgIndex + 1
                  : currentImgIndex
              } / ${updatedResults.images.length}`}
            </div>
          </div>
          <div id="imageContainer">
            <img
              class="ui big image"
              src={currentImg.preview}
              alt={currentImg.preview}
            />
          </div>
        </div>
        <div class="content">
          <div style="height: 100%;">
            <div class="ui aligned two column grid">
              <div class="row">
                <div class="left aligned column">
                  <h2 class="ui header">Results</h2>
                </div>
                <div class="right aligned column">
                  <h2 class="ui header">
                    <button
                      class="ui compact icon primary button"
                      class:disabled={numReviewedImgs <= 0}
                      on:click={() => {
                        window.$("#saveModal").modal("show");
                      }}
                    >
                      <i class="save icon" />
                      Save Progress
                    </button>
                  </h2>
                </div>
              </div>
              <div>
                <h3>Detection</h3>
              </div>
              {#each currentImg.detections as detection}
                <div class="row" style="padding-bottom: 0;">
                  <div class="column">
                    <div
                      class="ui large horizontal label"
                      class:green={detection.label === "animal"}
                      class:purple={detection.label === "person"}
                      class:brown={detection.label === "vehicle"}
                      class:grey={detection.deleted}
                    >
                      {detection.label}
                    </div>
                    <div
                      class="ui large horizontal label"
                      class:orange={detection.conf <= confThresh + colourSplit}
                      class:olive={confThresh + colourSplit < detection.conf &&
                        detection.conf < 1 - colourSplit}
                      class:green={detection.conf >= 1 - colourSplit}
                      class:grey={detection.deleted}
                    >
                      {(Number(detection.conf) * 100).toPrecision(
                        inputParams.conf_digits
                      )}%
                    </div>
                  </div>

                  <div class="right aligned column">
                    {#if detection.deleted}
                      <button
                        class="ui small icon button"
                        style="padding: 6px;"
                        on:click={() => {
                          undoMarkForDeletion(detection);
                          forceUpdate();
                        }}
                      >
                        <i class="undo icon" />
                      </button>
                    {:else}
                      <button
                        class="ui small red inverted icon button"
                        style="padding: 6px;"
                        on:click={() => {
                          markForDeletion(detection);
                          forceUpdate();
                          if (currentImg.detections.length === 1) {
                            nextImage();
                          }
                        }}
                      >
                        <i class="times icon" />
                      </button>
                    {/if}
                  </div>
                </div>
              {:else}
                <div class="row">
                  <div class="column">
                    {#if currentImg.markedAsAnimal}
                      <div class="ui large green horizontal label">animal</div>
                      <div class="ui large green horizontal label">100%</div>
                    {:else}
                      <div class="ui large black horizontal label">empty</div>
                      <div class="ui large horizontal label">N/A</div>
                    {/if}
                  </div>
                  <div class="right aligned column">
                    {#if currentImg.markedAsAnimal}
                      <button
                        class="ui small icon button"
                        style="padding: 6px;"
                        on:click={() => {
                          undoMarkAsAnimal(currentImg);
                        }}
                      >
                        <i class="undo icon" />
                      </button>
                    {:else}
                      <button
                        class="ui small icon button"
                        style="padding: 6px;"
                        on:click={() => {
                          markAsAnimal(currentImg);
                          nextImage();
                        }}
                      >
                        <i class="paw icon" />
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
              <!-- {/if} -->
            </div>
          </div>
          <div>
            <button
              class="ui left floated compact icon button"
              class:disabled={currentImgIndex === 0}
              on:click={prevImage}
            >
              <i class="arrow left icon" />
              Prev
            </button>
            <button
              class="ui right floated compact icon button"
              on:click={nextImage}
            >
              {#if currentImgIndex === updatedResults.images.length - 1}
                Finish
                <i class="check icon" />
              {:else}
                Next
                <i class="arrow right icon" />
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
    <div class="ui green bottom attached progress" id="progress">
      <div class="bar" />
    </div>
  </div>
  <div class="ui tiny modal" id="saveModal">
    <div class="header">Save Progress</div>
    <div class="content">
      <div class="description">
        This action will move
        {numReviewedImgs}
        images to their associated folders
      </div>
    </div>
    <div class="actions">
      <div
        class="ui button"
        on:click={() => {
          window.$(".ui.modal").modal("hide");
        }}
      >
        Cancel
      </div>
      <div
        class="ui primary button"
        on:click={() => {
          saveUpdatedResults();
        }}
      >
        Save
      </div>
    </div>
  </div>
  <div class="ui tiny modal" id="finishedModal">
    <div class="header">Review completed!</div>
    <div class="content">
      <div class="description">
        <div class="ui placeholder segment">
          <div class="ui icon header">
            <i class="green check icon" />
            All images have been reviewed
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div
        class="ui button"
        on:click={() => {
          window.$(".ui.modal").modal("hide");
        }}
      >
        Close
      </div>
      <div
        class="ui primary button"
        on:click={() => {
          saveUpdatedResults();
        }}
      >
        Save
      </div>
    </div>
  </div>
</Page>
