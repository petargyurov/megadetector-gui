<script>
  import Page from "../components/Page.svelte";
  import { onMount } from "svelte";
  import Card from "../components/Card.svelte";
  import { displayErrorToast, logToFile } from "../errors";

  const fs = require("fs");
  const path = require("path");

  let settings = [];
  let updatedSettings;

  onMount(async () => {
    window.$(".ui.checkbox").checkbox();

    fs.readFile("settings.json", "utf8", (err, data) => {
      if (err) {
        displayErrorToast("error", err);
        logToFile(err, "ERROR");
      } else {
        settings = JSON.parse(data);
        updatedSettings = JSON.parse(data);
      }
    });
  });

  const saveSettings = () => {
    let valid = true;
    for (const [name, setting] of Object.entries(settings)) {
      let newValue = setting.value;
      if (setting.UI === "checkbox") {
        newValue = window.$(`#${name}`).checkbox("is checked");
      } else if (setting.UI === "input") {
        newValue = window.$(`#${name}`).val();
        if (setting.type === "float") {
          newValue = parseFloat(newValue);
        } else if (setting.type === "integer") {
          newValue = parseInt(newValue, 10);
        }
        if (setting.type !== "string") {
          if (
            isNaN(newValue) ||
            newValue < setting.validation.min ||
            newValue > setting.validation.max
          ) {
            window.$(`#${name}ParentDiv`).addClass("error");
            valid = false;
            break;
          } else {
            window.$(`#${name}ParentDiv`).removeClass("error");
          }
        }
      }
      updatedSettings[name].value = newValue;
    }
    if (valid) {
      fs.writeFileSync(
        "settings.json",
        JSON.stringify(updatedSettings, null, 4)
      );
    }
    console.log(updatedSettings);
  };
</script>

<Page title="Settings">
  <div class="column" style="width: 80%;">
    <Card>
      <div class="ui grid">
        {#each Object.entries(settings) as [s, setting]}
          <div class="four column row">
            <div class="eight wide left floated column">
              <h4 class="ui header" style="margin-bottom: 0;">
                {setting.displayName}
              </h4>
              <div class="meta">
                <span>{setting.description}</span>
              </div>
            </div>
            <div class="eight wide right floated right aligned column">
              {#if setting.UI === "checkbox"}
                <div
                  id={s}
                  class="ui toggle checkbox"
                  class:checked={setting.value ? true : null}
                >
                  <input
                    type="checkbox"
                    name={s}
                    checked={setting.value ? true : null}
                  />
                  <label for={s} />
                </div>
              {:else if setting.UI === "input"}
                <div id={`${s}ParentDiv`} class="ui right labeled input">
                  <input id={s} type="text" value={setting.value} />
                  <div class="ui basic label">%</div>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <p>loading...</p>
        {/each}
      </div>
    </Card>
    <button class="ui positive right floated button" on:click={saveSettings}
      >Save</button
    >
  </div>
</Page>

<style>
</style>
