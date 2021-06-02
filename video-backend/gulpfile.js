const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

var jsScript = 'node'
if (process.env.npm_config_argv !== undefined && process.env.npm_config_argv.indexOf('debug') > 0) {
  jsScript = 'node debug'
}

gulp.task('nodemon', function () {
  return nodemon({
    script: 'build/dev-server.js',
    execMap: {
      js: jsScript
    },
    verbose: true,
    ignore: ['build/', 'dist/', '.git/','logs/','test/','node_modules/', 'gulpfile.js'],
    env: {
      NODE_ENV: 'development'
    },
    ext: 'js json'
  })
})

