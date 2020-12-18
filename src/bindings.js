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
  }

  detect(inputPath, outputPath, conf) {
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
    ]

    console.log(this.#childProcess)
    this._runExec(parameters)
    console.log(this.#childProcess)

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
