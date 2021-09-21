const express = require('express')
const { sequelize } = require('./model')
const { getProfile, adminAccess } = require('./middleware')
const { ContractsController, JobsController, BalancesController, AdminController } = require('./controller')

const app = express()

app.use(express.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', getProfile, ContractsController.show)
app.get('/contracts', getProfile, ContractsController.index)

app.get('/jobs/unpaid', getProfile, JobsController.indexUnpaid)
app.post('/jobs/:job_id/pay', getProfile, JobsController.pay)

app.post('/balances/deposit/:userId', getProfile, BalancesController.deposit)

app.get('/admin/best-profession', adminAccess, AdminController.indexBestProfession)
app.get('/admin/best-clients', adminAccess, AdminController.indexBestClients)
module.exports = app
