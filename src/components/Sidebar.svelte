<script>
  const path = require("path");
  const app = require("electron").remote.app;
  const version = app.getVersion();
  const isDev = process.env.APP_DEV
    ? process.env.APP_DEV.trim() == "true"
    : false;
</script>

<div
  class="ui sidebar vertical menu left uncover visible"
  style="background-color: #f8f9fa; border: 0; box-shadow: 1;"
>
  <div style="padding: 1em; margin-bottom: 1em;">
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

  <a class="item" href="/detect">
    <h4><i class="eye icon" /> Detect</h4>
  </a>
  <a class="item" href="/review">
    <h4><i class="edit icon" /> Review</h4>
  </a>
  <a class="item" href="/documentation">
    <h4><i class="book icon" /> Documentation</h4>
  </a>
  <a
    class="item"
    href="/settings"
    style="position: absolute; bottom: 0; width: 100%;">
    <h4><i class="cog icon" /> Settings</h4>
  </a>
</div>
