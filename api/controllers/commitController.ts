import mongoose from "mongoose";
import { Commit as CommitSchema} from "../models/commitModel";
import { Ratio as RatioSchema } from "../models/ratioModel";
const Commit = mongoose.model("Commit", CommitSchema);
const Ratio = mongoose.model("Ratios", RatioSchema);

// 全てのコミットを取得する。
function all_commits(req, res) {
  Commit.find({}, function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 新しいタスクを作成する。
function create_commit(req, res) {
  var new_commit = new Commit(req.body);
  new_commit.save(function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 特定のコミットを取得する。
function load_commit(req, res) {
  Commit.find({author: req.params.uid.toUpperCase()}, function(err, commit) {
    if (err) res.send(err);
    res.json(commit);
  });
};

// 割合計算をして新しいスキーマで返す。
async function return_ratio(req, res) {
  let year = "2020";
  let ratio = new Ratio();
  let test = await Commit.find({graduate_at: year},{status: "pass"});
  let students = await Commit.countDocuments({graduate_at: year});
  //let numerator = await Commit.countDocuments({graduate_at: year},{commits.test_info.status: "pass"});
  console.log("欲しい：" + students);
  console.log(test);
  ratio.year = 2010;
  ratio.progress.status = students;
  res.send(students);
}

// 特定のタスクを更新する。
function update_commit(req, res) {
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
function delete_commit(req, res) {
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

export {all_commits ,create_commit ,load_commit ,return_ratio ,update_commit ,delete_commit};