import mongoose from "mongoose";
import { Commit as CommitSchema } from "../models/commitModel";
import { Ratio as RatioSchema } from "../models/ratioModel";
const Commit = mongoose.model("Commit", CommitSchema);
const Ratio = mongoose.model("Ratio", RatioSchema);

// 全てのコミットを取得する。
function all_commits(req, res) {
  Commit.find({}, function (err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
}

// 新しいタスクを作成する。
function create_commit(req, res) {
  var new_commit = new Commit(req.body);
  new_commit.save(function (err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
}

// 特定のコミットを取得する。
function load_commit(req, res) {
  Commit.find({ author: req.params.uid.toUpperCase() }, function (err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
}

// 割合計算をして新しいスキーマで返す。
async function return_ratio(req, res) {
  let attendYear = "2020";
  let testNames: string[];
  let start,end: Date;
  let ratio = new Ratio();
  testNames = await Commit.findOne(
    { graduate_at: "2020" },
    { "commits.test_info.name": 1, _id: 0 }
  ).distinct("commits.test_info.name");
  let students = await Commit.countDocuments({ graduate_at: attendYear });
  let numerator = await Commit.countDocuments({
    graduate_at: attendYear,
    "commits.test_info.status": "pass",
  });

  for (let i = 0; i < 317; i++) {
    testNames.shift();
  }
  for (let i = 0; i < 9; i++) {
    testNames.pop();
  }

  console.log("欲しい：" + students);
  console.log("test：" + testNames);
  ratio.year = Number(attendYear);
  ratio.progress.status = students;
  res.json(ratio);
}

// 特定のタスクを更新する。
function update_commit(req, res) {
  Commit.findOneAndUpdate(
    { _id: req.params.commitId },
    req.body,
    { new: true },
    function (err, commit) {
      if (err) res.send(err);
      res.json(commit);
    }
  );
}

// 特定のタスクを削除する。
function delete_commit(req, res) {
  Commit.remove(
    {
      _id: req.params.commitId,
    },
    function (err, commit) {
      if (err) res.send(err);
      res.json({ message: "Commit successfully deleted" });
    }
  );
}

export {
  all_commits,
  create_commit,
  load_commit,
  return_ratio,
  update_commit,
  delete_commit,
};
