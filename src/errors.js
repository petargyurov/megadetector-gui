const fs = require('fs')

export const displayErrorToast = (type, error) => {
  window.$('body').toast({
    class: 'red',
    showIcon: 'bug',
    displayTime: 0,
    message: 'An unexpected error occured!',
    className: {
      icon: 'white icon',
    },
    actions: [
      {
        text: 'Dismiss',
      },
      {
        text: 'Copy Error',
        class: 'black',
        click: function () {
          const errorMsg = {
            type,
            page: window.location.href,
            error,
          }
          navigator.clipboard.writeText(JSON.stringify(errorMsg, null, 4))
        },
      },
    ],
  })
}

export const logToFile = (data, level) => {
  if (data) {
    data = data.toString()
  }

  if (level) {
    const now = new Date().toISOString().replace('T', ' ').replace('Z', '')
    data = `${now}: ${level.toUpperCase()} - ${data}\n`
  }

  fs.appendFileSync('debug.log', data)
}

export const registerErrorHandlers = () => {
  window.onerror = function (msg, url, line, col, error) {
    if (error) {
      error = error.stack.toString()
    }

    if (msg === 'Script error.') {
      error = "An unknown error occured inside a 'remote' script."
    }

    displayErrorToast('error', error)
    logToFile(error, 'ERROR')
    return false
  }

  window.onunhandledrejection = (error) => {
    displayErrorToast('rejection', error.reason.stack)
    logToFile(error.reason.stack.toString(), 'ERROR')
    return false
  }
}
