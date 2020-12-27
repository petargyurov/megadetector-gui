<script>
  import router from "page";

  import Sidebar from "./components/Sidebar.svelte";

  // Routes
  import Home from "./routes/Home.svelte";
  import Detect from "./routes/Detect.svelte";
  import Review from "./routes/Review.svelte";
  import Models from "./routes/Models.svelte";

  let page;
  let params;

  router("/", () => (page = Home));
  router("/detect", () => (page = Detect));
  router("/review", () => (page = Review));
  router(
    "/review/:resultsPath",
    (ctx, next) => {
      params = ctx.params;
      next();
    },
    () => (page = Review)
  );
  router("/models", () => (page = Models));
  router.start();
  router.show("/");
</script>

<style>
</style>

<main>
  <Sidebar />
  <div class="pusher" style="padding-right: 21em;">
    <svelte:component this={page} {params} />
  </div>
</main>
