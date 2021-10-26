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
  passdate.year = classYear(uid);
  passdate.tests = new Array();
  result.forEach(function (v, k) {
    passdate.tests.push({ name: k, pass_date: v });
  });

  passdate.save();

  insertPassdateToAggregate(passdate);
}

// priv
function classYear(studentNum) {
  let year;
  return 2000 + Number(studentNum.slice(3, 5)) + 2;
}

// this is super data
let aggr = {};

// TODO
//サーバを立ち上げた際に自動でall()を叩けるようにする
//all(null, null);

// GET all
function all(req, res) {
  PassDate.find({}, function (err, passdates) {
    passdates.forEach(function (passdate) {
      insertPassdateToAggregate(passdate);
    });
    console.log(aggr);
    res.json(aggr);
  });
}

// priv
function insertPassdateToAggregate(passdate) {
  let author = passdate.author;
  passdate.tests.forEach(function (pd) {
    let name = pd.name;
    let date = round(pd.pass_date).toISOString();
    addUid(aggr, author, name, date);
    fillDate(aggr, name);
    sortDates(aggr, name);
  });
}

//priv
function sortDates(aggr, name) {
  let pairs = Object.entries(aggr[name]);
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
  aggr[name] = Object.fromEntries(pairs);
}

//priv
//filling is started from 2020-09-30T04:00:00.000Z
function fillDate(aggr, name) {
  let d = new Date("2020-09-30T00:00:00.000Z");
  let aggrName = aggr[name];
  for (let i = 0; i <= 3; i++) {
    //6 * 30 * 24
    if (!aggrName[d.toISOString()]) {
      aggrName[d.toISOString()] = [];
    }
    let aggr_date = aggrName[d.toISOString()];
    d.setHours(d.getHours() + 1);
  }
}

// priv
function addUid(aggr, author, name, date) {
  // TODO
  //if (Object.values(aggr).includes(classYear(author))) {
  //
  //}
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
function revengerCheck() {}

// priv
function round(date) {
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);
  return date;
}

function __all(req, res) {
  res.json({
    "enshud.s2.parser.ParserTest#testNormal18": {
      "2020-09-01T00:00:00.000Z": [],
      "2020-09-01T01:00:00.000Z": [],
      "2020-09-01T02:00:00.000Z": [],
      "2020-09-01T03:00:00.000Z": [],
      "2020-09-01T04:00:00.000Z": [],
      "2020-09-01T05:00:00.000Z": [],
      "2020-09-01T06:00:00.000Z": [],
      "2020-09-01T07:00:00.000Z": ["09B99001"],
      "2020-09-01T08:00:00.000Z": [],
      "2020-09-01T09:00:00.000Z": [],
      "2020-09-01T10:00:00.000Z": [],
      "2020-09-01T11:00:00.000Z": [],
      "2020-09-01T12:00:00.000Z": [],
      "2020-09-01T13:00:00.000Z": [],
      "2020-09-01T14:00:00.000Z": [],
      "2020-09-01T15:00:00.000Z": [],
      "2020-09-01T16:00:00.000Z": [],
      "2020-09-01T17:00:00.000Z": [],
      "2020-09-01T18:00:00.000Z": [],
      "2020-09-01T19:00:00.000Z": [],
      "2020-09-01T20:00:00.000Z": [],
      "2020-09-01T21:00:00.000Z": ["09B99002"],
      "2020-09-01T22:00:00.000Z": [],
      "2020-09-01T23:00:00.000Z": [],
      "2020-09-02T00:00:00.000Z": [],
      "2020-09-02T01:00:00.000Z": [],
      "2020-09-02T02:00:00.000Z": [],
      "2020-09-02T03:00:00.000Z": [],
      "2020-09-02T04:00:00.000Z": ["09B99031", "09B99030"],
      "2020-09-02T05:00:00.000Z": [],
      "2020-09-02T06:00:00.000Z": [],
      "2020-09-02T07:00:00.000Z": [],
      "2020-09-02T08:00:00.000Z": [],
      "2020-09-02T09:00:00.000Z": [],
      "2020-09-02T10:00:00.000Z": [],
      "2020-09-02T11:00:00.000Z": [],
      "2020-09-02T12:00:00.000Z": [],
      "2020-09-02T13:00:00.000Z": [],
      "2020-09-02T14:00:00.000Z": [],
      "2020-09-02T15:00:00.000Z": [],
      "2020-09-02T16:00:00.000Z": [],
      "2020-09-02T17:00:00.000Z": [],
      "2020-09-02T18:00:00.000Z": [],
      "2020-09-02T19:00:00.000Z": [],
      "2020-09-02T20:00:00.000Z": [],
      "2020-09-02T21:00:00.000Z": [],
      "2020-09-02T22:00:00.000Z": [],
      "2020-09-02T23:00:00.000Z": ["09B99901"],
      "2020-09-03T00:00:00.000Z": [],
      "2020-09-03T01:00:00.000Z": [],
      "2020-09-03T02:00:00.000Z": [],
      "2020-09-03T03:00:00.000Z": [],
      "2020-09-03T04:00:00.000Z": [],
      "2020-09-03T05:00:00.000Z": [],
      "2020-09-03T06:00:00.000Z": [],
      "2020-09-03T07:00:00.000Z": [],
      "2020-09-03T08:00:00.000Z": [],
      "2020-09-03T09:00:00.000Z": [],
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
      "2020-09-03T18:00:00.000Z": [],
      "2020-09-03T19:00:00.000Z": [],
      "2020-09-03T20:00:00.000Z": [],
      "2020-09-03T21:00:00.000Z": [],
      "2020-09-03T22:00:00.000Z": [],
      "2020-09-03T23:00:00.000Z": [],
      "2020-09-04T00:00:00.000Z": [],
      "2020-09-04T01:00:00.000Z": [],
      "2020-09-04T02:00:00.000Z": [],
      "2020-09-04T03:00:00.000Z": [],
      "2020-09-04T04:00:00.000Z": [],
      "2020-09-04T05:00:00.000Z": [],
      "2020-09-04T06:00:00.000Z": [],
      "2020-09-04T07:00:00.000Z": [],
      "2020-09-04T08:00:00.000Z": [],
      "2020-09-04T09:00:00.000Z": [],
      "2020-09-04T10:00:00.000Z": [],
      "2020-09-04T11:00:00.000Z": [],
      "2020-09-04T12:00:00.000Z": [],
      "2020-09-04T13:00:00.000Z": [],
      "2020-09-04T14:00:00.000Z": [],
      "2020-09-04T15:00:00.000Z": [],
      "2020-09-04T16:00:00.000Z": [],
      "2020-09-04T17:00:00.000Z": [],
      "2020-09-04T18:00:00.000Z": [],
      "2020-09-04T19:00:00.000Z": [],
      "2020-09-04T20:00:00.000Z": [],
      "2020-09-04T21:00:00.000Z": [],
      "2020-09-04T22:00:00.000Z": [],
      "2020-09-04T23:00:00.000Z": [],
      "2020-09-05T00:00:00.000Z": [],
      "2020-09-05T01:00:00.000Z": [],
      "2020-09-05T02:00:00.000Z": [],
      "2020-09-05T03:00:00.000Z": [],
      "2020-09-05T04:00:00.000Z": [],
      "2020-09-05T05:00:00.000Z": [],
      "2020-09-05T06:00:00.000Z": [],
      "2020-09-05T07:00:00.000Z": [],
      "2020-09-05T08:00:00.000Z": [],
      "2020-09-05T09:00:00.000Z": [],
      "2020-09-05T10:00:00.000Z": [],
      "2020-09-05T11:00:00.000Z": [],
      "2020-09-05T12:00:00.000Z": [],
      "2020-09-05T13:00:00.000Z": [],
      "2020-09-05T14:00:00.000Z": [],
      "2020-09-05T15:00:00.000Z": [],
      "2020-09-05T16:00:00.000Z": [],
      "2020-09-05T17:00:00.000Z": [],
      "2020-09-05T18:00:00.000Z": [],
      "2020-09-05T19:00:00.000Z": [],
      "2020-09-05T20:00:00.000Z": [],
      "2020-09-05T21:00:00.000Z": [],
      "2020-09-05T22:00:00.000Z": [],
      "2020-09-05T23:00:00.000Z": [],
      "2020-09-06T00:00:00.000Z": [],
      "2020-09-06T01:00:00.000Z": [],
      "2020-09-06T02:00:00.000Z": [],
      "2020-09-06T03:00:00.000Z": [],
      "2020-09-06T04:00:00.000Z": [],
      "2020-09-06T05:00:00.000Z": [],
      "2020-09-06T06:00:00.000Z": [],
      "2020-09-06T07:00:00.000Z": [],
      "2020-09-06T08:00:00.000Z": [],
      "2020-09-06T09:00:00.000Z": [],
      "2020-09-06T10:00:00.000Z": [],
      "2020-09-06T11:00:00.000Z": [],
      "2020-09-06T12:00:00.000Z": [],
      "2020-09-06T13:00:00.000Z": [],
      "2020-09-06T14:00:00.000Z": [],
      "2020-09-06T15:00:00.000Z": [],
      "2020-09-06T16:00:00.000Z": [],
      "2020-09-06T17:00:00.000Z": [],
      "2020-09-06T18:00:00.000Z": [],
      "2020-09-06T19:00:00.000Z": [],
      "2020-09-06T20:00:00.000Z": [],
      "2020-09-06T21:00:00.000Z": [],
      "2020-09-06T22:00:00.000Z": [],
      "2020-09-06T23:00:00.000Z": [],
      "2020-09-07T00:00:00.000Z": [],
      "2020-09-07T01:00:00.000Z": [],
      "2020-09-07T02:00:00.000Z": [],
      "2020-09-07T03:00:00.000Z": [],
      "2020-09-07T04:00:00.000Z": [],
      "2020-09-07T05:00:00.000Z": [],
      "2020-09-07T06:00:00.000Z": [],
      "2020-09-07T07:00:00.000Z": [],
      "2020-09-07T08:00:00.000Z": [],
      "2020-09-07T09:00:00.000Z": [],
      "2020-09-07T10:00:00.000Z": [],
      "2020-09-07T11:00:00.000Z": [],
      "2020-09-07T12:00:00.000Z": [],
      "2020-09-07T13:00:00.000Z": [],
      "2020-09-07T14:00:00.000Z": [],
      "2020-09-07T15:00:00.000Z": [],
      "2020-09-07T16:00:00.000Z": [],
      "2020-09-07T17:00:00.000Z": [],
      "2020-09-07T18:00:00.000Z": [],
      "2020-09-07T19:00:00.000Z": [],
      "2020-09-07T20:00:00.000Z": [],
      "2020-09-07T21:00:00.000Z": [],
      "2020-09-07T22:00:00.000Z": [],
      "2020-09-07T23:00:00.000Z": [],
      "2020-09-08T00:00:00.000Z": [],
      "2020-09-08T01:00:00.000Z": [],
      "2020-09-08T02:00:00.000Z": [],
      "2020-09-08T03:00:00.000Z": [],
      "2020-09-08T04:00:00.000Z": [],
      "2020-09-08T05:00:00.000Z": [],
      "2020-09-08T06:00:00.000Z": [],
      "2020-09-08T07:00:00.000Z": [],
      "2020-09-08T08:00:00.000Z": [],
      "2020-09-08T09:00:00.000Z": [],
      "2020-09-08T10:00:00.000Z": [],
      "2020-09-08T11:00:00.000Z": [],
      "2020-09-08T12:00:00.000Z": [],
      "2020-09-08T13:00:00.000Z": [],
      "2020-09-08T14:00:00.000Z": [],
      "2020-09-08T15:00:00.000Z": [],
      "2020-09-08T16:00:00.000Z": [],
      "2020-09-08T17:00:00.000Z": [],
      "2020-09-08T18:00:00.000Z": [],
      "2020-09-08T19:00:00.000Z": [],
      "2020-09-08T20:00:00.000Z": [],
      "2020-09-08T21:00:00.000Z": [],
      "2020-09-08T22:00:00.000Z": [],
      "2020-09-08T23:00:00.000Z": [],
      "2020-09-09T00:00:00.000Z": [],
      "2020-09-09T01:00:00.000Z": [],
      "2020-09-09T02:00:00.000Z": [],
      "2020-09-09T03:00:00.000Z": [],
      "2020-09-09T04:00:00.000Z": [],
      "2020-09-09T05:00:00.000Z": [],
      "2020-09-09T06:00:00.000Z": [],
      "2020-09-09T07:00:00.000Z": [],
      "2020-09-09T08:00:00.000Z": [],
      "2020-09-09T09:00:00.000Z": [],
      "2020-09-09T10:00:00.000Z": [],
      "2020-09-09T11:00:00.000Z": [],
      "2020-09-09T12:00:00.000Z": [],
      "2020-09-09T13:00:00.000Z": [],
      "2020-09-09T14:00:00.000Z": [],
      "2020-09-09T15:00:00.000Z": [],
      "2020-09-09T16:00:00.000Z": [],
      "2020-09-09T17:00:00.000Z": [],
      "2020-09-09T18:00:00.000Z": [],
      "2020-09-09T19:00:00.000Z": [],
      "2020-09-09T20:00:00.000Z": [],
      "2020-09-09T21:00:00.000Z": [],
      "2020-09-09T22:00:00.000Z": [],
      "2020-09-09T23:00:00.000Z": [],
      "2020-09-10T00:00:00.000Z": [],
      "2020-09-10T01:00:00.000Z": [],
      "2020-09-10T02:00:00.000Z": [],
      "2020-09-10T03:00:00.000Z": [],
      "2020-09-10T04:00:00.000Z": [],
      "2020-09-10T05:00:00.000Z": [],
      "2020-09-10T06:00:00.000Z": [],
      "2020-09-10T07:00:00.000Z": [],
      "2020-09-10T08:00:00.000Z": [],
      "2020-09-10T09:00:00.000Z": [],
      "2020-09-10T10:00:00.000Z": [],
      "2020-09-10T11:00:00.000Z": [],
      "2020-09-10T12:00:00.000Z": [],
      "2020-09-10T13:00:00.000Z": [],
      "2020-09-10T14:00:00.000Z": [],
      "2020-09-10T15:00:00.000Z": [],
      "2020-09-10T16:00:00.000Z": [],
      "2020-09-10T17:00:00.000Z": [],
      "2020-09-10T18:00:00.000Z": [],
      "2020-09-10T19:00:00.000Z": [],
      "2020-09-10T20:00:00.000Z": [],
      "2020-09-10T21:00:00.000Z": [],
      "2020-09-10T22:00:00.000Z": [],
      "2020-09-10T23:00:00.000Z": [],
      "2020-09-11T00:00:00.000Z": [],
      "2020-09-11T01:00:00.000Z": [],
      "2020-09-11T02:00:00.000Z": [],
      "2020-09-11T03:00:00.000Z": [],
      "2020-09-11T04:00:00.000Z": [],
      "2020-09-11T05:00:00.000Z": [],
      "2020-09-11T06:00:00.000Z": [],
      "2020-09-11T07:00:00.000Z": [],
      "2020-09-11T08:00:00.000Z": [],
      "2020-09-11T09:00:00.000Z": [],
      "2020-09-11T10:00:00.000Z": [],
      "2020-09-11T11:00:00.000Z": [],
      "2020-09-11T12:00:00.000Z": [],
      "2020-09-11T13:00:00.000Z": [],
      "2020-09-11T14:00:00.000Z": [],
      "2020-09-11T15:00:00.000Z": [],
      "2020-09-11T16:00:00.000Z": [],
      "2020-09-11T17:00:00.000Z": [],
      "2020-09-11T18:00:00.000Z": [],
      "2020-09-11T19:00:00.000Z": [],
      "2020-09-11T20:00:00.000Z": [],
      "2020-09-11T21:00:00.000Z": [],
      "2020-09-11T22:00:00.000Z": [],
      "2020-09-11T23:00:00.000Z": [],
      "2020-09-12T00:00:00.000Z": [],
      "2020-09-12T01:00:00.000Z": [],
      "2020-09-12T02:00:00.000Z": [],
      "2020-09-12T03:00:00.000Z": [],
      "2020-09-12T04:00:00.000Z": [],
      "2020-09-12T05:00:00.000Z": [],
      "2020-09-12T06:00:00.000Z": [],
      "2020-09-12T07:00:00.000Z": [],
      "2020-09-12T08:00:00.000Z": [],
      "2020-09-12T09:00:00.000Z": [],
      "2020-09-12T10:00:00.000Z": [],
      "2020-09-12T11:00:00.000Z": [],
      "2020-09-12T12:00:00.000Z": [],
      "2020-09-12T13:00:00.000Z": [],
      "2020-09-12T14:00:00.000Z": [],
      "2020-09-12T15:00:00.000Z": [],
      "2020-09-12T16:00:00.000Z": [],
      "2020-09-12T17:00:00.000Z": [],
      "2020-09-12T18:00:00.000Z": [],
      "2020-09-12T19:00:00.000Z": [],
      "2020-09-12T20:00:00.000Z": [],
      "2020-09-12T21:00:00.000Z": [],
      "2020-09-12T22:00:00.000Z": [],
      "2020-09-12T23:00:00.000Z": [],
      "2020-09-13T00:00:00.000Z": [],
      "2020-09-13T01:00:00.000Z": [],
      "2020-09-13T02:00:00.000Z": [],
      "2020-09-13T03:00:00.000Z": [],
      "2020-09-13T04:00:00.000Z": [],
      "2020-09-13T05:00:00.000Z": [],
      "2020-09-13T06:00:00.000Z": [],
      "2020-09-13T07:00:00.000Z": [],
      "2020-09-13T08:00:00.000Z": [],
      "2020-09-13T09:00:00.000Z": [],
      "2020-09-13T10:00:00.000Z": [],
      "2020-09-13T11:00:00.000Z": [],
      "2020-09-13T12:00:00.000Z": [],
      "2020-09-13T13:00:00.000Z": [],
      "2020-09-13T14:00:00.000Z": [],
      "2020-09-13T15:00:00.000Z": [],
      "2020-09-13T16:00:00.000Z": [],
      "2020-09-13T17:00:00.000Z": [],
      "2020-09-13T18:00:00.000Z": [],
      "2020-09-13T19:00:00.000Z": [],
      "2020-09-13T20:00:00.000Z": [],
      "2020-09-13T21:00:00.000Z": [],
      "2020-09-13T22:00:00.000Z": [],
      "2020-09-13T23:00:00.000Z": [],
      "2020-09-14T00:00:00.000Z": [],
      "2020-09-14T01:00:00.000Z": [],
      "2020-09-14T02:00:00.000Z": [],
      "2020-09-14T03:00:00.000Z": [],
      "2020-09-14T04:00:00.000Z": [],
      "2020-09-14T05:00:00.000Z": [],
      "2020-09-14T06:00:00.000Z": [],
      "2020-09-14T07:00:00.000Z": [],
      "2020-09-14T08:00:00.000Z": [],
      "2020-09-14T09:00:00.000Z": [],
      "2020-09-14T10:00:00.000Z": [],
      "2020-09-14T11:00:00.000Z": [],
      "2020-09-14T12:00:00.000Z": [],
      "2020-09-14T13:00:00.000Z": [],
      "2020-09-14T14:00:00.000Z": [],
      "2020-09-14T15:00:00.000Z": [],
      "2020-09-14T16:00:00.000Z": [],
      "2020-09-14T17:00:00.000Z": [],
      "2020-09-14T18:00:00.000Z": [],
      "2020-09-14T19:00:00.000Z": [],
      "2020-09-14T20:00:00.000Z": [],
      "2020-09-14T21:00:00.000Z": [],
      "2020-09-14T22:00:00.000Z": [],
      "2020-09-14T23:00:00.000Z": [],
      "2020-09-15T00:00:00.000Z": [],
      "2020-09-15T01:00:00.000Z": [],
      "2020-09-15T02:00:00.000Z": [],
      "2020-09-15T03:00:00.000Z": [],
      "2020-09-15T04:00:00.000Z": [],
      "2020-09-15T05:00:00.000Z": [],
      "2020-09-15T06:00:00.000Z": [],
      "2020-09-15T07:00:00.000Z": [],
      "2020-09-15T08:00:00.000Z": [],
      "2020-09-15T09:00:00.000Z": [],
      "2020-09-15T10:00:00.000Z": [],
      "2020-09-15T11:00:00.000Z": [],
      "2020-09-15T12:00:00.000Z": [],
      "2020-09-15T13:00:00.000Z": [],
      "2020-09-15T14:00:00.000Z": [],
      "2020-09-15T15:00:00.000Z": [],
      "2020-09-15T16:00:00.000Z": [],
      "2020-09-15T17:00:00.000Z": [],
      "2020-09-15T18:00:00.000Z": [],
      "2020-09-15T19:00:00.000Z": [],
      "2020-09-15T20:00:00.000Z": [],
      "2020-09-15T21:00:00.000Z": [],
      "2020-09-15T22:00:00.000Z": [],
      "2020-09-15T23:00:00.000Z": [],
      "2020-09-16T00:00:00.000Z": [],
      "2020-09-16T01:00:00.000Z": [],
      "2020-09-16T02:00:00.000Z": [],
      "2020-09-16T03:00:00.000Z": [],
      "2020-09-16T04:00:00.000Z": [],
      "2020-09-16T05:00:00.000Z": [],
      "2020-09-16T06:00:00.000Z": [],
      "2020-09-16T07:00:00.000Z": [],
      "2020-09-16T08:00:00.000Z": [],
      "2020-09-16T09:00:00.000Z": [],
      "2020-09-16T10:00:00.000Z": [],
      "2020-09-16T11:00:00.000Z": [],
      "2020-09-16T12:00:00.000Z": [],
      "2020-09-16T13:00:00.000Z": [],
      "2020-09-16T14:00:00.000Z": [],
      "2020-09-16T15:00:00.000Z": [],
      "2020-09-16T16:00:00.000Z": [],
      "2020-09-16T17:00:00.000Z": [],
      "2020-09-16T18:00:00.000Z": [],
      "2020-09-16T19:00:00.000Z": [],
      "2020-09-16T20:00:00.000Z": [],
      "2020-09-16T21:00:00.000Z": [],
      "2020-09-16T22:00:00.000Z": [],
      "2020-09-16T23:00:00.000Z": [],
      "2020-09-17T00:00:00.000Z": [],
      "2020-09-17T01:00:00.000Z": [],
      "2020-09-17T02:00:00.000Z": [],
      "2020-09-17T03:00:00.000Z": [],
      "2020-09-17T04:00:00.000Z": [],
      "2020-09-17T05:00:00.000Z": [],
      "2020-09-17T06:00:00.000Z": [],
      "2020-09-17T07:00:00.000Z": [],
      "2020-09-17T08:00:00.000Z": [],
      "2020-09-17T09:00:00.000Z": [],
      "2020-09-17T10:00:00.000Z": [],
      "2020-09-17T11:00:00.000Z": [],
      "2020-09-17T12:00:00.000Z": [],
      "2020-09-17T13:00:00.000Z": [],
      "2020-09-17T14:00:00.000Z": [],
      "2020-09-17T15:00:00.000Z": [],
      "2020-09-17T16:00:00.000Z": [],
      "2020-09-17T17:00:00.000Z": [],
      "2020-09-17T18:00:00.000Z": [],
      "2020-09-17T19:00:00.000Z": [],
      "2020-09-17T20:00:00.000Z": [],
      "2020-09-17T21:00:00.000Z": [],
      "2020-09-17T22:00:00.000Z": [],
      "2020-09-17T23:00:00.000Z": [],
      "2020-09-18T00:00:00.000Z": [],
      "2020-09-18T01:00:00.000Z": [],
      "2020-09-18T02:00:00.000Z": [],
      "2020-09-18T03:00:00.000Z": [],
      "2020-09-18T04:00:00.000Z": [],
      "2020-09-18T05:00:00.000Z": [],
      "2020-09-18T06:00:00.000Z": [],
      "2020-09-18T07:00:00.000Z": [],
      "2020-09-18T08:00:00.000Z": [],
      "2020-09-18T09:00:00.000Z": [],
      "2020-09-18T10:00:00.000Z": [],
      "2020-09-18T11:00:00.000Z": [],
      "2020-09-18T12:00:00.000Z": [],
      "2020-09-18T13:00:00.000Z": [],
      "2020-09-18T14:00:00.000Z": [],
      "2020-09-18T15:00:00.000Z": [],
      "2020-09-18T16:00:00.000Z": [],
      "2020-09-18T17:00:00.000Z": [],
      "2020-09-18T18:00:00.000Z": [],
      "2020-09-18T19:00:00.000Z": [],
      "2020-09-18T20:00:00.000Z": [],
      "2020-09-18T21:00:00.000Z": [],
      "2020-09-18T22:00:00.000Z": [],
      "2020-09-18T23:00:00.000Z": [],
      "2020-09-19T00:00:00.000Z": [],
      "2020-09-19T01:00:00.000Z": [],
      "2020-09-19T02:00:00.000Z": [],
      "2020-09-19T03:00:00.000Z": [],
      "2020-09-19T04:00:00.000Z": [],
      "2020-09-19T05:00:00.000Z": [],
      "2020-09-19T06:00:00.000Z": [],
      "2020-09-19T07:00:00.000Z": [],
      "2020-09-19T08:00:00.000Z": [],
      "2020-09-19T09:00:00.000Z": [],
      "2020-09-19T10:00:00.000Z": [],
      "2020-09-19T11:00:00.000Z": [],
      "2020-09-19T12:00:00.000Z": [],
      "2020-09-19T13:00:00.000Z": [],
      "2020-09-19T14:00:00.000Z": [],
      "2020-09-19T15:00:00.000Z": [],
      "2020-09-19T16:00:00.000Z": [],
      "2020-09-19T17:00:00.000Z": [],
      "2020-09-19T18:00:00.000Z": [],
      "2020-09-19T19:00:00.000Z": [],
      "2020-09-19T20:00:00.000Z": [],
      "2020-09-19T21:00:00.000Z": [],
      "2020-09-19T22:00:00.000Z": [],
      "2020-09-19T23:00:00.000Z": [],
      "2020-09-20T00:00:00.000Z": [],
      "2020-09-20T01:00:00.000Z": [],
      "2020-09-20T02:00:00.000Z": [],
      "2020-09-20T03:00:00.000Z": [],
      "2020-09-20T04:00:00.000Z": [],
      "2020-09-20T05:00:00.000Z": [],
      "2020-09-20T06:00:00.000Z": [],
      "2020-09-20T07:00:00.000Z": [],
      "2020-09-20T08:00:00.000Z": [],
      "2020-09-20T09:00:00.000Z": [],
      "2020-09-20T10:00:00.000Z": [],
      "2020-09-20T11:00:00.000Z": [],
      "2020-09-20T12:00:00.000Z": [],
      "2020-09-20T13:00:00.000Z": [],
      "2020-09-20T14:00:00.000Z": [],
      "2020-09-20T15:00:00.000Z": [],
      "2020-09-20T16:00:00.000Z": [],
      "2020-09-20T17:00:00.000Z": [],
      "2020-09-20T18:00:00.000Z": [],
      "2020-09-20T19:00:00.000Z": [],
      "2020-09-20T20:00:00.000Z": [],
      "2020-09-20T21:00:00.000Z": [],
      "2020-09-20T22:00:00.000Z": [],
      "2020-09-20T23:00:00.000Z": [],
      "2020-09-21T00:00:00.000Z": [],
      "2020-09-21T01:00:00.000Z": [],
      "2020-09-21T02:00:00.000Z": [],
      "2020-09-21T03:00:00.000Z": [],
      "2020-09-21T04:00:00.000Z": [],
      "2020-09-21T05:00:00.000Z": [],
      "2020-09-21T06:00:00.000Z": [],
      "2020-09-21T07:00:00.000Z": [],
      "2020-09-21T08:00:00.000Z": [],
      "2020-09-21T09:00:00.000Z": [],
      "2020-09-21T10:00:00.000Z": [],
      "2020-09-21T11:00:00.000Z": [],
      "2020-09-21T12:00:00.000Z": [],
      "2020-09-21T13:00:00.000Z": [],
      "2020-09-21T14:00:00.000Z": [],
      "2020-09-21T15:00:00.000Z": [],
      "2020-09-21T16:00:00.000Z": [],
      "2020-09-21T17:00:00.000Z": [],
      "2020-09-21T18:00:00.000Z": [],
      "2020-09-21T19:00:00.000Z": [],
      "2020-09-21T20:00:00.000Z": [],
      "2020-09-21T21:00:00.000Z": [],
      "2020-09-21T22:00:00.000Z": [],
      "2020-09-21T23:00:00.000Z": [],
      "2020-09-22T00:00:00.000Z": [],
      "2020-09-22T01:00:00.000Z": [],
      "2020-09-22T02:00:00.000Z": [],
      "2020-09-22T03:00:00.000Z": [],
      "2020-09-22T04:00:00.000Z": [],
      "2020-09-22T05:00:00.000Z": [],
      "2020-09-22T06:00:00.000Z": [],
      "2020-09-22T07:00:00.000Z": [],
      "2020-09-22T08:00:00.000Z": [],
      "2020-09-22T09:00:00.000Z": [],
      "2020-09-22T10:00:00.000Z": [],
      "2020-09-22T11:00:00.000Z": [],
      "2020-09-22T12:00:00.000Z": [],
      "2020-09-22T13:00:00.000Z": [],
      "2020-09-22T14:00:00.000Z": [],
      "2020-09-22T15:00:00.000Z": [],
      "2020-09-22T16:00:00.000Z": [],
      "2020-09-22T17:00:00.000Z": [],
      "2020-09-22T18:00:00.000Z": [],
      "2020-09-22T19:00:00.000Z": [],
      "2020-09-22T20:00:00.000Z": [],
      "2020-09-22T21:00:00.000Z": [],
      "2020-09-22T22:00:00.000Z": [],
      "2020-09-22T23:00:00.000Z": [],
      "2020-09-23T00:00:00.000Z": [],
      "2020-09-23T01:00:00.000Z": [],
      "2020-09-23T02:00:00.000Z": [],
      "2020-09-23T03:00:00.000Z": [],
      "2020-09-23T04:00:00.000Z": [],
      "2020-09-23T05:00:00.000Z": [],
      "2020-09-23T06:00:00.000Z": [],
      "2020-09-23T07:00:00.000Z": [],
      "2020-09-23T08:00:00.000Z": [],
      "2020-09-23T09:00:00.000Z": [],
      "2020-09-23T10:00:00.000Z": [],
      "2020-09-23T11:00:00.000Z": [],
      "2020-09-23T12:00:00.000Z": [],
      "2020-09-23T13:00:00.000Z": [],
      "2020-09-23T14:00:00.000Z": [],
      "2020-09-23T15:00:00.000Z": [],
      "2020-09-23T16:00:00.000Z": [],
      "2020-09-23T17:00:00.000Z": [],
      "2020-09-23T18:00:00.000Z": [],
      "2020-09-23T19:00:00.000Z": [],
      "2020-09-23T20:00:00.000Z": [],
      "2020-09-23T21:00:00.000Z": [],
      "2020-09-23T22:00:00.000Z": [],
      "2020-09-23T23:00:00.000Z": [],
      "2020-09-24T00:00:00.000Z": [],
      "2020-09-24T01:00:00.000Z": [],
      "2020-09-24T02:00:00.000Z": [],
      "2020-09-24T03:00:00.000Z": [],
      "2020-09-24T04:00:00.000Z": [],
      "2020-09-24T05:00:00.000Z": [],
      "2020-09-24T06:00:00.000Z": [],
      "2020-09-24T07:00:00.000Z": [],
      "2020-09-24T08:00:00.000Z": [],
      "2020-09-24T09:00:00.000Z": [],
      "2020-09-24T10:00:00.000Z": [],
      "2020-09-24T11:00:00.000Z": [],
      "2020-09-24T12:00:00.000Z": [],
      "2020-09-24T13:00:00.000Z": [],
      "2020-09-24T14:00:00.000Z": [],
      "2020-09-24T15:00:00.000Z": [],
      "2020-09-24T16:00:00.000Z": [],
      "2020-09-24T17:00:00.000Z": [],
      "2020-09-24T18:00:00.000Z": [],
      "2020-09-24T19:00:00.000Z": [],
      "2020-09-24T20:00:00.000Z": [],
      "2020-09-24T21:00:00.000Z": [],
      "2020-09-24T22:00:00.000Z": [],
      "2020-09-24T23:00:00.000Z": [],
      "2020-09-25T00:00:00.000Z": [],
      "2020-09-25T01:00:00.000Z": [],
      "2020-09-25T02:00:00.000Z": [],
      "2020-09-25T03:00:00.000Z": [],
      "2020-09-25T04:00:00.000Z": [],
      "2020-09-25T05:00:00.000Z": [],
      "2020-09-25T06:00:00.000Z": [],
      "2020-09-25T07:00:00.000Z": [],
      "2020-09-25T08:00:00.000Z": [],
      "2020-09-25T09:00:00.000Z": [],
      "2020-09-25T10:00:00.000Z": [],
      "2020-09-25T11:00:00.000Z": [],
      "2020-09-25T12:00:00.000Z": [],
      "2020-09-25T13:00:00.000Z": [],
      "2020-09-25T14:00:00.000Z": [],
      "2020-09-25T15:00:00.000Z": [],
      "2020-09-25T16:00:00.000Z": [],
      "2020-09-25T17:00:00.000Z": [],
      "2020-09-25T18:00:00.000Z": [],
      "2020-09-25T19:00:00.000Z": [],
      "2020-09-25T20:00:00.000Z": [],
      "2020-09-25T21:00:00.000Z": [],
      "2020-09-25T22:00:00.000Z": [],
      "2020-09-25T23:00:00.000Z": [],
      "2020-09-26T00:00:00.000Z": [],
      "2020-09-26T01:00:00.000Z": [],
      "2020-09-26T02:00:00.000Z": [],
      "2020-09-26T03:00:00.000Z": [],
      "2020-09-26T04:00:00.000Z": [],
      "2020-09-26T05:00:00.000Z": [],
      "2020-09-26T06:00:00.000Z": [],
      "2020-09-26T07:00:00.000Z": [],
      "2020-09-26T08:00:00.000Z": [],
      "2020-09-26T09:00:00.000Z": [],
      "2020-09-26T10:00:00.000Z": [],
      "2020-09-26T11:00:00.000Z": [],
      "2020-09-26T12:00:00.000Z": [],
      "2020-09-26T13:00:00.000Z": [],
      "2020-09-26T14:00:00.000Z": [],
      "2020-09-26T15:00:00.000Z": [],
      "2020-09-26T16:00:00.000Z": [],
      "2020-09-26T17:00:00.000Z": [],
      "2020-09-26T18:00:00.000Z": [],
      "2020-09-26T19:00:00.000Z": [],
      "2020-09-26T20:00:00.000Z": [],
      "2020-09-26T21:00:00.000Z": [],
      "2020-09-26T22:00:00.000Z": [],
      "2020-09-26T23:00:00.000Z": [],
      "2020-09-27T00:00:00.000Z": [],
      "2020-09-27T01:00:00.000Z": [],
      "2020-09-27T02:00:00.000Z": [],
      "2020-09-27T03:00:00.000Z": [],
      "2020-09-27T04:00:00.000Z": [],
      "2020-09-27T05:00:00.000Z": [],
      "2020-09-27T06:00:00.000Z": [],
      "2020-09-27T07:00:00.000Z": [],
      "2020-09-27T08:00:00.000Z": [],
      "2020-09-27T09:00:00.000Z": [],
      "2020-09-27T10:00:00.000Z": [],
      "2020-09-27T11:00:00.000Z": [],
      "2020-09-27T12:00:00.000Z": [],
      "2020-09-27T13:00:00.000Z": [],
      "2020-09-27T14:00:00.000Z": [],
      "2020-09-27T15:00:00.000Z": [],
      "2020-09-27T16:00:00.000Z": [],
      "2020-09-27T17:00:00.000Z": [],
      "2020-09-27T18:00:00.000Z": [],
      "2020-09-27T19:00:00.000Z": [],
      "2020-09-27T20:00:00.000Z": [],
      "2020-09-27T21:00:00.000Z": [],
      "2020-09-27T22:00:00.000Z": [],
      "2020-09-27T23:00:00.000Z": [],
      "2020-09-28T00:00:00.000Z": [],
      "2020-09-28T01:00:00.000Z": [],
      "2020-09-28T02:00:00.000Z": [],
      "2020-09-28T03:00:00.000Z": [],
      "2020-09-28T04:00:00.000Z": [],
      "2020-09-28T05:00:00.000Z": [],
      "2020-09-28T06:00:00.000Z": [],
      "2020-09-28T07:00:00.000Z": [],
      "2020-09-28T08:00:00.000Z": [],
      "2020-09-28T09:00:00.000Z": [],
      "2020-09-28T10:00:00.000Z": [],
      "2020-09-28T11:00:00.000Z": [],
      "2020-09-28T12:00:00.000Z": [],
      "2020-09-28T13:00:00.000Z": [],
      "2020-09-28T14:00:00.000Z": [],
      "2020-09-28T15:00:00.000Z": [],
      "2020-09-28T16:00:00.000Z": [],
      "2020-09-28T17:00:00.000Z": [],
      "2020-09-28T18:00:00.000Z": [],
      "2020-09-28T19:00:00.000Z": [],
      "2020-09-28T20:00:00.000Z": [],
      "2020-09-28T21:00:00.000Z": [],
      "2020-09-28T22:00:00.000Z": [],
      "2020-09-28T23:00:00.000Z": [],
      "2020-09-29T00:00:00.000Z": [],
      "2020-09-29T01:00:00.000Z": [],
      "2020-09-29T02:00:00.000Z": [],
      "2020-09-29T03:00:00.000Z": [],
      "2020-09-29T04:00:00.000Z": [],
      "2020-09-29T05:00:00.000Z": [],
      "2020-09-29T06:00:00.000Z": [],
      "2020-09-29T07:00:00.000Z": [],
      "2020-09-29T08:00:00.000Z": [],
      "2020-09-29T09:00:00.000Z": [],
      "2020-09-29T10:00:00.000Z": [],
      "2020-09-29T11:00:00.000Z": [],
      "2020-09-29T12:00:00.000Z": [],
      "2020-09-29T13:00:00.000Z": [],
      "2020-09-29T14:00:00.000Z": [],
      "2020-09-29T15:00:00.000Z": [],
      "2020-09-29T16:00:00.000Z": [],
      "2020-09-29T17:00:00.000Z": [],
      "2020-09-29T18:00:00.000Z": [],
      "2020-09-29T19:00:00.000Z": [],
      "2020-09-29T20:00:00.000Z": [],
      "2020-09-29T21:00:00.000Z": [],
      "2020-09-29T22:00:00.000Z": [],
      "2020-09-29T23:00:00.000Z": [],
    },
    "enshud.s2.parser.ParserTest#testNormal19": {
      "2020-11-03T08:00:00.000Z": ["09B18058"],
    },
    "enshud.s2.parser.ParserTest#testNormal29": {
      "2020-11-03T08:00:00.000Z": [],
    },
  });
}

//     let aggr = new Aggregate();
//     aggr.test_name = 'test01';
//     aggr.save();

export { load_commit, status, renew, all };
