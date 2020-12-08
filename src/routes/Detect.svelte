<script>
  import { onMount } from "svelte";
  import Page from "../components/Page.svelte";
  import Card from "../components/Card.svelte";

  let modelSelected = false;
  let folderSelected = false;
  let selectedFolder = "";
  let processing = false;

  const selectFolder = () => {
    dialog.showOpenDialog({ properties: ["openDirectory"] }).then((result) => {
      selectedFolder = result.filePaths[0];
      folderSelected = true;
    });
  };

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
      start: 50,
      step: 5,
      smooth: false,
    });
    window.$("#detectProgressBar").progress();
  });
</script>

<style>
</style>

<Page title="Detect">
  <div class="column">
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
              <button
                class="fluid ui primary button"
                on:click={selectFolder}>Import Data</button>
              <span
                id="selectedDirectory"
                class="ui small grey text">{selectedFolder}</span>
            </div>
          </div>
          <div class="row">
            <div class="column">
              <h4 class="ui header" style="margin-bottom: 0;">
                Confidence Threshold
              </h4>
              <div class="meta">
                <span>Results below this level will be classified as empty</span>
              </div>
            </div>
            <div class="column">
              <div
                class="ui small primary labeled ticked slider"
                id="slider-1" />
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
                  runMegaDetector();
                }}>
                <i class="play icon" />
                Process
              </button>
            {:else}
              <button class="ui right labeled fluid icon red button">
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
              style="margin-bottom: 0;">
              <div class="bar" style="height: 2.5em">
                <div class="progress" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</Page>
