const { Op } = require('sequelize')
const Big = require('big.js')

module.exports = {
  async indexUnpaid(req, res) {
    const { Job, Contract } = req.app.get('models')

    const jobs = await Job.findAll({
      where: {
        paid: null,
      },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
            status: 'in_progress',
          },
        },
      ],
    })

    res.json(jobs)
  },
  async pay(req, res) {
    const { Job, Contract, Profile } = req.app.get('models')
    const { job_id: id } = req.params
    const sequelize = req.app.get('sequelize')

    const transaction = await sequelize.transaction()
    try {
      const job = await Job.findOne(
        {
          where: {
            id,
            paid: null,
          },
          include: [
            {
              model: Contract,
              where: {
                ClientId: req.profile.id,
                status: 'in_progress',
              },
            },
          ],
        },
        { lock: transaction.LOCK.UPDATE, transaction }
      )

      if (!job) {
        const e = new Error('Job not found')
        e.status = 404
        throw e
      }

      const client = await Profile.findOne(
        { where: { id: job.Contract.ClientId } },
        { lock: transaction.LOCK.UPDATE, transaction }
      )

      if (!client) {
        // well, something nasty just happened
        const e = new Error('Client not found')
        e.status = 404
        throw e
      }

      const contractor = await Profile.findOne(
        { where: { id: job.Contract.ContractorId } },
        { lock: transaction.LOCK.UPDATE, transaction }
      )

      if (!contractor) {
        // well, something nasty just happened
        const e = new Error('Contractor not found')
        e.status = 404
        throw e
      }

      if (client.balance < job.price) {
        const e = new Error('Insufficient funds')
        e.status = 400
        throw e
      }

      client.balance = Big(client.balance).minus(job.price).toNumber()
      await client.save({ transaction })

      contractor.balance = Big(contractor.balance).plus(job.price).toNumber()
      await contractor.save({ transaction })

      job.paid = true
      job.paymentDate = new Date()
      await job.save({ transaction })

      await transaction.commit()

      res.status(200).end()
    } catch (e) {
      await transaction.rollback()
      res.status(e.status || 500).end()
    }
  },
}
