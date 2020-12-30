<script>
  import Page from "../components/Page.svelte";
  import { onMount } from "svelte";
  const path = require("path");

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
      <h3 class="ui header">Step 2: Detection</h3>
      <p>
        With the configuration all done, it's time to initiate the detection
        process.
      </p>
      <h2 class="ui sub header">2.1 Begin Processing</h2>
      <div>
        Pressing the
        <button class="ui positive compact button">Process</button>
        button will begin the detection process. The application will take some
        time to initiate the model. This can take up to a minute.
      </div>
      <h2 class="ui sub header">2.2 Monitoring Progress</h2>
      <p>
        As soon as the model has been loaded, images will start being processed.
        You can monitor the progress in the UI.
      </p>
      <div>
        <div class="ui large compact label" style="margin-right: 5px;">
          <i class="images outline icon" />
          <span id="pos">16/123</span>
        </div>
        displays the current image and the total image count.
      </div>
      <p />
      <div>
        <div class="ui large compact label" style="margin-right: 5px;">
          <i class="clock icon" /><span id="eta">00:05:36</span>
        </div>
        displays the estimated remaining time (HH:MM:SS). It updates after each
        image. May not be very accurate for a small number of images.
      </div>
      <p />
      <p>
        And of course the progress bar will show the overall progress as a
        percentage.
      </p>
      <h3 class="ui header">Step 3: Review</h3>
      <p>
        Once the detection finishes, a pop-up window will be displayed asking
        you to continue to the Review process. You may decline and initiate the
        Review process another time if you wish. For more information on this,
        see the FAQ
        <span class="ui label">
          <i class="question icon" />How do I resume my review?
        </span>
      </p>
      <h2 class="ui sub header">3.1 Interface Overview</h2>
      <p>
        Hover over the various user interface elements below to get a quick
        description of what they do
      </p>
      <!-- UI DEMO -->
      <div class="ui horizontal card container" style="width: 70%;">
        <div>
          <div
            class="left aligned small floating ui label"
            data-inverted=""
            data-tooltip="Current image filename and total image count"
            data-position="bottom center">
            <i class="images outline icon" />
            demo.JPG
            <div class="detail">16/123</div>
          </div>
          <div
            id="imageContainer"
            data-inverted=""
            data-tooltip="Progress bar showing percentage of reviewed images"
            data-position="bottom left">
            <img
              class="ui large image"
              src={path.join(process.cwd(), 'src', 'assets', 'demo.JPG')}
              alt="demo" />
          </div>
        </div>
        <div class="content">
          <div style="height: 87%;">
            <div class="ui aligned two column grid">
              <div class="row">
                <div class="left aligned column">
                  <h3 class="ui header">Results</h3>
                </div>
                <div class="right aligned column">
                  <h2 class="ui header">
                    <button
                      class="ui small compact icon primary button"
                      data-inverted=""
                      data-tooltip="Save updated classification data and move reviewed images into folders"
                      data-position="bottom center">
                      <i class="save icon" />
                      Save Progress
                    </button>
                  </h2>
                </div>
              </div>
              <div class="row" style="padding: 0">
                <div class="column">
                  <h4 class="ui header">Label</h4>
                </div>
                <div class="right aligned column">
                  <h4 class="ui header">Confidence</h4>
                </div>
              </div>

              <div class="row">
                <div class="column">
                  <div
                    class="ui medium green horizontal label"
                    data-inverted=""
                    data-tooltip="The model's predicted classification"
                    data-position="bottom center">
                    animal
                  </div>
                </div>
                <div class="right aligned column">
                  <div
                    class="ui medium orange horizontal label"
                    data-inverted=""
                    data-tooltip="The model's confidence for this classification"
                    data-position="bottom center">
                    67%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-bottom: 1em;">
            <button
              class="ui left small floated compact icon button"
              data-inverted=""
              data-tooltip="Returns to the previous image"
              data-position="right center">
              <i class="arrow left icon" />
              Prev
            </button>
          </div>
          <div class="ui small fluid buttons">
            <button
              class="ui gray button"
              data-inverted=""
              data-tooltip="Changes classification and goes to next image"
              data-position="bottom center">
              Mark as empty
            </button>
            <button
              class="ui positive button"
              data-inverted=""
              data-tooltip="Accepts classification and goes to next image"
              data-position="bottom center">Correct</button>
          </div>
        </div>
        <div class="ui green bottom attached progress" data-percent="10">
          <div class="bar" />
        </div>
      </div>
      <!-- UI DEMO -->

      <h2 class="ui sub header">3.2 Reviewing</h2>
      <h2 class="ui sub header">3.3 Saving Progress</h2>
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
