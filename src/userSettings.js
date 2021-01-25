const Store = require('electron-store')

const schema = {
  showImageTransition: {
    type: 'boolean',
    default: false,
  },
  showFullImagePath: {
    type: 'boolean',
    default: false,
  },
  defaultConfidenceThreshold: {
    type: 'number',
    minimum: 0,
    maximum: 100,
    default: 50,
  },
}

export const settings = new Store({ schema })
