const app = require('../src/app');

describe('Tracks', () => {
  describe('/api/tracks', () => {
    it('should create a track', (done) => {
      request(app)
        .post('/api/tracks')
        .type('json')
        .send(JSON.stringify({
            senderPostCode: '79588',
            receiverPostCode: '79588',
            date: '2018-02-16T08:27:21.46Z',
            packageSize: 1
        }))
        .expect(200, {
            data: {
                trackingNumber: 'HMS30664162862467031686',
                senderPostCode: '79588',
                receiverPostCode: '79588',
                date: '2018-02-16T08:27:21.46Z',
                packageSize: 1,
                isExpress: false,
                packageStates: []
            },
            error: false
        }, done);
    });

    it('should get all tracks', (done) => {
      request(app)
        .get('/api/tracks')
        .expect(200, done);
    });
  });

  describe('/api/tracks/:trackingId', () => {
    it('should get one track', (done) => {
      request(app)
        .get('/api/tracks/HMS30664162862467031686')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.all.keys('data', 'error');
        })
        .end(done);
    });

    it('should create a state', (done) => {
      request(app)
        .post('/api/tracks/HMS30664162862467031686')
        .type('json')
        .send(JSON.stringify({
            progress: 1,
            locationPostCode: '79576',
            message: 'some text'
        }))
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.all.keys('data', 'error');
        })
        .end(done);
    });

    it('should contains one state', (done) => {
      request(app)
        .get('/api/tracks/HMS30664162862467031686')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.packageStates).to.have.lengthOf(1);
        })
        .end(done);
    });
  });
});
