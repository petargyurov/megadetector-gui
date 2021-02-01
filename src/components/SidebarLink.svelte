<script>
  export let title;
  export let href;
  export let icon;
  export let redirectCallback;
  export let customStyle;
</script>

<div
  class="item link"
  style={customStyle || ""}
  on:click={() => {
    redirectCallback(href);
  }}
>
  <h4><i class="{icon} icon" /> {title}</h4>
</div>

<style>
  .link {
    cursor: pointer;
  }
</style>
