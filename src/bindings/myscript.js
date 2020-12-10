const path = require('path')
const kill = require('tree-kill')

let child

const runMegaDetector = () => {
  let modelPath = path.join(process.cwd(), 'engine', 'models', 'md_v4.1.0.pb')
  let inputPath = $('#selectedDirectory').text()
  let outputPath = path.join(inputPath, 'output')
  let conf = Number($('.ui.slider').slider('get value')) / 100.0

  var executablePath = path.join('engine', 'cli.exe')
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

  child = require('child_process').execFile(executablePath, parameters, {
    stdio: ['inherit'],
  })

  child.stdout.on('data', (data) => {
    if (data.startsWith('Processing Images')) {
      if ($('#stopButton').hasClass('loading')) {
        $('#stopButton').removeClass('loading disabled')
      }

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

const stopMegaDetector = () => {
  kill(child.pid)

  // reset UI
  $('#detectProgressBar').progress({
    percent: 0,
  })
  $('#pos').text('--/--')
  $('#eta').text('--:--:--')
}
