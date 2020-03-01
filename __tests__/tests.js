const app = require('../index.js');
const supertest = require('supertest');
const request = supertest(app)

describe('All users', () => {

  it('post to /users', async done => {

    const response = await request.post('/users').send({
      UUID: process.env.UUID
    });

    expect(response.status).toBe(200);
    done()
  });

  it('/users without uuid', async done => {

    const response = await request.post('/users').send({
    });

    expect(response.status).toBe(401);
    done()
  });

  it('/users with wrong uuid', async done => {

    const response = await request.post('/users').send({
      UUID: 'wrongUUID'
    });

    expect(response.status).toBe(403);
    done()
  });
});
