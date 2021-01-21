<script crossorigin>
  import router from "page";

  import Sidebar from "./components/Sidebar.svelte";
  import { registerErrorHandlers } from "./errors";

  // Routes
  import Home from "./routes/Home.svelte";
  import Detect from "./routes/Detect.svelte";
  import Review from "./routes/Review.svelte";
  import Documentation from "./routes/Documentation.svelte";
  import Settings from "./routes/Settings.svelte";

  let page;
  let params;

  registerErrorHandlers();

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
  router("/documentation", () => (page = Documentation));
  router("/settings", () => (page = Settings));
  router("*", () => null); // TODO: why does this work?
  router.start();
  router.show("/");
</script>

<main>
  <Sidebar />
  <div class="pusher" style="padding-right: 21em;">
    <svelte:component this={page} {params} />
  </div>
</main>

<style>
</style>
