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
// POST /api/renew/ (form-param {})
function renew(req, res) {
  var uid;
  if (req.params.uid) {
    uid = req.params.uid.toUpperCase();
  } else {
    // TODO webhook from gitbucket
    //let Payload = req.body.payload;
    //console.log("aaaa" + Object.keys(req.body.payload));
    //uid = req.body.payload.pusher.name;
  }

  Commit.findOne({ author: uid }, function (err, commits) {
    if (!commits) {
      res.send("seap: no such id " + uid + "\n");
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
      renewPassDate(uid, result, pd, commits);
      res.json(pd);
    });
  });
}

// priv method
function renewPassDate(uid, result, passdate, commits) {
  passdate.author = uid;
  passdate.year = Number(commits.graduate_at);
  passdate.tests = new Array();
  result.forEach(function (v, k) {
    passdate.tests.push({ name: k, pass_date: v });
  });

  passdate.save();

  insertPassdateToAggregate(passdate);
}

// priv
function classYear(studentNum) {
  return 2000 + Number(studentNum.slice(3, 5)) + 2;
}

// this is super data
let aggr = [];

// TODO add deadlines
function initTasks(tasks) {
  tasks.push({ "taskName": "s0.trial", "tests": [] })
  tasks.push({ "taskName": "s1.lexer", "tests": [] })
  tasks.push({ "taskName": "s2.parser", "tests": [] })
  tasks.push({ "taskName": "s3.checker", "tests": [] })
  tasks.push({ "taskName": "s4.compiler", "tests": [] })
}

// GET all
function all(req, res) {
  PassDate.find({}, function (err, passdates) {
    passdates.forEach(function (passdate) {
      insertPassdateToAggregate(passdate);
    });
    // for debug
    //aggr.map(year => {
    //  year.tasks.map(task => {
    //    task.tests.map(test => {
    //      test.passInfos.map(info => {
    //        console.log(info.passDate);
    //        console.log(info.passIds);
    //      })
    //    })
    //  })
    //})
    res.json(aggr);
  });
}

// init all
function initAll() {
  PassDate.find({}, function (err, passdates) {
    passdates.forEach(function (passdate) {
      insertPassdateToAggregate(passdate);
    });
    console.log("all.exe");
  });
}

// priv
function insertPassdateToAggregate(passdate) {
  let author = passdate.author;
  let year = passdate.year;
  passdate.tests.forEach(function (pd) {
    let name = pd.name;
    let date = round(pd.pass_date).toISOString();
    addUid(aggr, author, year, name, date);
  });
}

// priv
function addUid(aggr, author, year, name, date) {
  if (!(aggr.map(checkY => checkY.year).includes(year))) {
    let tasks = [];
    initTasks(tasks);
    aggr.push({ "year": year, "tasks": tasks })
  }
  let years = aggr.map(y => {
    if (y.year == year) {
      let tasks = y.tasks.map(task => {
        if (name.includes(task.taskName) && !task.tests.map(t => t.testName).includes(name)) {
          task.tests.push({ "testName": name, "passInfos": [] })
        }
        //let Deadline = new Date(task.deadline);
        task.tests.map(test => {
          if (test.testName == name && !test.passInfos.map(info => info.passDate).includes(date + "+09:00")) {
            //let pD = new Date(date);
            //let timeLeft = pD - Deadline;
            test.passInfos.push({ "passDate": date + "+09:00", "passIds": [author] })
          }
          test.passInfos.map(info => {
            if (info.passDate == date + "+09:00" && !info.passIds.includes(author)) {
              info.passIds.push(author);
            }
            info.passIds.sort();
          })
          test.passInfos.sort(function (a, b) {
            return (a.passDate < b.passDate) ? -1 : 1;
          });
        })
      })
    }
  });
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

export { load_commit, status, renew, all, initAll };
