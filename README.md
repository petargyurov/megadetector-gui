# MegaDetector GUI

A desktop application that simplifies the use of the animal detection model known as [MegaDetector.](https://github.com/microsoft/CameraTraps/blob/master/megadetector.md)

![image](https://i.imgur.com/pbBOukO.png)

## Introduction

This application works in tandem with another project, [megadetector-api](https://github.com/petargyurov/megadetector-api), which is the backbone of this application. This repository is purely the GUI side of things.

The aim of this project is to provide a simple, easy to use, application that enables field scientists to **quickly sort through camera trap images**. Camera traps are often set off by moving leaves and consequentlly take lots of empty shots. Weeding out empty images is a mundane task that would typically take several hours of sorting through hundreds of images.

Using machine learning we can reduce the time it takes to sort these images by making use of _object detection_. **This application categorises your images in folders** depending on what it thinks it has detected.

## Installation

A Windows installer will be provided soon!

A MacOS version is being considered.

## Development

This repository is for the frontend of the application. Whether to keep the backend and frontend as two separate repositories is still up for debate, but for now this is the case.

### Tech Stack

The application itself is built using ElectronJS. It provides flexibility and it's easy to use. The UI is build using the [Svelte](https://svelte.dev/) framework, and components are styled using [Fomantic-UI](https://fomantic-ui.com/)

ElectronJS lets you execute native code outside the normal browser window which makes it easy for us to invoke the backend executable. The backend is built to function like a CLI program which makes it easy for us to pass commands and parameters to it. For more information check out the [backend repository](https://github.com/petargyurov/megadetector-api).

### Dev Installation & Running (Windows only)

If you wish to use this project for development purposes follow these steps:

Pre-requsites:

1. Node.js (https://nodejs.org/en/)
2. The backend executable (see instructions [here](https://github.com/petargyurov/megadetector-api#building-an-executable))

Steps:

1. Clone this repository
2. Install the depencies using `npm install`
3. Build the Fomantic (Semantic) CSS and JS: `npm run semantic-build`
4. Place the backend executable (`cli.exe`) in the `engine/` folder
5. Place the MegaDetector model file (`md_v4.1.0.pb`) in the `engine/models/` folder

Running the application:

1. To run the app in dev mode: `npm run start`

---

:warning: There is a bug with hot-reloading the app. You need to re-run the app each time you make changes. Will hopefully fix soon.

---
