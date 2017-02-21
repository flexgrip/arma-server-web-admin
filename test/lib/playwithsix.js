var should = require('should');

var PlayWithSix = require('../../lib/playwithsix.js');

describe('PlayWithSix', function() {
  describe('search()', function() {
    it('should find mods', function(done) {
      var playWithSix = new PlayWithSix();
      playWithSix.search('', function (err, mods) {
        should(err).be.null;
        mods.should.not.be.empty;
        done();
      });
    });
  });
});
