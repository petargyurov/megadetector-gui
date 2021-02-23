<div align="center">
    <h3>MegaDetector GUI</h3>
    <img src="https://i.imgur.com/FCTbqGH.png" width="150" >
    <h4>AI-assisted Tool for Sorting Camera Trap Images</h4>
    <span>Based on <a href="https://github.com/microsoft/CameraTraps/blob/master/megadetector.md"> MegaDetector </a></span>
    <br/>
    <br/>
    <img src="https://i.imgur.com/0oP47nn.png" width="500" >
    <br/>
    <br/>
    <a href="https://www.buymeacoffee.com/pgyurov" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;"></a>
</div>

## Introduction

The aim of this project is to provide a simple, easy to use, application that enables field scientists to **quickly sort through camera trap images**. Camera traps are often set off by moving leaves and consequentlly take lots of empty shots. Weeding out empty images is a mundane task that would typically take several hours of sorting through hundreds of images.

Using machine learning we can reduce the time it takes to sort these images by making use of _object detection_. **This application categorises your images in folders** depending on what it thinks it has detected.

## Installation

The only currently supported platform is **Windows (64-bit)**.

Go to the [Releases page](https://github.com/petargyurov/megadetector-gui/releases) and download the provided installer for the latest available version.

### GPU Support

Read the instructions [here](https://github.com/petargyurov/megadetector-gui/blob/master/GPU_SUPPORT.md) on how to enable significantly faster processing.

## Features

- [x] automatic detection of animals in a set of photos
- [x] review process that allows you to correct the results of the automatic detection
- [x] zoom-and-pan feature on photos during review to help spot animals
- [x] automatically move the images in labelled folders
- [x] detailed documentation on how to use the application
- [ ] ability to train and use custom models
- [ ] in-app labelling
- [ ] upload photos to a database of your choice

## Contributing

### Tech Stack

The app is built using ElectronJS. The UI framework is [Svelte](https://svelte.dev/), and components are styled using [Fomantic-UI](https://fomantic-ui.com/)

The brains of the app are in Python. I have adapted MegaDetector's code into a slightly more organised API. We use this API to build a basic CLI app that compiles to an executable. The executable is called by the Electron app whenever we need to use the model for inference.

### Dev Installation & Running

If you wish to use this project for development purposes follow these steps:

Pre-requsites:

1. Python 3.x
2. Node.js

Steps:

1. Clone this repository
2. Install the depencies using `npm install`
3. Build the Fomantic-UI CSS and JS: `npm run semantic-build`
4. Build the backend executable:
   1. `cd engine/`
   2. Create a virtual environment
   3. Activate the virtual environment
   4. Install requirements: `pip install -r requirements.txt`
   5. Download the MegaDetector model from [here](https://github.com/microsoft/CameraTraps/blob/master/megadetector.md#download-links)
   6. Place the model file in the `engine/models/` folder
   7. Build the .exe: `pyinstaller -F cli_wrapper/cli.py`

Running the application:

1. To run the app in dev mode: `npm run start`
2. To build the installer: `npm run build`
