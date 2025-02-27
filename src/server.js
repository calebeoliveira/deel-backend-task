const app = require('./app')

async function init() {
  try {
    app.listen(3001, () => {
      console.info('Express App Listening on Port 3001')
    })
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`)
    process.exit(1)
  }
}

init()
