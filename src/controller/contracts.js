const { Op } = require('sequelize')

module.exports = {
  async show(req, res) {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const contract = await Contract.findOne({ where: { id } })

    if (!contract) {
      return res.status(404).end()
    }

    if (contract.ClientId !== req.profile.id && contract.ContractorId !== req.profile.id) {
      return res.status(401).end()
    }

    res.json(contract)
  },

  async index(req, res) {
    const { Contract } = req.app.get('models')
    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
        status: { [Op.ne]: 'terminated' },
      },
    })

    res.json(contracts)
  },
}
