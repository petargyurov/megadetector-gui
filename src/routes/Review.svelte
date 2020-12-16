<script>
  import { onMount } from "svelte";
  import Page from "../components/Page.svelte";
  const fs = require("fs");
  const path = require("path");
  const { dialog } = require("electron").remote;

  var currentResults;
  var updatedResults;

  var categories;
  var inputParams;
  var confThresh;
  var colourSplit;
  var currentImg;
  var currentImgIndex;
  var resultsPath;
  var markAs;

  const updateResult = (img, label) => {
    for (const i of updatedResults.images) {
      if (path.basename(i.file) === path.basename(img)) {
        i.edited = true;
        if (label === "empty") {
          i.max_detection_conf = 0;
          i.detections = [];
        } else if (label === "animal") {
          // to handle Undo case, check if image had bbox and other data in original results
          let wasAnimal = false;
          let pastImg = currentResults.images.filter((i) => {
            return path.basename(i.file) === path.basename(img);
          })[0];

          if (pastImg.detections.length > 0) {
            wasAnimal = true;
            i.edited = false;
          }
          i.max_detection_conf = wasAnimal ? pastImg.max_detection_conf : 1;
          i.detections = [
            {
              category: "1",
              conf: wasAnimal ? pastImg.detections[0].conf : 1,
              bbox: wasAnimal ? pastImg.detections[0].bbox : [],
            },
          ];
        }
        break;
      }
    }
    nextImage();
  };

  const selectFolder = () => {
    dialog.showOpenDialog({ properties: ["openFile"] }).then((result) => {
      resultsPath = result.filePaths[0];
      readResults();
    });
  };

  const readResults = () => {
    fs.readFile(resultsPath, "utf8", (err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`);
      } else {
        // parse JSON string to JSON object
        currentResults = JSON.parse(data);
        updatedResults = JSON.parse(data); // make a copy to preserve the original
        categories = updatedResults.detection_categories;
        inputParams = updatedResults.info.input_params;
        confThresh = inputParams.render_conf_threshold;
        colourSplit = (1 - confThresh) / 3.0;
        currentImg = updatedResults.images[0];
        currentImgIndex = 0;

        window.$("#progress").progress({
          total: updatedResults.images.length,
          percent: ((currentImgIndex + 1) / updatedResults.images.length) * 100,
        });
        updateMarkAs();
      }
    });
  };

  const updateMarkAs = () => {
    markAs = currentImg.detections.length > 0 ? "empty" : "animal";
  };

  onMount(async () => {
    window.$(".ui.modal").modal();
  });

  const nextImage = () => {
    if (currentImgIndex + 1 >= updatedResults.images.length) {
      currentImg = updatedResults.images[currentImgIndex]; // pretend to update image so Svelte can pick up the changes
    } else {
      currentImg = updatedResults.images[currentImgIndex + 1];
      currentImgIndex += 1;
      window.$(".ui.big.image, .horizontal.label").transition("pulse");
    }
    window.$("#progress").progress({
      percent: ((currentImgIndex + 1) / updatedResults.images.length) * 100,
    });
    updateMarkAs();
  };

  const prevImage = () => {
    if (currentImgIndex > 0) {
      currentImg = updatedResults.images[currentImgIndex - 1];
      currentImgIndex -= 1;
      window.$("#progress").progress({
        percent: ((currentImgIndex + 1) / updatedResults.images.length) * 100,
      });
      updateMarkAs();
      window.$(".ui.big.image, .horizontal.label").transition("pulse");
    }
  };
</script>

<style>
</style>

<Page title="Review">
  <div class="column">
    {#if !resultsPath}
      <div class="ui placeholder segment">
        <div class="ui icon header">
          <i class="edit icon" />
          Review model predictions
        </div>
        <div class="ui primary button" on:click={selectFolder}>
          Select Results File
        </div>
      </div>
    {:else}
      <div
        class="ui fluid horizontal card"
        style="width: 100%; margin-bottom: 0;">
        <div>
          <img
            class="ui big image"
            src={currentImg ? currentImg.preview : ''}
            alt={currentImg ? currentImg.preview : 'Image'} />
        </div>
        <div class="content">
          <div style="height: 87%;">
            {#if currentImg}
              <div class="ui aligned two column grid">
                <div class="row">
                  <div class="left aligned column">
                    <h2 class="ui header">Results</h2>
                  </div>
                  <div class="right aligned column">
                    <h2 class="ui header">
                      <button class="ui compact icon button">
                        <i class="save icon" />
                        Save Progress
                      </button>
                    </h2>
                  </div>
                </div>
                <div class="meta">
                  <span
                    class="category">{currentImg ? path.basename(currentImg.preview) : 'Loading...'}
                  </span>
                </div>

                <div class="row">
                  <div class="column">
                    <h3 class="ui header">Label</h3>
                  </div>
                  <div class="right aligned column">
                    <h3 class="ui header">Confidence</h3>
                  </div>
                </div>
                {#each currentImg.detections as detection}
                  <div class="row">
                    <div class="column">
                      <div
                        class="ui large horizontal label"
                        class:green={categories[detection.category] === 'animal'}
                        class:grey={categories[detection.category] !== 'animal'}>
                        {categories[detection.category]}
                      </div>
                      {#if currentImg.edited}
                        <div class="ui large horizontal label">edited</div>
                      {/if}
                    </div>
                    <div class="right aligned column">
                      <div
                        class="ui large horizontal label"
                        class:orange={detection.conf <= confThresh + colourSplit}
                        class:olive={confThresh + colourSplit < detection.conf && detection.conf < 1 - colourSplit}
                        class:green={detection.conf >= 1 - colourSplit}>
                        {(Number(detection.conf) * 100).toPrecision(inputParams.conf_digits)}%
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="row">
                    <div class="column">
                      <div class="ui large black horizontal label">empty</div>
                      {#if currentImg.edited}
                        <div class="ui large horizontal label">edited</div>
                      {/if}
                    </div>
                    <div class="right aligned column">
                      <div class="ui large horizontal label">N/A</div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
          <div style="margin-bottom: 3em;">
            <button
              class="ui left floated compact icon button"
              class:disabled={currentImgIndex === 0}
              on:click={prevImage}>
              <i class="arrow left icon" />
              Prev
            </button>
          </div>
          <div class="ui fluid buttons">
            <button
              class="ui gray button"
              on:click={() => {
                window.$('.ui.modal').modal('show');
              }}>
              {#if currentImg && currentImg.edited}
                Undo
              {:else}Mark as {markAs}{/if}
            </button>
            <button
              class="ui positive button"
              class:disabled={updatedResults && currentImgIndex === updatedResults.images.length - 1}
              on:click={nextImage}>Correct</button>
          </div>
        </div>
      </div>
    {/if}
    <div class="ui green bottom attached progress" id="progress">
      <div class="bar" />
    </div>
  </div>
  <div class="ui tiny modal">
    <div class="header">
      {#if currentImg && currentImg.edited}
        Are you sure you want to undo?
      {:else}Are you sure you want to mark as {markAs}?{/if}
    </div>
    <div class="content">
      <div class="description">
        {#if currentImg && currentImg.edited}
          {#if markAs === 'animal'}
            Bounding box and confidence data will be restored
          {:else if markAs === 'empty'}Image will be labelled as empty{/if}
        {:else if markAs === 'animal'}
          Confidence will be set to 100%. No bounding box data will exist.
        {:else if markAs === 'empty'}Image will be labelled as empty{/if}
      </div>
    </div>
    <div class="actions">
      <div
        class="ui button"
        on:click={() => {
          window.$('.ui.modal').modal('hide');
        }}>
        Cancel
      </div>
      <div
        class="ui primary button"
        on:click={() => {
          window.$('.ui.modal').modal('hide');
          updateResult(currentImg.file, markAs);
        }}>
        Yes
      </div>
    </div>
  </div>
</Page>
