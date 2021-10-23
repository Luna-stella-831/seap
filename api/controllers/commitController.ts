import mongoose from "mongoose";

import { Commit as CommitSchema } from "../models/commitModel";
import { PassDate as PassDateSchema } from "../models/commitModel";

const Commit = mongoose.model("Commit", CommitSchema);
const PassDate = mongoose.model("PassDate", PassDateSchema);

// 特定のコミットを取得する。
function load_commit(req, res) {
  Commit.find(
    { author: req.params.uid.toUpperCase() },
    function (err, commits) {
      if (err) res.send(err);
      res.json(commits);
    }
  );
}

// Retrieves test summary of specified student.
// GET /api/status/
// > {author: "09B..", tests: [{name: "test01", pass_date: "2020.."}]
function status(req, res) {
  let uid = req.params.uid.toUpperCase();

  PassDate.exists({ author: uid }, function (err, elem) {
    // if not cached yet,
    if (!elem) {
      res.json("{}");
      return;
    }

    PassDate.findOne({ _id: elem._id }, function (err, elem) {
      res.json(elem);
    });
  });
}

// Renews PassDate info
// GET /api/renew?uid=09B99001
// POST /api/renew (form-param {})
function renew(req, res) {
  var uid;
  if (req.params.uid) {
    uid = req.params.uid.toUpperCase();
  } else {
    uid = req.body.pusher.name;
  }

  Commit.findOne({ author: uid }, function (err, commits) {
    if (!commits) {
      res.send("seap: no such id " + uid);
      return;
    }

    let result = new Map();
    commits.commits.forEach(function (commit) {
      commit.test_info.forEach(function (passfail) {
        if (passfail.status === "pass") {
          let testName = passfail.name;
          if (result.get(testName)) return;
          result.set(testName, commit.date);
        }
      });
    });

    PassDate.findOne({ author: uid }, function (err, passdate) {
      var pd = passdate;
      if (!passdate) {
        pd = new PassDate();
      }
      renewPassDate(uid, result, pd);
      res.json(pd);
    });
  });
}

// priv method
function renewPassDate(uid, result, passdate) {
  passdate.author = uid;
  passdate.tests = new Array();
  result.forEach(function (v, k) {
    passdate.tests.push({ name: k, pass_date: v });
  });
  passdate.save();

  insertPassdateToAggregate(passdate);
}

// this is super data
let aggr = {};

// GET all
function all(req, res) {
  PassDate.find({}, function (err, passdates) {
    passdates.forEach(function (passdate) {
      insertPassdateToAggregate(passdate);
    });
    console.log(aggr);
    //res.json(JSON.stringify(mapToObj(aggr)));
    res.json(aggr);
    //res.json({a: 'b'});
    //res.json(JSON.stringify(Array.from(aggr)));
  });
}

//all(null, null);

const mapToObj = (m) => {
  return Array.from(m).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
};

// priv
function insertPassdateToAggregate(passdate) {
  let author = passdate.author;
  passdate.tests.forEach(function (pd) {
    let name = pd.name;
    let date = round(pd.pass_date).toISOString();
    addUid(aggr, author, name, date);
  });
}

// priv
function addUid(aggr, author, name, date) {
  if (!aggr[name]) {
    aggr[name] = {};
  }
  let aggr_name = aggr[name];

  if (!aggr_name[date]) {
    aggr_name[date] = [];
  }
  let aggr_date = aggr_name[date];

  aggr_date.push(author);
}

// priv
function round(date) {
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);
  return date;
}

//     let aggr = new Aggregate();
//     aggr.test_name = 'test01';
//     aggr.save();

export { load_commit, status, renew, all };
