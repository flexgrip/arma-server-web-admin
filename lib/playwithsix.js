var async = require('async');
var events = require('events');
var filesize = require('filesize');
var fs = require('fs.extra');
var _ = require('lodash');
var path = require('path');
var playwithsix = require('playwithsix');

var PlayWithSix = function (config) {
  this.config = config;
  this.liteMods = false;
  this.mods = [];

  if (this.config && this.config.playWithSix) {
    this.liteMods = this.config.playWithSix.liteMods;
  }

  var self = this;
};

PlayWithSix.prototype = new events.EventEmitter();

PlayWithSix.prototype.download = function (mod, cb) {
  var self = this;
  var currentDownloadMod = null;
  var currentDownloadProgress = 0;

  playwithsix.downloadMod(this.config.path, mod, {lite: this.liteMods}, function(err, mods) {
    if (currentDownloadMod) {
      currentDownloadMod.progress = null;
      self.emit('mods', self.mods);
    }
    self.updateMods();

    if (cb) {
      cb(err, mods);
    }
  }).on('progress', function (progress) {
    var modName = progress.mod;

    if (!currentDownloadMod || currentDownloadMod.name != modName) {
      if (currentDownloadMod) {
        currentDownloadMod.progress = null;
      }

      var mod = _.find(self.mods, {name: modName});

      if (mod) {
        currentDownloadMod = mod;
      } else {
        currentDownloadMod = {
          name: modName,
          outdated: false,
          playWithSix: true,
        };
        self.mods.push(currentDownloadMod);
      }
    }

    // Progress in whole percent
    var newProgress = parseInt(progress.completed / progress.size * 100, 10);

    if (newProgress != currentDownloadMod.progress) {
      currentDownloadMod.progress = newProgress;
      self.emit('mods', self.mods);
    }
  });
};

PlayWithSix.prototype.updateMods = function (mods) {
  var self = this;
  playwithsix.checkOutdated(self.config.path, function (err, outdatedMods) {
    async.map(mods, function (mod, cb) {
      var modPath = path.join(self.config.path, mod);
      self.isPlayWithSixMod(modPath, function (isPlayWithSixMod) {
        cb(null, {
          name: mod,
          outdated: outdatedMods && outdatedMods.indexOf(mod) >= 0,
          progress: null,
          playWithSix: isPlayWithSixMod,
        });
      });
    }, function (err, mods) {
      if (!err) {
        self.mods = mods;
        self.emit('mods', mods);
      }
    });
  });
};

PlayWithSix.prototype.isPlayWithSixMod = function (modPath, cb) {
  var pwsFile = path.join(modPath, '.synq.json');
  fs.exists(pwsFile, function (exists) {
    if (cb) {
      cb(exists);
    }
  });
};

PlayWithSix.prototype.search = function (query, cb) {
  playwithsix.search(query, function (err, mods) {
    if (err) {
      cb(err);
    } else {
      mods.map(function (mod) {
        mod.formattedSize = filesize(mod.size);
      });
      cb(null, mods);
    }
  });
};

module.exports = PlayWithSix;
