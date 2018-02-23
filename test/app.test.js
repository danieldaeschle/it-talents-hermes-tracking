const app = require('../src/app');

describe('App', () => {
  it('should work', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});