const request = require('supertest')
const app = require('../../src/app')

describe('Admin Authentication', () => {
  test('reject best-profession report access when unauthenticated', async () => {
    await request(app).get('/admin/best-profession').expect(401)
  })

  test('reject best-profession report access when invalid authentication', async () => {
    await request(app).get('/admin/best-profession').set('profile_id', 'abc').expect(401)
  })

  test('reject best-clients report access when unauthenticated', async () => {
    await request(app).get('/admin/best-clients').expect(401)
  })

  test('reject best-clients report access when invalid authentication', async () => {
    await request(app).get('/admin/best-clients').set('profile_id', 'abc').expect(401)
  })
})

describe('Admin Best Profession Report', () => {
  test('should list the best profession with default dates', async () => {
    await request(app)
      .get('/admin/best-profession')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({ profession: 'Pokemon master', paid: 2020 })
      })
  })

  test('should list the best profession with given dates', async () => {
    await request(app)
      .get('/admin/best-profession?start=2020-08-10T00:00:00.000Z&end=2020-08-10T23:59:59.999Z')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({ profession: 'Wizard', paid: 21 })
      })
  })

  test('should list the best profession with given out of range dates', async () => {
    await request(app)
      .get('/admin/best-profession?start=2000-01-01T00:00:00.000Z&end=2000-01-01T23:59:59.999Z')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toBeNull()
      })
  })

  test('should fail to list the best profession with invalid dates', async () => {
    await request(app).get('/admin/best-profession?start=x-01-01T00:00:00.000Z').set('profile_id', 'admin').expect(400)
    await request(app).get('/admin/best-profession?end=x-01-01T00:00:00.000Z').set('profile_id', 'admin').expect(400)
  })
})

describe('Admin Best Client Report', () => {
  test('should list the best clients with default dates', async () => {
    await request(app)
      .get('/admin/best-clients')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          { id: 6, fullName: 'Ash Kethcum', paid: 2020 },
          { id: 10, fullName: 'John Snow', paid: 200 },
        ])
      })
  })

  test('should list the best clients with default dates and set limit', async () => {
    await request(app)
      .get('/admin/best-clients?limit=4')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([
          { id: 6, fullName: 'Ash Kethcum', paid: 2020 },
          { id: 10, fullName: 'John Snow', paid: 200 },
          { id: 8, fullName: 'Mr Robot', paid: 200 },
          { id: 7, fullName: 'Harry Potter', paid: 200 },
        ])
      })
  })

  test('should list the best clients with given dates', async () => {
    await request(app)
      .get('/admin/best-clients?start=2020-08-10T00:00:00.000Z&end=2020-08-10T23:59:59.999Z')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([{ id: 11, fullName: 'Harry Potter', paid: 21 }])
      })
  })

  test('should list the best clients with given dates and limit', async () => {
    await request(app)
      .get('/admin/best-clients?start=2020-08-10T00:00:00.000Z&end=2020-08-14T23:59:59.999Z&limit=1')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([{ id: 14, fullName: 'Mr Robot', paid: 121 }])
      })
  })

  test('should list the best clients with given out of range dates', async () => {
    await request(app)
      .get('/admin/best-clients?start=2000-01-01T00:00:00.000Z&end=2000-01-01T23:59:59.999Z')
      .set('profile_id', 'admin')
      .expect(200)
      .then(res => {
        expect(res.body).toEqual([])
      })
  })

  test('should fail to list the best clients with invalid dates', async () => {
    await request(app).get('/admin/best-clients?start=x-01-01T00:00:00.000Z').set('profile_id', 'admin').expect(400)
    await request(app).get('/admin/best-clients?end=x-01-01T00:00:00.000Z').set('profile_id', 'admin').expect(400)
  })

  test('should fail to list the best clients with invalid limit', async () => {
    await request(app).get('/admin/best-clients?limit=-1').set('profile_id', 'admin').expect(400)
  })
})
