var mongoose = require("mongoose"),
  Commit = mongoose.model("Commits");

// 全てのコミットを取得する。
exports.all_commits = function(req, res) {
  Commit.find({}, function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 新しいタスクを作成する。
exports.create_commit = function(req, res) {
  var new_commit = new Commit(req.body);
  new_commit.save(function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 特定のコミットを取得する。
exports.load_commit = function(req, res) {
  Commit.findOne(req.params.author, function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 特定のタスクを更新する。
exports.update_commit = function(req, res) {
  Commit.findOneAndUpdate(
    { _id: req.params.commitId },
    req.body,
    { new: true },
    function(err, commit) {
      if (err) res.send(err);
      res.json(commit);
    }
  );
};

// 特定のタスクを削除する。
exports.delete_commit = function(req, res) {
  Commit.remove(
    {
      _id: req.params.commitId
    },
    function(err, commit) {
      if (err) res.send(err);
      res.json({ message: "Commit successfully deleted" });
    }
  );
};
