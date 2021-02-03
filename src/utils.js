const fs = require('fs')
const path = require('path')
import { displayErrorToast, logToFile } from './errors'
import ExifReader from 'exifreader'
import { v4 as uuidv4 } from 'uuid'

const createCsvWriter = require('csv-writer').createObjectCsvWriter

const EXIFTAGS = [
  'ColorSpace',
  'ComponentsConfiguration',
  'Contrast',
  'CustomRendered',
  'DateTime',
  'DateTimeDigitized',
  'DateTimeOriginal',
  'DigitalZoomRatio',
  'Exif IFD Pointer',
  'ExifVersion',
  'ExposureBiasValue',
  'ExposureMode',
  'ExposureProgram',
  'ExposureTime',
  'FNumber',
  'FileSource',
  'Flash',
  'FlashpixVersion',
  'FocalLength',
  'FocalLengthIn35mmFilm',
  'GPS Info IFD Pointer',
  'GPSAltitudeRef',
  'GPSDateStamp',
  'GPSImgDirectionRef',
  'GPSLatitude',
  'GPSLatitudeRef',
  'GPSLongitude',
  'GPSLongitudeRef',
  'GPSMapDatum',
  'GPSSatellites',
  'GPSTimeStamp',
  'GainControl',
  'ISOSpeedRatings',
  'Interoperability IFD Pointer',
  'InteroperabilityIndex',
  'InteroperabilityVersion',
  'LightSource',
  'Make',
  'MaxApertureValue',
  'MeteringMode',
  'Model',
  'Orientation',
  'PixelXDimension',
  'PixelYDimension',
  'ResolutionUnit',
  'Saturation',
  'SceneCaptureType',
  'SceneType',
  'Sharpness',
  'Software',
  'SubjectDistanceRange',
  'WhiteBalance',
  'XResolution',
  'YCbCrPositioning',
  'YResolution',
]

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

export const saveAsCSV = (images, dest, autosort) => {
  const detectionInfo = [
    'image',
    'detection_id',
    'label',
    'conf',
    'bbox_x1',
    'bbox_y1',
    'bbox_width',
    'bbox_height',
    'man_made_detection',
  ]
  const headerElements = detectionInfo.concat(EXIFTAGS)

  // create csv header
  let header = []
  for (const e of headerElements) {
    header.push({
      id: e,
      title: e.toLowerCase(),
    })
  }

  const csvWriter = createCsvWriter({
    path: dest,
    header: header,
    append: fs.existsSync(dest), // only append if file already exists (otherwise header won't be written)
  })

  let records = []
  for (const img of images) {
    if (!img.reviewed && !autosort) {
      continue
    }
    let exif
    try {
      exif = getExifInfo(img.file)
    } catch (error) {
      continue
    }

    if (img.detections.length === 0) {
      let record = {}
      record['image'] = img.file
      record['detection_id'] = null
      record['label'] = 'empty'
      record['conf'] = null
      record['bbox_x1'] = null
      record['bbox_y1'] = null
      record['bbox_width'] = null
      record['bbox_height'] = null
      record['man_made_detection'] = false

      for (const tag of EXIFTAGS) {
        if (exif) {
          let val = exif ? exif[tag] : null
          record[tag] = val ? val.description : null
        }
      }

      records.push(record)
    } else {
      for (const d of img.detections) {
        let record = {}
        record['image'] = img.file
        record['detection_id'] = d.id || uuidv4().substring(0, 8)
        record['label'] = d.label
        record['conf'] = d.conf
        record['bbox_x1'] = d.bbox ? d.bbox[0] : null
        record['bbox_y1'] = d.bbox ? d.bbox[1] : null
        record['bbox_width'] = d.bbox ? d.bbox[2] : null
        record['bbox_height'] = d.bbox ? d.bbox[3] : null
        record['man_made_detection'] = img.markedAsAnimal || false

        for (const tag of EXIFTAGS) {
          if (exif) {
            let val = exif ? exif[tag] : null
            record[tag] = val ? val.description : null
          }
        }
        records.push(record)
      }
    }
  }
  if (records.length > 0) {
    csvWriter.writeRecords(records)
  }
}

const getExifInfo = (imagePath) => {
  const imageData = fs.readFileSync(imagePath)
  const tags = ExifReader.load(imageData, { expanded: true })
  //delete some tags we don't want
  if (tags.exif) {
    delete tags.exif['MakerNote']
    delete tags.exif['ImageDescription']
    delete tags.exif['UserComment']
  }
  return tags.exif
}
