<script>
  import Page from "../components/Page.svelte";
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
      description: "Currently, only 'animal' and 'empty'",
    },
    {
      title: "Can I train the model on my own data?",
      description: `Short answer: no. Long answer: you can train the underlying MegaDetector model yourself but 
        the application currently does not support an official way to import new models. 
        This is something that will be addressed in a later release. For a 'hacky' solution, you can 
        replace the model under /engine/models/ in the app's installation directory with your trained model; the name must be the same.`,
    },
    {
      title: "What do I with the contents of the 'output' folder?",
      description: `The folder contains copies of the original images with bounding boxes drawn. 
              It also contains the 'results.json' file which holds classification and bounding 
              box data for each image. This data is required if you wish to carry out a review of the model's predictions. 
              Once you have reviewed all the images in question, you are free to do what you want with this folder and its contents. 
              It is advisable to keep the 'results.json' file as bounding box data is valuable.`,
    },
    {
      title: "Does the model output its bounding box data?",
      description:
        "Yes. You can find this data in the 'results.json' file in the 'output' folder",
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
    {
      title: "Can I undo my classification change?",
      description:
        "Yes. Use the 'Prev' button to go back to a previous image and the Undo button will be available.",
    },
  ];
</script>

<style>
</style>

<div
  class="ui one column divided grid container"
  style="margin-left: 1em; padding-top: 1em;">
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
      <div class="ui styled fluid accordion">
        <div class="title"><i class="dropdown icon" />Show me</div>
        <div class="content">
          <p>
            This application is used to speed up the manual process of filtering
            camera trap images. Camera traps can be set off by moving
            vegetation, debris and other factors that are not of interest; this
            results in tens or hundreds of empty images.
          </p>
          <p>
            In an effort to improve this mundane task, we can detect whether an
            animal is in the image using machine learning models. After the
            model makes its predictions, a human reviewer can quickly approve or
            correct the output for each image.
          </p>
          <p>
            At the end, the application will move each original image into
            either an
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
            Open the Detect page. The following will explain how to configure
            the detection procedure.
          </p>
          <h2 class="ui sub header">1.1 Select the model</h2>
          <p>
            Currently the only available model is MegaDetector v4 (the latest
            version at the time)
          </p>
          <h2 class="ui sub header">1.2 Import Data</h2>
          <p>
            Select the folder that contains your images. You do not need to
            select the images themselves, just the parent foler.
          </p>
          <p>Multiple folder locations are not supported at this time.</p>
          <h2 class="ui sub header">1.3 Set Confidence Threshold</h2>
          <p>
            The model needs to know how confident it needs to be in its
            prediction to classify something as an animal. For example, if you
            set the threshold to 80% and the model makes a detection but is only
            50% confident about it then it will classify that image as empty.
          </p>
          <h2 class="ui sub header">1.4 Auto-sort</h2>
          <p>
            When this is set to ON, the application will skip the review stage
            and automatically move the original images based on the predictions
            it just made.
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
            button will begin the detection process. The application will take
            some time to initiate the model. This can take up to a minute.
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
            displays the estimated remaining time (HH:MM:SS). It updates after
            each image. May not be very accurate for a small number of images.
          </div>
          <p />
          <p>
            And of course the progress bar will show the overall progress as a
            percentage.
          </p>
          <h3 class="ui header">Step 3: Review</h3>
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
                  src={isDev ? path.join(process.cwd(), 'src', 'assets', 'demo.JPG') : path.join(process.cwd(), 'resources', 'assets', 'demo.JPG')}
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

          <h2 class="ui sub header">
            3.2 Correcting an "empty" classification
          </h2>
          <div>
            If you come across an image with an animal but the detector didn't
            find anything (or wasn't confident enough about its prediction), you
            can click the
            <button class="ui compact button">Mark as animal</button>
            button. A pop-up window will ask you to confirm. Note that you won't
            be able to add bounding box data.
          </div>
          <h2 class="ui sub header">
            3.3 Correcting an "animal" classification
          </h2>
          <div>
            If the detector has incorrectly detected something in the image as
            an animal then clicking the
            <button class="ui compact button">Mark as empty</button>
            button will remove the incorrect classification and bounding box
            data.
          </div>
          <h2 class="ui sub header">3.4 Undoing</h2>
          <div>
            If you have made a mistake, you can use the
            <button class="ui small compact icon button">
              <i class="arrow left icon" />
              Prev
            </button>
            button to go back to the image in question. If you have
            re-classified something, you can
            <button class="ui compact button">Undo</button>
            it. Bounding box data will be restored (if it existed).
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
            and it will move the images you have reviewed to their respective
            folder, i.e.:
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
            <span class="ui label"><i class="file icon" />updated_results.json
            </span>
            file.
          </div>
        </div>
      </div>
      <h2 id="faqs" class="ui header">FAQs</h2>
      <div
        id="faqsAccordion"
        class="ui styled fluid accordion"
        style="margin-bottom: 50px;">
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
