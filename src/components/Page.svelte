<script>
  export let title;
</script>

<style>
</style>

<div
  class="ui one column divided grid container"
  style="margin-left: 1em; margin-top: 1em;">
  <div class="row">
    <div class="column">
      <div class="ui grid">
        <div class="row">
          <div class="fourteen wide column">
            <h1 class="ui header">{title}</h1>
          </div>
          <div class="column" style="padding-left: 0;">
            <slot name="button" />
          </div>
        </div>
      </div>
      <slot name="progressBar" />
      <div class="ui divider" />
    </div>
  </div>
  <div class="row">
    <slot name="main">
      <h4 class="missing">Nothing Here!</h4>
    </slot>
  </div>
</div>
