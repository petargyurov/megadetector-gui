<script>
  export let title;
  let x;
</script>

<style>
</style>

<div
  class="ui one column divided grid container"
  style="margin-left: 1em; margin-top: 1em;">
  <div class="row">
    <div class="column">
      <h1 class="ui header">{title}</h1>
      <div class="ui divider" />
    </div>
  </div>
  <div class="row">
    <slot>
      <h4 class="missing">Nothing Here!</h4>
    </slot>
  </div>
</div>
