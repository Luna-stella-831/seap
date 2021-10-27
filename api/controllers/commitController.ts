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
let aggr = {};

// GET all
function __all(req, res) {
  PassDate.find({}, function (err, passdates) {
    passdates.forEach(function (passdate) {
      insertPassdateToAggregate(passdate);
    });
    res.json(aggr);
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
    fillDate(aggr, year, name);
    sortDates(aggr, year, name);
  });
}

//priv
function sortDates(aggr, year, name) {
  let y = aggr[year];
  let pairs = Object.entries(y[name]);
  pairs.sort(function (p1, p2) {
    var p1Key = new Date(p1[0]),
      p2Key = new Date(p2[0]);
    if (p1Key < p2Key) {
      return -1;
    }
    if (p1Key > p2Key) {
      return 1;
    }
    return 0;
  });
  y[name] = Object.fromEntries(pairs);
}

//priv
//filling is started from the last day of summer vacation
function fillDate(aggr, year, name) {
  let d = new Date(String(year) + "-09-30T00:00:00.000Z");

  let aggrYear = aggr[year];
  let aggrName = aggrYear[name];
  for (let i = 0; i <= 6 * 30 * 24; i++) {
    if (!aggrName[d.toISOString()]) {
      aggrName[d.toISOString()] = [];
    }
    let aggr_date = aggrName[d.toISOString()];
    d.setHours(d.getHours() + 1);
  }
}

// priv
function addUid(aggr, author, year, name, date) {
  if (!(String(year) in aggr)) {
    aggr[String(year)] = {};
  }
  let aggr_year = aggr[year];
  if (!aggr_year[name]) {
    aggr_year[name] = {};
  }
  let year_name = aggr_year[name];

  if (!year_name[date]) {
    year_name[date] = [];
  }
  let year_date = year_name[date];

  year_date.push(author);
}

// priv
function revengerCheck() {}

// priv
function round(date) {
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);
  return date;
}

function all(req, res) {
  res.json({
    "2020": {
      "enshud.s2.parser.ParserTest#testNormal18": {
        "2020-09-03T10:00:00.000Z": ["09B99040"],
        "2020-09-03T11:00:00.000Z": ["09B99043", "09B99031"],
        "2020-09-03T12:00:00.000Z": [],
        "2020-09-03T13:00:00.000Z": [
          "09B94001",
          "09B92001",
          "09B96001",
          "09B96089",
        ],
        "2020-09-03T14:00:00.000Z": [],
        "2020-09-03T15:00:00.000Z": [],
        "2020-09-03T16:00:00.000Z": [],
        "2020-09-03T17:00:00.000Z": ["09B96091"],
      },
      "enshud.s2.parser.ParserTest#testNormal19": {
        "2020-11-03T08:00:00.000Z": ["09B18058"],
      },
      "enshud.s2.parser.ParserTest#testNormal20": {
        "2020-11-03T08:00:00.000Z": [],
      },
    },
    "2019": {
      "enshud.s2.parser.ParserTest#testNormal18": {
        "2019-09-03T10:00:00.000Z": ["09B99040"],
        "2019-09-03T11:00:00.000Z": ["09B99043", "09B99031"],
        "2019-09-03T12:00:00.000Z": [],
        "2019-09-03T13:00:00.000Z": [
          "09B94001",
          "09B92001",
          "09B96001",
          "09B96089",
        ],
        "2019-09-03T14:00:00.000Z": [],
        "2019-09-03T15:00:00.000Z": [],
        "2019-09-03T16:00:00.000Z": [],
        "2019-09-03T17:00:00.000Z": ["09B96091"],
      },
      "enshud.s2.parser.ParserTest#testNormal19": {
        "2019-11-03T08:00:00.000Z": ["09B18058"],
      },
      "enshud.s2.parser.ParserTest#testNormal20": {
        "2019-11-03T08:00:00.000Z": [],
      },
    },
  });
}

//     let aggr = new Aggregate();
//     aggr.test_name = 'test01';
//     aggr.save();

export { load_commit, status, renew, all };
