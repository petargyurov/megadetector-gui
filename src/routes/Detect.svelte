<script>
  import { onMount } from "svelte";
  import Page from "../components/Page.svelte";
  import Card from "../components/Card.svelte";

  onMount(async () => {
    window.$(".ui.dropdown").dropdown();
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
  <button
    slot="button"
    class="ui right labeled icon green button"
    onclick="runMegaDetector(10)">
    <i class="play icon" />
    Process
  </button>
  <div
    slot="progressBar"
    class="ui green progress"
    id="detectProgressBar"
    style="margin-bottom: 0;">
    <div class="bar" />
  </div>

  <div slot="main" class="column">
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
                onclick="testFunc()">Import Data</button>
              <span id="selectedDirectory" class="ui small grey text" />
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
  </div>
</Page>

<!-- <div
  class="ui one column divided grid container"
  style="margin-left: 1em; margin-top: 1em;">
  <div class="row">
    <div class="column">
      <div class="ui grid">
        <div class="row">
          <div class="fourteen wide column">
            <h1 class="ui header">Detect</h1>
          </div>
          <div class="column" style="padding-left: 0;" />
        </div>
      </div>
      <div
        class="ui green progress"
        id="detectProgressBar"
        style="margin-bottom: 0;">
        <div class="bar" />
      </div>
      <div class="ui divider" />
    </div>
  </div>
  <div class="row">
    <div class="column">
      <Card title="Configure">
        <div class="content">
          <div class="header">Configure</div>
          <div class="ui divider" />
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
                  onclick="testFunc()">Import Data</button>
                <span id="selectedDirectory" class="ui small grey text" />
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
    </div>
  </div>
</div> -->
