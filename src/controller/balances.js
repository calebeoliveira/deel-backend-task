const Big = require('big.js')

module.exports = {
  async deposit(req, res) {
    if (typeof req.body.amount !== 'number' || req.body.amount <= 0) {
      return res.status(400).end()
    }

    const { Profile, Job, Contract } = req.app.get('models')
    const { userId } = req.params
    const sequelize = req.app.get('sequelize')

    const transaction = await sequelize.transaction()
    try {
      const client = await Profile.findOne(
        {
          where: { id: userId, type: 'client' },
          include: [
            {
              model: Contract,
              as: 'Client',
              where: {
                status: 'in_progress',
              },
              include: [
                {
                  model: Job,
                  where: {
                    paid: null,
                  },
                },
              ],
            },
          ],
        },
        { lock: transaction.LOCK.UPDATE, transaction }
      )

      if (!client) {
        const e = new Error('Client not found')
        e.status = 404
        throw e
      }

      let totalDebt = Big(0.0)

      for (let i = 0; i < client.Client.length; i++) {
        for (let j = 0; j < client.Client[i].Jobs.length; j++) {
          totalDebt = totalDebt.add(client.Client[i].Jobs[j].price)
        }
      }

      const allowableAmount = totalDebt.times(1.25).toNumber()

      if (req.body.amount > allowableAmount) {
        const e = new Error('Requested deposit amount exceeds the allowable limit')
        e.status = 400
        throw e
      }

      client.balance = Big(client.balance).add(req.body.amount).toNumber()

      await client.save({ transaction })

      await transaction.commit()

      res.status(200).end()
    } catch (e) {
      await transaction.rollback()
      res.status(e.status || 500).end()
    }
  },
}
