<script>
  export let title;
</script>

<div class="ui fluid card">
  <div class="content">
    {#if title}
      <div class="header">{title}</div>
      <div class="ui divider" />
    {/if}
    <slot />
  </div>
</div>
