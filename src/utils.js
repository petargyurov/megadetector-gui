const fs = require('fs')
const path = require('path')
import { displayErrorToast, logToFile } from './errors'

export const moveFiles = (srcPath, autosort) => {
  let resultsFile = autosort ? 'results.json' : 'updated_results.json'

  fs.readFile(
    path.join(srcPath, 'output', resultsFile),
    'utf8',
    (err, data) => {
      if (err) {
        displayErrorToast('fsError', err.toString())
        logToFile(err.toString(), 'ERROR')
      } else {
        let images = JSON.parse(data).images
        for (const img of images) {
          if (!img.reviewed && !autosort) {
            continue
          }

          // determine what folder we need (i.e.: animal/person/vehicle/multiple/empty)
          const l = img.detections.length
          let folder = 'empty'
          for (const i in img.detections) {
            let previous =
              img.detections[i == 0 ? img.detections.length - 1 : i - 1]
            let current = img.detections[i]
            if (current.label !== previous.label) {
              folder = 'multiple'
              break
            } else {
              folder = current.label
            }
          }

          // create folder if it doesn't exist already
          let categoryPath = path.join(srcPath, folder)
          if (!fs.existsSync(categoryPath)) {
            fs.mkdirSync(categoryPath)
          }

          // move image to folder
          let newPath = path.join(categoryPath, path.basename(img.file))
          fs.rename(img.file, newPath, function (err) {
            if (err && err.code !== 'ENOENT') {
              throw err
            }
          })
        }
      }
    },
  )
}
