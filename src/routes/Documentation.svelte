<script>
  import Page from "../components/Page.svelte";
  import { onMount } from "svelte";

  onMount(async () => {
    window.$(".ui.accordion").accordion();
  });

  const faqs = [
    { question: "What is auto-sort?", answer: "" },
    {
      question: "Are the original images affected during detection?",
      answer: "",
    },
    { question: "What is confidence?", answer: "" },
    { question: "What classifications can I expect to see?", answer: "" },
    { question: "Can I train the model on my own data?", answer: "" },
    { question: "Help! My images aren't being sorted!", answer: "" },
    { question: "What do I with the results.json file?", answer: "" },
    { question: "Does the model output its bounding box data?", answer: "" },
    { question: "How do I resume my review?", answer: "" },
    { question: "How do I request a feature?", answer: "" },
  ];
</script>

<style>
</style>

<Page title="Documentation">
  <div class="column">
    <div class="ui segment">
      <h2 class="ui header">Getting Started</h2>
      <p>
        This application is used to speed up the manual process of filtering
        camera trap images. Camera traps can be set off by moving vegetation,
        debris and other factors that are not of interest; this results in tens
        or hundreds of empty images.
      </p>
      <p>
        In an effort to improve this mundane task, we can detect whether an
        animal is in the image using machine learning models. After the model
        makes its predictions, a human reviewer can quickly approve or correct
        the output for each image.
      </p>
      <p>
        At the end, the application will move each original image into either an
        <span class="ui label"> <i class="folder icon" />animal</span>
        or an
        <span class="ui label"> <i class="folder icon" />empty</span>
        folder, as well as produce bounding box data for its predictions.
      </p>
      <h2 class="ui sub header">The typical flow</h2>
      <div class="ui three fluid steps">
        <div class="step">
          <i class="cogs icon" />
          <div class="content">
            <div class="title">Configure</div>
            <div class="description">
              Import data and tell the model how strict it should be
            </div>
          </div>
        </div>
        <div class="step">
          <i class="eye icon" />
          <div class="content">
            <div class="title">Detect</div>
            <div class="description">
              Model tries to spot animals in your images
            </div>
          </div>
        </div>
        <div class="step">
          <i class="edit icon" />
          <div class="content">
            <div class="title">Review</div>
            <div class="description">
              Go through the model's predictions and correct them
            </div>
          </div>
        </div>
      </div>
      <h3 class="ui header">Step 1: Configuration</h3>
      <p>
        Open the Detect page. The following will explain how to configure the
        detection procedure.
      </p>
      <h2 class="ui sub header">1.1 Select the model</h2>
      <p>
        Currently the only available model is MegaDetector v4 (the latest
        version at the time)
      </p>
      <h2 class="ui sub header">1.2 Import Data</h2>
      <p>
        Select the folder that contains your images. You do not need to select
        the images themselves, just the parent foler.
      </p>
      <p>Multiple folder locations are not supported at this time.</p>
      <h2 class="ui sub header">1.3 Set Confidence Threshold</h2>
      <p>
        The model needs to know how confident it needs to be in its prediction
        to classify something as an animal. For example, if you set the
        threshold to 80% and the model makes a detection but is only 50%
        confident about it then it will classify that image as empty.
      </p>
      <h2 class="ui sub header">1.4 Auto-sort</h2>
      <p>
        When this is set to ON, the application will skip the review stage and
        automatically move the original images based on the predictions it just
        made.
      </p>
    </div>

    <div class="ui divider" />
    <div class="ui styled fluid accordion">
      {#each faqs as faq}
        <div class="ui medium header title">
          <i class="dropdown icon" />
          {faq.question}
        </div>
        <div class="content">
          <p>{faq.answer}</p>
        </div>
      {/each}
    </div>
  </div>
</Page>
