const path = require('path')
const kill = require('tree-kill')
import { displayErrorToast, logToFile } from './errors'

class BackendInterface {
  // ideally these would be made private with the # character but support for this feature is limited in various dependencies
  executablePath
  childProcess

  constructor(path) {
    this.executablePath = path
  }

  stopProcess = () => {
    // this seems to work better than process.kill(this.childProcess.pid) or this.childProcess.kill()
    if (this.childProcess && this.childProcess.pid) {
      kill(this.childProcess.pid)
      this.childProcess = undefined
    }
  }

  // there is a bug with commonJS (?) that fails to recognize the # character used for private methods
  // so as a workaround we are using _ as a weak convention for this purpose
  _runExec(params) {
    this.childProcess = require('child_process').execFile(
      this.executablePath,
      params,
      {
        stdio: ['inherit'],
      },
      function (err, data) {
        if (err) {
          displayErrorToast('backendError', err.toString())
        }
        if (data) {
          logToFile(data)
        }
      },
    )

    // TF logs to stderr so we need to listen in and log this
    this.childProcess.stderr.on('data', (data) => {
      logToFile(data)
    })
  }

  move(updatedResultsPath) {
    const parameters = ['move', updatedResultsPath]
    this._runExec(parameters)

    this.childProcess.on('exit', function () {
      $('.ui.primary.button').removeClass('loading')
      $('.ui.modal').modal('hide')
    })
  }

  detect(inputPath, outputPath, conf, autosort) {
    const modelPath = path.join(
      process.cwd(),
      'engine',
      'models',
      'md_v4.1.0.pb',
    )
    const parameters = [
      'detect',
      modelPath,
      inputPath,
      outputPath,
      '-rt',
      conf,
      '-ot',
      conf,
      '--electron',
      autosort ? '--auto-sort' : '--no-auto-sort',
      '--verbose',
    ]

    this._runExec(parameters)

    this.childProcess.stdout.on('data', (data) => {
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

        $('#detectProgressBar').progress('set percent', percent)
        $('#pos').text(pos)
        $('#eta').text(eta === undefined ? '--:--:--' : eta)
      }
    })
  }
}

export const backend = new BackendInterface(
  path.join(process.cwd(), 'engine', 'cli.exe'),
)
