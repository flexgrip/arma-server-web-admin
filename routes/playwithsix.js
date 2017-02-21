var express = require('express');

module.exports = function (playWithSixManager) {
  var router = express.Router();

  router.post('/', function (req, res) {
    playWithSixManager.download(req.body.name);
    res.status(204);
  });

  router.put('/:mod', function (req, res) {
    playWithSixManager.download(req.params.mod);
    res.status(204);
  });

  router.post('/search', function (req, res) {
    var query = req.body.query || "";
    playWithSixManager.search(query, function (err, mods) {
      if (err || !mods) {
        res.status(500).send(err);
      } else {
        res.json(mods);
      }
    });
  });

  return router;
};
