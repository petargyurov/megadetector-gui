let { PythonShell } = require('python-shell')
const { dialog } = require('electron').remote

function runMegaDetector(val) {
  let dataPath = null // TODO
  let conf = $('.ui.slider').slider('get value')

  let options = {
    mode: 'text',
    // pythonPath: 'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '.',
    args: [dataPath, conf],
  }

  let pyshell = new PythonShell('engine/my_script.py', options)

  pyshell.on('message', function (message) {
    $('#detectProgressBar').progress({
      percent: message * 10,
    })
  })

  // end the input stream and allow the process to exit
  pyshell.end(function (err, code, signal) {
    if (err) throw err
    console.log('The exit code was: ' + code)
    console.log('The exit signal was: ' + signal)
    console.log('finished')
  })
}
