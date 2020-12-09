const path = require('path')

function runMegaDetector() {
  let modelPath =
    'C:\\Users\\pgyur\\Documents\\My Projects\\megadetector-api\\md_v4.1.0.pb' // TODO
  let inputPath = $('#selectedDirectory').text()
  let outputPath = path.join(inputPath, 'output')
  let conf = Number($('.ui.slider').slider('get value')) / 100.0

  var executablePath =
    'C:\\Users\\pgyur\\Documents\\My Projects\\megadetector-api\\dist\\cli.exe' // TODO
  var parameters = [
    modelPath,
    inputPath,
    outputPath,
    '-rt',
    conf,
    '-ot',
    conf,
    '--electron',
  ]

  var child = require('child_process').execFile(executablePath, parameters, {
    stdio: ['inherit'],
  })

  child.stdout.on('data', (data) => {
    if (data.startsWith('Processing Images')) {
      let progressBarInfo = []
      data.split('|').forEach((x) => {
        progressBarInfo.push(x.trim())
      })

      let pos = progressBarInfo[0].split(']')[1].trim()
      let percent = Number(progressBarInfo[1].replace('%', ''))
      let eta = progressBarInfo[2]

      $('#detectProgressBar').progress({
        percent: percent,
      })
      $('#pos').text(pos)
      $('#eta').text(eta === undefined ? '--:--:--' : eta)
    }
  })

  child.stderr.on('data', (data) => {
    console.log('stderr', data)
  })
}
