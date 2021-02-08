# Changelog

## v0.0.1

_8th February 2021_

### Changes:

- Saving Review (updating classifications/moving images) is now substantially faster
- Users can now selectively correct detections when an image has more than one detection
- Added a Settings panel in which users can:
  - toggle image animation on/off
  - toggle full image path on/off
  - set default confidence threshold
- Bbox colour now matches the in-app label (and increased the bbox thickness a little)
- When clicking away from an on-going review or detection, the user is warned before letting them proceed prevent accidental interruption of review/detection)
- Removed model selection dropdown (will put back in once we actually have models to choose from!)
- Added a logfile that logs errors and other info
- Now generating a CSV file as well as a JSON file
- Removed warning pop-up messages on every classification change
- Updated documentation

### Fixes

- Fixed bug that caused the Review progress to prematurely reach 100%
- Fixed bug that was causing images to not get moved
- Fixed bug that caused the ETA timer to not update in real time
- Fixed bug that caused the iterruption toast to appear errneously

### Known Bugs:

- When auto-sort is enabled, the progress bar tracks only detection and does not take into account the follow-up process that moves images
- UI doesn't properly reset if the user selects a JSON file that has been reviewed 100% and then tries to select a non-100% file
- CSV file will contain incorrect row if the user re-changes a previously changed classification from a resumed preview
- Stopping the Detection process causes the error toast to show even though there was no error
- Not all errors/exceptions are handled
- When auto-sort is enabled, the progress bar tracks only detection and does not take into account the follow-up process that moves images

---

<br/>

## v0.0.1-alpha

_5th January 2021_

### Features:

- automatic detection of animals in a set of photos
- review process that allows you to correct the results of the automatic detection
- zoom-and-pan feature on photos during review to help spot animals
- automatically move the images in labelled folders
- detailed documentation on how to use the application

### Known Bugs:

- Nothing prevents the user from interrupting the backend process (though warnings are shown when it occurs)
- When auto-sort is enabled, the progress bar tracks only detection and does not take into account the follow-up process that moves images
- Backend errors or warnings are not shown to the user
