const path = require('path')
const kill = require('tree-kill')

class BackendInterface {
  // Private field
  #executablePath
  #childProcess

  constructor(path) {
    this.#executablePath = path
  }

  stopProcess = () => {
    kill(this.#childProcess.pid)
  }

  // there is a bug with commonJS (?) that fails to recognize the # character used for private methods
  // so as a workaround we are using _ as a weak convention for this purpose
  _runExec(params) {
    this.#childProcess = require('child_process').execFile(
      this.#executablePath,
      params,
      {
        stdio: ['inherit'],
      },
    )
  }

  move(updatedResultsPath) {
    const parameters = ['move', updatedResultsPath]
    this._runExec(parameters)

    this.#childProcess.on('exit', function () {
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
    ]

    this._runExec(parameters)

    this.#childProcess.stdout.on('data', (data) => {
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

    this.#childProcess.stderr.on('data', (data) => {
      console.log('stderr', data)
    })
  }
}

export const backend = new BackendInterface(
  path.join(process.cwd(), 'engine', 'cli.exe'),
)
