let { PythonShell } = require('python-shell')
const { dialog } = require('electron').remote

function runMegaDetector() {
  let dataPath = $('#selectedDirectory').text()
  let conf = $('.ui.slider').slider('get value')

  var executablePath =
    'C:\\Users\\pgyur\\Documents\\My Projects\\megadetector-api\\dist\\test.exe'
  var parameters = [dataPath, '--conf', conf, '--electron']

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
      console.log(pos, percent, eta)
    }
  })
}
