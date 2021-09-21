const request = require('supertest')
const app = require('../../src/app')

describe('Contracts Authentication and Authorization', () => {
  test('reject contract access when unauthenticated', async () => {
    await request(app).get('/contracts/1').expect(401)
  })

  test('reject contract access when invalid authentication', async () => {
    await request(app).get('/contracts/1').set('profile_id', 'abc').expect(401)
  })

  test('reject contract access when authenticated but not authorized', async () => {
    await request(app).get('/contracts/1').set('profile_id', '2').expect(401)
  })

  test('accept contract access when authenticated and authorized as client', async () => {
    await request(app)
      .get('/contracts/1')
      .set('profile_id', '1')
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: 1,
          terms: 'bla bla bla',
          status: 'terminated',
          ClientId: 1,
          ContractorId: 5,
        })
      })
  })

  test('accept contract access when authenticated and authorized as contractor', async () => {
    await request(app)
      .get('/contracts/1')
      .set('profile_id', '5')
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: 1,
          terms: 'bla bla bla',
          status: 'terminated',
          ClientId: 1,
          ContractorId: 5,
        })
      })
  })
})

describe('Contracts Controller', () => {
  test('accept contract access when authenticated and authorized as contractor', async () => {
    await request(app).get('/contracts/abc').set('profile_id', '5').expect(404)
  })

  test('list non-terminated contracts belonging to an user', async () => {
    await request(app)
      .get('/contracts')
      .set('profile_id', '1')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 2,
            terms: 'bla bla bla',
            status: 'in_progress',
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractorId: 6,
            ClientId: 1,
          },
        ])
      })

    await request(app)
      .get('/contracts')
      .set('profile_id', '6')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          {
            id: 2,
            terms: 'bla bla bla',
            status: 'in_progress',
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractorId: 6,
            ClientId: 1,
          },
          {
            id: 3,
            terms: 'bla bla bla',
            status: 'in_progress',
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractorId: 6,
            ClientId: 2,
          },
          {
            id: 8,
            terms: 'bla bla bla',
            status: 'in_progress',
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            ContractorId: 6,
            ClientId: 4,
          },
        ])
      })
  })
})
