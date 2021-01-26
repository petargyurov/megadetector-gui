<script>
  import { onMount, onDestroy } from "svelte";
  import Page from "../components/Page.svelte";
  import Card from "../components/Card.svelte";
  import { backend } from "../bindings.js";
  import router from "page";
  const path = require("path");
  const { dialog } = require("electron").remote;
  import { settings } from "../userSettings.js";

  let modelSelected = false;
  let folderSelected = false;
  let selectedFolder = "";
  let processing = false;
  let autosort = false;
  let countdownID;

  const selectFolder = () => {
    dialog.showOpenDialog({ properties: ["openDirectory"] }).then((result) => {
      selectedFolder = result.filePaths[0];
      folderSelected = selectedFolder ? true : false;
    });
  };

  onDestroy(() => {
    if (backend.childProcess) {
      backend.stopProcess();
      window.$("body").toast({
        class: "error",
        showIcon: "exclamation circle",
        displayTime: 5000,
        message: "Detection interrupted!",
      });
    }
    window.clearInterval(countdownID);
  });

  onMount(async () => {
    window.$(".ui.dropdown").dropdown();
    window.$(".ui.dropdown").dropdown({
      onChange: () => {
        modelSelected = true;
      },
    });

    window.$(".ui.slider").slider({
      min: 0,
      max: 100,
      start: settings.get("defaultConfidenceThreshold"),
      step: 5,
      smooth: false,
    });
    window.$("#detectProgressBar").progress({
      onSuccess: () => {
        // Give the backend process a bit of time to finish closing.
        // This is to prevent the interruption toast from popping up when users click the Human Review button
        // TODO: better way to handle this?
        setTimeout(() => {
          window.$("#finishedModal").modal("show");
          window.$("#stopButton").addClass("disabled");
        }, 500);
      },
    });
    window.$(".ui.checkbox").checkbox({
      onChange: () => {
        autosort = !autosort;
      },
    });

    let end = new Date();
    countdownID = setInterval(function () {
      let now = new Date();

      let eta = window.$("#eta").text().split(":");

      let hours = parseInt(eta[0], 10) || 0;
      let mins = parseInt(eta[1], 10) || 0;
      let secs = parseInt(eta[2], 10) || 0;

      end.setHours(now.getHours() + hours);
      end.setMinutes(now.getMinutes() + mins);
      end.setSeconds(now.getSeconds() + secs);

      let T = end - new Date();
      if (T > 0) {
        let H = Math.floor((T % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          .toString()
          .padStart(2, "0");
        let M = Math.floor((T % (1000 * 60 * 60)) / (1000 * 60))
          .toString()
          .padStart(2, "0");
        let S = Math.floor((T % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, "0");

        window.$("#eta").text(`${H}:${M}:${S}`);
      } else {
        window.$("#eta").text("--:--:--");
      }
    }, 1000);
  });

  const resetUI = () => {
    processing = false;
    folderSelected = false;
    selectedFolder = "";
    window.$("#detectProgressBar").progress("set percent", 0);
    window.$("#pos").text("--/--");
    window.$("#eta").text("--:--:--");
    window.$(".ui.dropdown").dropdown("clear");
    window.$(".ui.slider").slider("set value", 50);
  };
</script>

<Page title="Detect">
  <div class="column" style="width: 60%;">
    <Card title="Configure">
      <div class="content">
        <div class="ui two column grid">
          <div class="row">
            <div class="column">
              <h4 class="ui header" style="margin-bottom: 0;">
                Detection Model
              </h4>
              <div class="meta"><span>The trained model to use</span></div>
            </div>
            <div class="column">
              <div class="ui fluid medium selection dropdown">
                <i class="dropdown icon" />
                <div class="default text">Select Model</div>
                <div class="menu">
                  <h5 class="ui sub header">Base Models</h5>
                  <div class="item" data-value="1">MegaDetector v4</div>
                  <div class="ui divider" />
                  <h5 class="ui sub header">My Models</h5>
                  <div class="item disabled" data-value="0">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="column">
              <h4 class="ui header" style="margin-bottom: 0;">Data Folder</h4>
              <div class="meta">
                <span>The images you want to process</span>
              </div>
            </div>
            <div class="column">
              <button class="fluid ui primary button" on:click={selectFolder}
                >Import Data</button
              >
              <span id="selectedDirectory" class="ui small grey text"
                >{selectedFolder ? selectedFolder : ""}</span
              >
            </div>
          </div>
          <div class="row">
            <div class="column">
              <h4 class="ui header" style="margin-bottom: 0;">
                Confidence Threshold
              </h4>
              <div class="meta">
                <span>Results below this level will be classified as empty</span
                >
              </div>
            </div>
            <div class="column">
              <div
                class="ui small primary labeled ticked slider"
                id="slider-1"
              />
            </div>
          </div>
          <div class="row">
            <div class="column">
              <h4 class="ui header" style="margin-bottom: 0;">Auto-sort</h4>
              <div class="meta">
                <span
                  >Skip human review and automatically put original images in
                  categorised folders</span
                >
              </div>
            </div>
            <div class="column">
              <div class="ui toggle checkbox">
                <input type="checkbox" name="autosort" />
                <label for="autosort" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <Card>
      <div class="ui grid">
        <div class="center aligned row" style="padding-bottom: 0">
          <div class="four wide column" style="padding-right: 0">
            <div class="ui large fluid label">
              <i class="images outline icon" />
              <span id="pos">--/--</span>
            </div>
          </div>
          <div class="four wide column" style="padding-right: 0">
            <div class="ui large fluid label">
              <i class="clock icon" /><span id="eta">--:--:--</span>
            </div>
          </div>
          <div class="two wide column" />
          <div class="six wide column">
            {#if !processing}
              <button
                disabled={!(modelSelected && folderSelected)}
                class="ui right labeled fluid icon green button"
                on:click={() => {
                  processing = true;
                  let inputPath = window.$("#selectedDirectory").text();
                  let outputPath = path.join(inputPath, "output");
                  let conf =
                    Number(window.$(".ui.slider").slider("get value")) / 100.0;
                  backend.detect(inputPath, outputPath, conf, autosort);
                }}>
                <i class="play icon" />
                Process
              </button>
            {:else}
              <button
                id="stopButton"
                class="ui right labeled fluid icon red button loading disabled"
                on:click={() => {
                  window.$("#stopModal").modal("show");
                }}>
                <i class="stop icon" />
                Stop
              </button>
            {/if}
          </div>
        </div>
        <div class="row">
          <div class="sixteen wide column">
            <div
              class="ui green indicating progress"
              id="detectProgressBar"
              style="margin-bottom: 0;"
            >
              <div class="bar" style="height: 2.5em">
                <div class="progress" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
  <div class="ui tiny modal" id="stopModal">
    <div class="header">Are you sure you want to stop?</div>
    <div class="content">
      <div class="description">
        Images already processed will not be deleted.
      </div>
    </div>
    <div class="actions">
      <div
        class="ui button"
        on:click={() => {
          window.$(".ui.modal").modal("hide");
        }}
      >Back</div>
      <div
        class="ui red button"
        on:click={() => {
          window.$(".ui.modal").modal("hide");
          backend.stopProcess();
          resetUI();
        }}
      >Stop</div>
    </div>
  </div>
  <div class="ui tiny modal" id="finishedModal">
    <div class="header">Detection completed!</div>
    <div class="content">
      <div class="description">
        <div class="ui placeholder segment">
          <div class="ui icon header">
            <i class="green check icon" />
            All images have been processed.
            {#if autosort}
              <div>
                <span class="ui red text"
                  >(Some images may still be undergoing auto-sorting)</span
                >
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div
        class="ui button"
        on:click={() => {
          window.$(".ui.modal").modal("hide");
          resetUI();
        }}
      >Close</div>
      {#if !autosort}
        <div
          class="ui green button"
          on:click={() => {
            window.$(".ui.modal").modal("hide");
            const resultsPath = path.join(
              selectedFolder,
              "output",
              "results.json"
            );
            router.redirect(`/review/${resultsPath}`);
          }}
        >Human Review</div>
      {/if}
    </div>
  </div>
</Page>

<style>
</style>
