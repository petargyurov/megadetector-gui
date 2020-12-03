<script>
  export let title;
  export let content;
</script>

<style>
  .card {
    width: 50%;
  }
</style>

<div class="ui card">
  <div class="content">
    <div class="header">{title}</div>
    <div class="ui divider" />
    <slot />
  </div>
</div>
