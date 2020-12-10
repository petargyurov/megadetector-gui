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
      <h1 class="ui header">{title}</h1>
      <div class="ui divider" />
    </div>
  </div>
  <div class="row">
    <slot>
      <div class="column missing">
        <div class="ui placeholder segment">
          <div class="ui icon header">
            <i class="tools icon" />
            Under Construction!
          </div>
        </div>
      </div>
    </slot>
  </div>
</div>
