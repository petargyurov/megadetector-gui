<script>
  import { onMount } from "svelte";
  import Page from "../components/Page.svelte";
  const fs = require("fs");
  const path = require("path");
  const { dialog } = require("electron").remote;

  var images = [];
  var categories;
  var inputParams;
  var confThresh;
  var colourSplit;
  var currentImg;
  var resultsPath;
  var markAs;

  const selectFolder = () => {
    dialog.showOpenDialog({ properties: ["openFile"] }).then((result) => {
      resultsPath = result.filePaths[0];
      readResults();
    });
  };

  const readResults = async () => {
    fs.readFile(resultsPath, "utf8", (err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`);
      } else {
        // parse JSON string to JSON object
        const results = JSON.parse(data);
        console.log(results);
        images = results.images;
        categories = results.detection_categories;
        inputParams = results.info.input_params;
        confThresh = inputParams.render_conf_threshold;
        console.log(inputParams.conf_digits);
        colourSplit = (1 - confThresh) / 3.0;
        currentImg = images[0];
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
    images.shift(); // destructive
    if (images.length == 0) {
      currentImg = { end: true }; // TODO: some sort of signal needed for UI to signify end
    }
    currentImg = images[0];
    updateMarkAs();
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
      <div class="ui fluid horizontal card" style="width: 100%;">
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
            <button class="ui left floated compact icon button">
              <i class="arrow left icon" />
              Prev
            </button>
          </div>
          <div class="ui fluid buttons">
            <button
              class="ui gray button"
              on:click={() => {
                window.$('.ui.modal').modal('show');
              }}>Mark as
              {markAs}
            </button>
            <button
              class="ui positive button"
              on:click={nextImage}>Correct</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
  <div class="ui tiny modal">
    <div class="header">Are you sure you want to mark as {markAs}?</div>
    <div class="content">
      <div class="description">
        The prediction will be overwritten and the original image will placed in
        the "{markAs}" folder.
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
      <div class="ui primary button">Yes</div>
    </div>
  </div>
</Page>