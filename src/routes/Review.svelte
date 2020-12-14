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
  var resultsPath; //= "C:\\Users\\pgyur\\Desktop\\Demo\\output\\results.json"; // TODO:

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
      }
    });
  };

  onMount(async () => {
    window.$(".message .close").on("click", function () {
      window.$(this).closest(".message").transition("fade");
    });
  });

  const nextImage = () => {
    images.shift(); // destructive
    if (images.length == 0) {
      currentImg = null; // TODO: some sort of signal needed for UI to signify end
    }
    currentImg = images[0];
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
      <div class="ui fluid horizontal card" style="width: 90%;">
        <div>
          <img
            class="ui big image"
            src={currentImg ? currentImg.preview : ''} />
        </div>
        <div class="content">
          <div style="height: 90%;">
            <h2 class="ui header">Results</h2>
            <div class="meta">
              <span
                class="category">{currentImg ? path.basename(currentImg.preview) : 'Loading...'}
              </span>
            </div>
            {#if currentImg}
              <div class="ui aligned two column grid" style="margin-top: 2rem;">
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
          <div class="ui fluid buttons">
            <button class="ui red button">Wrong</button>
            <button
              class="ui positive button"
              on:click={nextImage}>Right</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</Page>
