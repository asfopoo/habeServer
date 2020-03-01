const app = require('../index.js');
const supertest = require('supertest');
const request = supertest(app)

describe('get Endpoints', () => {
  it('should test that true === true', async done => {
    expect(true).toBe(true)
    done()
  });


  it('post to all users', async done => {
    const response = await request.get('/users').send({
    });

    expect(response.status).toBe(200);
    done()
  });
});

/*describe('post Endpoint w/o proper credentials', () => {
  it('post to all users', async done => {
    const response = await request.post('/users').send({
      UUID: "someBadString"
    });

    expect(response.status).toBe(403);
    done()
  });
});

describe('post Endpoint w/o proper params', () => {
  it('post to approve user', async done => {
    const response = await request.post('/approveUser').send({
      UUID: config.UUID,
      someBadParam: 1
    });

    expect(response.status).toBe(401);
    done()
  });
});*/
