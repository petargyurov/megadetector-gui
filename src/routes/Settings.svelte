<script>
  import Page from "../components/Page.svelte";
  import { onMount } from "svelte";
  import Card from "../components/Card.svelte";
  import { settings } from "../userSettings.js";

  let settingsCopy = {};

  onMount(async () => {
    settingsCopy = settings.store;

    // initialise inputs
    window.$("#showImageTransition").checkbox({
      onChange: () => {
        settingsCopy.showImageTransition = !settingsCopy.showImageTransition;
      },
    });
    window.$("#showFullImagePath").checkbox({
      onChange: () => {
        settingsCopy.showFullImagePath = !settingsCopy.showFullImagePath;
      },
    });
    window.$(".ui.slider").slider({
      min: 0,
      max: 100,
      start: settings.get("defaultConfidenceThreshold"),
      step: 5,
      smooth: false,
      onChange: (v) => {
        settingsCopy.defaultConfidenceThreshold = v;
      },
    });
  });

  const saveSettings = () => {
    settings.store = settingsCopy;
  };
</script>

<Page title="Settings">
  <div class="column" style="width: 80%;">
    <Card>
      <div class="ui grid">
        <div class="four column row">
          <div class="eight wide left floated column">
            <h4 class="ui header" style="margin-bottom: 0;">
              Show Image Transition
            </h4>
            <div class="meta">
              <span
                >"Whether to render the animation when cycling through images</span
              >
            </div>
          </div>
          <div class="eight wide right floated right aligned column">
            <div
              id="showImageTransition"
              class="ui toggle checkbox"
              class:checked={settingsCopy.showImageTransition ? true : null}
            >
              <input
                type="checkbox"
                name="showImageTransition"
                checked={settingsCopy.showImageTransition ? true : null}
              />
              <label for="showImageTransition" />
            </div>
          </div>
        </div>

        <div class="four column row">
          <div class="eight wide left floated column">
            <h4 class="ui header" style="margin-bottom: 0;">
              Show Full Image Path
            </h4>
            <div class="meta">
              <span>Whether to show full image path in the Review panel</span>
            </div>
          </div>
          <div class="eight wide right floated right aligned column">
            <div
              id="showFullImagePath"
              class="ui toggle checkbox"
              class:checked={settingsCopy.showFullImagePath ? true : null}
            >
              <input
                type="checkbox"
                name="showFullImagePath"
                checked={settingsCopy.showFullImagePath ? true : null}
              />
              <label for="showFullImagePath" />
            </div>
          </div>
        </div>

        <div class="four column row">
          <div class="eight wide left floated column">
            <h4 class="ui header" style="margin-bottom: 0;">
              Default Confidence Threshold
            </h4>
            <div class="meta">
              <span>The default level to which to set the slider to</span>
            </div>
          </div>
          <div class="eight wide right floated right aligned column">
            <div
              class="ui small primary labeled ticked slider"
              id="defaultConfidenceThreshold"
            />
          </div>
        </div>
      </div>
    </Card>
    <button class="ui positive right floated button" on:click={saveSettings}
      >Save</button
    >
  </div>
</Page>

<style>
</style>
