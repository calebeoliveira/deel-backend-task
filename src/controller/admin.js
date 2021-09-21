const { Op } = require('sequelize')

module.exports = {
  async indexBestProfession(req, res) {
    let startDate = new Date('2020-01-01T00:00:00.000Z')
    let endDate = new Date('2020-12-31T23:59:59.999Z')

    if (req.query.start) {
      const inputStartDate = Date.parse(req.query.start)

      if (Number.isNaN(inputStartDate)) {
        return res.status(400).end()
      }

      startDate = new Date(inputStartDate)
    }

    if (req.query.end) {
      const inputEndDate = Date.parse(req.query.end)

      if (Number.isNaN(inputEndDate)) {
        return res.status(400).end()
      }

      endDate = new Date(inputEndDate)
    }

    const { Job, Contract, Profile } = req.app.get('models')
    const { fn, col } = req.app.get('sequelize')

    const job = await Job.findOne({
      attributes: ['Contract.Client.profession', [fn('sum', col('price')), 'paid']],
      group: ['Contract.Client.profession'],
      order: [[fn('sum', col('price')), 'DESC']],
      limit: 1,
      where: {
        paid: true,
        paymentDate: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: Contract,
          attributes: [],
          include: [{ model: Profile, attributes: [], as: 'Client' }],
        },
      ],
      raw: true,
    })

    res.json(job)
  },
  async indexBestClients(req, res) {
    let startDate = new Date('2020-01-01T00:00:00.000Z')
    let endDate = new Date('2020-12-31T23:59:59.999Z')
    let limit = 2

    if (req.query.start) {
      const inputStartDate = Date.parse(req.query.start)

      if (Number.isNaN(inputStartDate)) {
        return res.status(400).end()
      }

      startDate = new Date(inputStartDate)
    }

    if (req.query.end) {
      const inputEndDate = Date.parse(req.query.end)

      if (Number.isNaN(inputEndDate)) {
        return res.status(400).end()
      }

      endDate = new Date(inputEndDate)
    }

    if (req.query.limit) {
      const newLimit = Number.parseInt(req.query.limit, 10)

      if (Number.isNaN(newLimit) || newLimit < 1) {
        return res.status(400).end()
      }

      limit = newLimit
    }

    const { Job, Contract, Profile } = req.app.get('models')
    const { literal } = req.app.get('sequelize')

    const jobs = await Job.findAll({
      attributes: [
        'id',
        [literal("`Contract->Client`.`firstName` || ' ' || `Contract->Client`.`lastName`"), 'fullName'],
        ['price', 'paid'],
      ],
      group: ['Contract.Client.id'],
      order: [['price', 'DESC']],
      limit,
      where: {
        paid: true,
        paymentDate: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: Contract,
          attributes: [],
          include: [{ model: Profile, attributes: [], as: 'Client' }],
        },
      ],
      raw: true,
    })

    res.json(jobs)
  },
}
