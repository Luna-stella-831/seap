let all;

fetch("http://172.16.1.114:3000/seap/api/all").then((response) => {
   if (response.ok) { // HTTP ステータスが 200-299 の場合
      // レスポンスの本文を取得(後述)
      all = response.json();
   } else {
      alert("HTTP-Error: " + response.status);
   }
})

console.log(all)

_all = [
   {
      year: 2021,
      tasks: [
         {
            taskName: "s1.lexer",
            deadline: "2021-10-21T00:00:00.000+09:00",
            tests: [],
         },
         {
            taskName: "s2.parser",
            deadline: "2021-11-19T23:59:00.000+09:00",
            tests: [],
         },
         {
            taskName: "s3.checker",
            deadline: "2021-12-17T23:59:00.000+09:00",
            tests: [],
         },
         {
            taskName: "s4.complier",
            deadline: "2022-01-28T23:59:00.000+09:00",
            tests: [],
         },
      ],
   },
   {
      year: 2020,
      tasks: [
         {
            taskName: "s1.lexer",
            deadline: "2020-10-16T23:59:00.000+09:00",
            tests: [],
         },
         {
            taskName: "s2.parser",
            deadline: "2020-11-06T23:59:00.000+09:00",
            tests: [],
         },
         {
            taskName: "s3.checker",
            deadline: "2020-12-11T23:59:00.000+09:00",
            tests: [
               {
                  testName: "enshud.s3.checker.CheckerTest#testNormal01",
                  passInfos: [
                     {
                        passDate: "2021-11-30T09:00:00.000+09:00",
                        hoursBefore: -279,
                        passIds: ["09B19001"],
                     },
                     {
                        passDate: "2021-12-03T20:00:00.000+09:00",
                        hoursBefore: -196,
                        passIds: ["09B19058", "09B19052"],
                     },
                     {
                        passDate: "2021-10-09T09:00:00.000+09:00",
                        hoursBefore: -63,
                        passIds: ["09B19053"],
                     },
                  ],
               },
               {
                  testName: "enshud.s3.checker.CheckerTest#testNormal02",
                  passInfos: [
                     {
                        passDate: "2021-11-30T09:00:00.000+09:00",
                        hoursBefore: -279,
                        passIds: ["09B19001"],
                     },
                     {
                        passDate: "2021-12-03T20:00:00.000+09:00",
                        hoursBefore: -196,
                        passIds: ["09B19058", "09B19052"],
                     },
                     {
                        passDate: "2021-10-09T09:00:00.000+09:00",
                        hoursBefore: -63,
                        passIds: ["09B19053"],
                     },
                  ],
               },
            ],
         },
         {
            taskName: "s4.complier",
            deadline: "2021-01-22T23:59:00.000+09:00",
            tests: [],
         },
      ],
   },
];
////////////////////////////////////////////////////////////////////////////////

// → s1.lexer & today(2021/10/19 = 0.75

const thisYear = _all.filter((year) => year.year === 2021)[0];

const tmp = thisYear.tasks.map((task) => {
   const offsetHour = Math.round(
      (new Date() - new Date(task.deadline)) / (60 * 60 * 1000)
   );
   console.log("taskName:" + task.taskName);
   console.log("offsetHour:" + offsetHour);
   return {
      taskName: task.taskName,
      deadline: task.deadline,
      offsetHour: offsetHour,
   };
});

var drawingDatas = [
   ["City", "達成者割合", { role: "style" }, { role: "annotation" }],
   ["Lexer#Test01", 0.93, "color: #76A7FA", ""],
   ["Lexer#Test02", 0.85, "color: #76A7FA", ""],
   [
      "Lexer#Test03",
      0.33,
      "stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
      "",
   ],
   [
      "Lexer#Test04",
      0.32,
      "stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
      "",
   ],
   [
      "Lexer#Test05",
      0.11,
      "stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
      "",
   ],
];

const thisYearTasks = {};
tmp.forEach((t) => {
   //console.log("tmp:" + t.offsetHour);
   thisYearTasks[t.taskName] = t;
});

_all.forEach((year) => {
   year.tasks.forEach((task) => {
      const taskName = task.taskName;
      const offset = thisYearTasks[taskName].offsetHour;
      //console.log(taskName + "'s offset: " + offset);
      task.tests.forEach((test) => {
         const passIdCount = test.passInfos
            .filter((info) => info.hoursBefore < offset)
            .map((info) => info.passIds.length)
            .reduce((a, b) => a + b);

         const allIdCount = test.passInfos
            .map((info) => info.passIds.length)
            .reduce((a, b) => a + b);

         //console.log(test.testName + " = " + passIdCount + " / " + allIdCount);
         //document.write(test.testName + ":" + passIdCount / allIdCount);

         // TODO
         // you should bind by year
         //if (year == new Date().getFullYear() - 1) {
         drawingDatas.push([
            test.testName.split(".")[3],
            passIdCount / allIdCount,
            "stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
            "",
         ]);
         //}
      });
   });
});

////////////////////////////////////////////////////////////////////////////////
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {
   var data = google.visualization.arrayToDataTable(drawingDatas);

   var options = {
      chartArea: { width: "50%" },
      legend: { position: "none" },
      hAxis: {
         format: "percent",
      },
   };

   var chart = new google.visualization.BarChart(
      document.getElementById("chart_div")
   );

   chart.draw(data, options);
}
