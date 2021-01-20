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
