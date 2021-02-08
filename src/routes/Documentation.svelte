<script>
  import { onMount } from "svelte";
  const path = require("path");

  const isDev = process.env.APP_DEV
    ? process.env.APP_DEV.trim() == "true"
    : false;

  onMount(async () => {
    window.$(".ui.accordion").accordion();
    window.$(".ui.search").search({
      source: faqs,
      onSelect: (answer) => {
        window.location.replace(`#q${answer.id - 1}`);
        window.$("#faqsAccordion").accordion("toggle", answer.id - 1);
      },
    });
  });

  const faqs = [
    {
      title: "What is auto-sort?",
      description:
        "Enabling auto-sort will simply skip the human review process and automatically move the original images into folders based on the model's predictions. This means some images may be categorised incorrectly.",
    },
    {
      title: "Are the original images affected during detection?",
      description: `No. The detector will make copies of your images on which it will draw bounding boxes. 
        Image location also remains unchanged during detection, unless you enable the Auto-sort option, 
        which will move your images into labelled folders at the end of the detection process.`,
    },
    {
      title: "What classifications can I expect to see?",
      description: "Currently, 'animal', 'person', 'vehicle' or 'empty'",
    },
    {
      title: "How are multiple detections handled?",
      description:
        "If an image contains multiple detections, you can edit each detection during the review process. Upon moving the image to a folder, it will be placed in a folder called 'multiple'",
    },
    {
      title: "What are all the extra columns in my CSV?",
      description:
        "The CSV file is enriched with EXIF data extracted from each image. This is information about the camera settings used at the time, as well as GPS data. Not all images come with EXIF data -- it usually depends on the camera setup.",
    },
    {
      title: "Why is detection so slow?",
      description:
        "The underlying MegaDetector model is not optimised all that well for computers that do not have a supported GPU. If you have the option of running this application on a machine with a GPU you can expect much faster processing.",
    },
    {
      title: "Can I train the model on my own data?",
      description: `Short answer: no. Advanced users may want to look into training the underlying MegaDetector model themselves but that is not supported in this application.`,
    },
    {
      title: "Does the model output its bounding box data?",
      description:
        "Yes. You can find this data in the JSON or CSV files found in the 'output' folder",
    },
    {
      title: "How do I resume my review?",
      description:
        "Go to the Review page and import 'results.json' file. If you are continuing an already started review, import the 'updated_results.json' file",
    },
    {
      title: "How do I request a feature?",
      description:
        "Create an issue at the project's GitHub page: https://github.com/petargyurov/megadetector-gui",
    },
  ];
</script>

<div
  class="ui one column divided grid container"
  style="margin-left: 1em; padding-top: 1em;"
>
  <div class="row">
    <div class="column">
      <div class="ui right floated basic segment search" style="margin: 0">
        <div class="ui icon input">
          <input class="prompt" type="text" placeholder="Search FAQs" />
          <i class="search icon" />
        </div>
        <div class="results" />
      </div>
      <h1 class="ui header">Documentation</h1>
      <div class="ui divider" />
    </div>
  </div>

  <div class="row">
    <div class="column">
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
        <span class="ui label"> <i class="folder icon" />animal</span>,
        <span class="ui label"> <i class="folder icon" />person</span>,
        <span class="ui label"> <i class="folder icon" />vehicle</span>,
        <span class="ui label"> <i class="folder icon" />multiple</span> or
        <span class="ui label"> <i class="folder icon" />empty</span>
        folder, as well as produce bounding box data for its predictions.
      </p>
      <h2 class="ui sub header">The typical flow</h2>
      <div class="ui three fluid steps">
        <div
          id="step1"
          class="link step"
          on:click={(x) => {
            window.$("#stepsAccordion").accordion("toggle", 0);
            window.$("#step1").toggleClass("active");
            window.$("#step2").removeClass("active");
            window.$("#step3").removeClass("active");
          }}
        >
          <i class="cogs icon" />
          <div class="content">
            <div class="title">Configure</div>
            <div class="description">
              Import data and tell the model how strict it should be
            </div>
          </div>
        </div>
        <div
          id="step2"
          class="link step"
          on:click={() => {
            window.$("#stepsAccordion").accordion("toggle", 1);
            window.$("#step1").removeClass("active");
            window.$("#step2").toggleClass("active");
            window.$("#step3").removeClass("active");
          }}
        >
          <i class="eye icon" />
          <div class="content">
            <div class="title">Detect</div>
            <div class="description">
              Model tries to spot animals in your images
            </div>
          </div>
        </div>
        <div
          id="step3"
          class="link step"
          on:click={() => {
            window.$("#stepsAccordion").accordion("toggle", 2);
            window.$("#step1").removeClass("active");
            window.$("#step2").removeClass("active");
            window.$("#step3").toggleClass("active");
          }}
        >
          <i class="edit icon" />
          <div class="content">
            <div class="title">Review</div>
            <div class="description">
              Go through the model's predictions and correct them
            </div>
          </div>
        </div>
      </div>
      <div
        id="stepsAccordion"
        class="ui styled fluid accordion"
        style="margin-bottom: 20px;"
      >
        <div class="ui medium header title">
          <i class="dropdown icon" />
          Step 1: Configure
        </div>
        <div class="content">
          <p>
            Open the Detect page. The following will explain how to configure
            the detection procedure.
          </p>
          <h2 class="ui sub header">1.1 Import Data</h2>
          <p>
            Select the folder that contains your images. You do not need to
            select the images themselves, just the parent folder.
          </p>
          <p>Multiple folder locations are not supported at this time.</p>
          <h2 class="ui sub header">1.2 Set Confidence Threshold</h2>
          <p>
            The model needs to know how confident it needs to be in its
            prediction to classify something as an animal. For example, if you
            set the threshold to 80% and the model makes a detection but is only
            50% confident about it then it will classify that image as empty.
          </p>
          <h2 class="ui sub header">1.3 Auto-sort</h2>
          <p>
            When this is set to ON, the application will skip the review stage
            and automatically move the original images based on the predictions
            it just made.
          </p>
        </div>
        <div class="ui medium header title">
          <i class="dropdown icon" />
          Step 2: Detect
        </div>
        <div class="content">
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
            As soon as the model has been loaded, images will start being
            processed. You can monitor the progress in the UI.
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
        </div>
        <div class="ui medium header title">
          <i class="dropdown icon" />
          Step 3: Review
        </div>
        <div class="content">
          <p>
            Once the detection finishes, a pop-up window will be displayed
            asking you to continue to the Review process. You may decline and
            initiate the Review process another time if you wish. For more
            information on this, see the FAQ
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
                data-position="bottom center"
              >
                <i class="images outline icon" />
                demo.JPG
                <div class="detail">16/123</div>
              </div>
              <div
                id="imageContainer"
                data-inverted=""
                data-tooltip="Progress bar showing percentage of reviewed images"
                data-position="bottom left"
              >
                <img
                  class="ui large image"
                  src={isDev
                    ? path.join(process.cwd(), "src", "assets", "demo.JPG")
                    : path.join(
                        process.cwd(),
                        "resources",
                        "assets",
                        "demo.JPG"
                      )}
                  alt="demo"
                />
              </div>
            </div>
            <div class="content">
              <div style="height: 100%;">
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
                          data-position="bottom center"
                        >
                          <i class="save icon" />
                          Save Progress
                        </button>
                      </h2>
                    </div>
                  </div>
                  <div>
                    <h3>Detection</h3>
                  </div>

                  <div class="row" style="padding-bottom: 0;">
                    <div class="column">
                      <div
                        class="ui medium green horizontal label"
                        data-inverted=""
                        data-tooltip="The model's predicted classification"
                        data-position="bottom center"
                      >
                        animal
                      </div>
                      <div
                        class="ui medium orange horizontal label"
                        data-inverted=""
                        data-tooltip="The model's confidence for this classification"
                        data-position="bottom center"
                      >
                        67%
                      </div>
                    </div>
                    <div class="right aligned column">
                      <button
                        class="ui tiny red inverted icon button"
                        style="padding: 6px;"
                        data-inverted=""
                        data-tooltip="Remove this classification"
                        data-position="bottom center"
                      >
                        <i class="times icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button
                  class="ui left floated tiny compact icon button"
                  data-inverted=""
                  data-tooltip="Previous image"
                  data-position="bottom center"
                >
                  <i class="arrow left icon" />
                  Prev
                </button>
                <button
                  class="ui right floated tiny compact icon button"
                  data-inverted=""
                  data-tooltip="Next image"
                  data-position="bottom center"
                >
                  Next
                  <i class="arrow right icon" />
                </button>
              </div>
            </div>
            <div class="ui green bottom attached progress" data-percent="10">
              <div class="bar" />
            </div>
          </div>
          <!-- UI DEMO -->
          <h2 class="ui sub header">
            3.2 Correcting an "empty" classification
          </h2>
          <div>
            If you come across an image with an animal but the detector didn't
            find anything (or wasn't confident enough about its prediction), you
            can click the
            <button class="ui compact icon button">
              <i class="paw icon" />
            </button>
            button. Note that you won't be able to add bounding box data.
          </div>
          <h2 class="ui sub header">
            3.3 Correcting an "animal" classification
          </h2>
          <div>
            If the detector has incorrectly detected something in the image as
            an animal then clicking the
            <button class="ui compact red inverted icon button">
              <i class="times icon" />
            </button>
            button will remove the incorrect classification and bounding box data.
          </div>
          <h2 class="ui sub header">3.4 Undoing</h2>
          <div>
            If you have made a mistake, you can use the
            <button class="ui compact icon button">
              <i class="undo icon" />
            </button> button to undo. Bounding box data will be restored (if it existed).
          </div>
          <h2 class="ui sub header">3.5 Saving Progress</h2>
          <div>
            The application will remember when you accept or correct
            classifications but will not physically save your progress anywhere.
            When you press the
            <button class="ui small compact icon primary button">
              <i class="save icon" />
              Save Progress
            </button>
            button, the application will generate a new file called
            <span class="ui label">
              <i class="file icon" />updated_results.json
            </span>
            and it will move the images you have reviewed to their respective folder,
            i.e.:
            <span class="ui label"> <i class="folder icon" />animal</span>
            or
            <span class="ui label"> <i class="folder icon" />empty</span>
          </div>
          <h2 class="ui sub header">3.6 Reviewing at a different time</h2>
          <div>
            If you have finished the detection process but wish to review its
            results at a later time you can navigate to the Review page and
            import the
            <span class="ui label"><i class="file icon" />results.json</span>
            file. If you are resuming a previous review session then you need to
            import the
            <span class="ui label"
              ><i class="file icon" />updated_results.json
            </span>
            file.
          </div>
        </div>
      </div>

      <h2 id="faqs" class="ui header">FAQs</h2>
      <div
        id="faqsAccordion"
        class="ui styled fluid accordion"
        style="margin-bottom: 50px;"
      >
        {#each faqs as faq, i}
          <div id={`q${i}`} class="ui medium header title">
            <i class="dropdown icon" />
            {(faq.id = i + 1)}.
            {faq.title}
          </div>
          <div class="content">
            <p>{faq.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
</style>
