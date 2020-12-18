<script>
  import Page from "../components/Page.svelte";
</script>

<style>
</style>

<Page title="Welcome">
  <div class="column">
    <h2 class="ui center aligned header">What would you like to do?</h2>
    <div class="ui placeholder segment">
      <div class="ui two column stackable center aligned grid">
        <div class="ui vertical divider">Or</div>
        <div class="middle aligned row">
          <div class="column">
            <div class="ui icon header">
              <i class="eye icon" />Infer bounding boxes on a set of images
            </div>
            <a class="ui black button" href="/detect">Detect</a>
          </div>
          <div class="column">
            <div class="ui icon header">
              <i class="edit icon" />Verify and correct past inference data
            </div>
            <a class="ui black button" href="/review">Review</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</Page>
