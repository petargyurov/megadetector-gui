<script>
  import SidebarLink from "./SidebarLink.svelte";
  import { onMount } from "svelte";
  import router from "page";
  import { store } from "../userSettings.js";

  const path = require("path");
  const app = require("electron").remote.app;
  const version = app.getVersion();
  const isDev = process.env.APP_DEV
    ? process.env.APP_DEV.trim() == "true"
    : false;
  let redirectionPage = "";

  onMount(async () => {
    window.$("#interruptionModal").modal();
    window.$("#aboutModal").modal();
  });

  // before redirecting, make sure we aren't in the middle of processing something (e.g.: detection/review)
  const redirect = (page) => {
    redirectionPage = page;
    if (store.get("processing")) {
      window.$("#interruptionModal").modal("show");
    } else {
      router.redirect(page);
    }
  };
</script>

<div
  class="ui sidebar vertical menu left uncover visible"
  style="background-color: #f8f9fa; border: 0; box-shadow: 1;"
>
  <div
    style="padding: 1em; margin-bottom: 1em; cursor: pointer;"
    on:click={() => {
      window.$("#aboutModal").modal("show");
    }}
  >
    <h3>
      <img
        class="ui avatar image"
        src={isDev
          ? path.join(process.cwd(), "src", "assets", "icon.ico")
          : path.join(process.cwd(), "resources", "assets", "icon.ico")}
        alt="logo"
      />
      MegaDetector
      <span class="ui tiny grey text">v{version}</span>
    </h3>
  </div>

  <SidebarLink
    title="Detect"
    href="/detect"
    icon="eye"
    redirectCallback={redirect}
  />
  <SidebarLink
    title="Review"
    href="/review"
    icon="edit"
    redirectCallback={redirect}
  />
  <SidebarLink
    title="Documentation"
    href="/documentation"
    icon="book"
    redirectCallback={redirect}
  />
  <SidebarLink
    title="Settings"
    href="/settings"
    icon="cog"
    redirectCallback={redirect}
    customStyle="position: absolute; bottom: 0; width: 100%;"
  />
</div>

<div class="ui mini modal" id="interruptionModal">
  <div class="header">Are you sure you want to do this?</div>
  <div class="content">
    <div class="description">
      Navigating away from this page will interrupt what you were currently
      doing!
    </div>
  </div>
  <div class="actions">
    <div
      class="ui negative button"
      on:click={() => {
        router.redirect(redirectionPage);
      }}
    >
      Yes
    </div>
    <div
      class="ui green button"
      on:click={() => {
        window.$(".ui.modal").modal("hide");
      }}
    >
      Go Back
    </div>
  </div>
</div>

<div class="ui mini modal" id="aboutModal">
  <div class="header">MegaDetector GUI v{version}</div>
  <div class="content">
    <div class="description">
      <h3 class="ui header">
        <i class="fitted small user circle icon" />
        <div class="content">Author</div>
        <div class="sub header">Petar Gyurov</div>
      </h3>
      <h3 class="ui header">
        <i class="fitted small github icon" />
        <div class="content">Project GitHub</div>
        <div class="sub header">
          https://github.com/petargyurov/megadetector-gui
        </div>
      </h3>
      <h3 class="ui header">
        <i class="fitted small github icon" />
        <div class="content">Microsoft CameraTraps GitHub</div>
        <div class="sub header">https://github.com/microsoft/CameraTraps</div>
      </h3>
      <div class="ui divider" />
      <p class="ui tiny grey text">© 2021 Petar Gyurov</p>
    </div>
  </div>
</div>
