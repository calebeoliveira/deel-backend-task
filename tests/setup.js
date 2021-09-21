const seedDb = require('../scripts/seedDb')

module.exports = async () => {
  await seedDb()
}
