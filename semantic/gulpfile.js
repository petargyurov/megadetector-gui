/*******************************
 *           Set-up
 *******************************/

// Taken from: https://stackoverflow.com/questions/32538811/semantic-ui-in-gitignore
var fs = require('fs-extra') // Used for recursive copying
var path = require('path')
try {
  var stat = fs.statSync(path.join(__dirname, './tasks'))
  console.log("'tasks' folder already exists. Continuing.")
} catch (e) {
  console.log("Copying 'tasks' folder from 'node_modules/semantic-ui/tasks'")
  fs.copySync(
    path.join(__dirname, '../node_modules/semantic-ui/tasks'),
    path.join(__dirname, './tasks'),
  )
  console.log('Copying done! Continuing.')
}
//

var gulp = require('gulp'),
  // read user config to know what task to load
  config = require('./tasks/config/user')
/*******************************
 *            Tasks
 *******************************/

require('./tasks/collections/build')(gulp)
require('./tasks/collections/various')(gulp)
require('./tasks/collections/install')(gulp)

gulp.task('default', gulp.series('watch'))

/*--------------
      Docs
---------------*/

require('./tasks/collections/docs')(gulp)

/*--------------
      RTL
---------------*/

if (config.rtl) {
  require('./tasks/collections/rtl')(gulp)
}
