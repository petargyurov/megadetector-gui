<script>
  import router from "page";

  import Sidebar from "./components/Sidebar.svelte";

  // Routes
  import Home from "./routes/Home.svelte";
  import Detect from "./routes/Detect.svelte";
  import Review from "./routes/Review.svelte";
  import Documentation from "./routes/Documentation.svelte";

  let page = Home;
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
  router("/documentation", () => (page = Documentation));

  router.start();

  // Configure a toast for general error handling
  const displayErrorToast = (type, error) => {
    window.$("body").toast({
      class: "red",
      showIcon: "bug",
      displayTime: 0,
      message: "An unexpected error occured!",
      className: {
        icon: "white icon",
      },
      actions: [
        {
          text: "Dismiss",
        },
        {
          text: "Copy Error",
          class: "black",
          click: function () {
            const errorMsg = {
              type,
              page: window.location.href,
              error,
            };
            navigator.clipboard.writeText(JSON.stringify(errorMsg, null, 4));
          },
        },
      ],
    });
  };

  window.onerror = function (msg, url, line, col, error) {
    displayErrorToast("error", error.stack);
  };

  window.onunhandledrejection = (e) => {
    displayErrorToast("rejection", e.reason.stack);
  };
</script>

<style>
</style>

<main>
  <Sidebar />
  <div class="pusher" style="padding-right: 21em;">
    <svelte:component this={page} {params} />
  </div>
</main>
