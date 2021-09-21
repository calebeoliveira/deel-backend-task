const request = require('supertest')
const app = require('../../src/app')

describe('Jobs Controller', () => {
  test('lists unpaid jobs for a user, for active contracts', async () => {
    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '1')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 2,
            description: 'work',
            price: 201,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 2,
            Contract: {
              id: 2,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 6,
              ClientId: 1,
            },
          },
        ])
      })

    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '6')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 2,
            description: 'work',
            price: 201,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 2,
            Contract: {
              id: 2,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 6,
              ClientId: 1,
            },
          },
          {
            id: 3,
            description: 'work',
            price: 202,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 3,
            Contract: {
              id: 3,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 6,
              ClientId: 2,
            },
          },
        ])
      })
  })

  test('pays an unpaid job', async () => {
    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '2')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 3,
            description: 'work',
            price: 202,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 3,
            Contract: {
              id: 3,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 6,
              ClientId: 2,
            },
          },
          {
            id: 4,
            description: 'work',
            price: 200,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 4,
            Contract: {
              id: 4,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 7,
              ClientId: 2,
            },
          },
        ])
      })

    await request(app).post('/jobs/3/pay').set('profile_id', '2').expect(200)

    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '2')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 4,
            description: 'work',
            price: 200,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 4,
            Contract: {
              id: 4,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 7,
              ClientId: 2,
            },
          },
        ])
      })

    await request(app).post('/jobs/3/pay').set('profile_id', '2').expect(404)
  })

  test('throw error when trying to pay a job with insufficient funds', async () => {
    await request(app).post('/jobs/4/pay').set('profile_id', '2').expect(400)

    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '2')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 4,
            description: 'work',
            price: 200,
            paid: null,
            paymentDate: null,
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractId: 4,
            Contract: {
              id: 4,
              terms: 'bla bla bla',
              status: 'in_progress',
              createdAt: expect.anything(),
              updatedAt: expect.anything(),
              ContractorId: 7,
              ClientId: 2,
            },
          },
        ])
      })
  })
})

describe('Balance-related jobs payments', () => {
  test('prevent to deposit for non-clients', async () => {
    await request(app).post('/balances/deposit/5').set('profile_id', '2').send({ amount: 200.0 }).expect(404)
  })

  test('prevent to deposit of invalid amounts', async () => {
    await request(app).post('/balances/deposit/2').set('profile_id', '2').send({ amount: -1 }).expect(400)
  })

  test("prevent to deposit more than 25% of client's total of jobs to pay", async () => {
    await request(app).post('/balances/deposit/2').set('profile_id', '2').send({ amount: 1000.0 }).expect(400)
  })

  test("do a deposit less than 25% of client's total of jobs to pay", async () => {
    await request(app).post('/balances/deposit/2').set('profile_id', '2').send({ amount: 200.0 }).expect(200)
  })

  test('pays the last unpaid job', async () => {
    await request(app).post('/jobs/4/pay').set('profile_id', '2').expect(200)

    await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '2')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([])
      })
  })
})
