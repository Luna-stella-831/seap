
fetch('/api/all')
  .then(response => response.json());
  //.then(data => plotBars(data));



all = [
 {
    "year":2020,
    "tasks":[
       {
          "taskName":"s1.lexer",
          "deadline":"2020-10-21T00:00:00.000+09:00",
          "tests":[
             {
                "testName":"enshud.s1.lexer.LexerTest#testNormal01",
                "passInfos":[
                   {
                      "passDate":"2020-10-02T09:00:00.000+09:00",
                      "hoursBefore":-380,
                      "passIds":[
                         "09B18001"
                      ]
                   },
                   {
                      "passDate":"2020-10-19T20:00:00.000+09:00",
                      "hoursBefore":-55,
                      "passIds":[
                         "09B18058",
                         "09B18052"
                      ]
                   },
                   {
                      "passDate":"2020-10-20T09:00:00.000+09:00",
                      "hoursBefore":-13,
                      "passIds":[
                         "09B18053"
                      ]
                   }
                ]
             }
          ]
       }
    ]
 },
 {
    "year":2021,
    "tasks":[
       {
          "taskName":"s1.lexer",
          "deadline":"2021-11-20T00:00:00.000+09:00",
          "tests":[

          ]
       }, {
          "taskName":"s2.parser",
          "deadline":"2021-11-21T00:00:00.000+09:00",
          "tests":[

          ]
       },
    ]
 }
];
////////////////////////////////////////////////////////////////////////////////

// → s1.lexer & today(2021/10/19 = 0.75

const thisYear = all.filter(year => year.year===2021)[0];


const tmp = thisYear.tasks.map(task => {
  const offsetHour = Math.round((new Date() - new Date(task.deadline)) / (60*60*1000));
  return {taskName: task.taskName, deadline: task.deadline, offsetHour: offsetHour};
});

const thisYearTasks = {};
tmp.forEach(t => {
  thisYearTasks[t.taskName] = t;
});

all.forEach(year => {
  year.tasks.forEach(task => {
    const taskName = task.taskName;
    task.tests.forEach(test => {
      const offset = thisYearTasks[taskName].offsetHour;
      console.log(offset);

      const passIdCount = test.passInfos
        .filter(info => info.hoursBefore < offset)
        .map(info => info.passIds.length)
        .reduce((a,b) => a+b);

      const allIdCount = test.passInfos
        .map(info => info.passIds.length)
        .reduce((a,b) => a+b);

      console.log(test.testName + " = " + passIdCount + " / " + allIdCount);
      document.write(passIdCount/allIdCount);
    });
  });
});


////////////////////////////////////////////////////////////////////////////////
google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {
  var data = google.visualization.arrayToDataTable([
    ['City', '達成者割合', { role: 'style' }, {role: 'annotation'}],
    ['Lexer#Test01', 0.93, 'color: #76A7FA', ''],
    ['Lexer#Test02', 0.85, 'color: #76A7FA', ''],
    ['Lexer#Test03', 0.33, 'stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2', ''],
    ['Lexer#Test04', 0.32, 'stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2', ''],
    ['Lexer#Test05', 0.11, 'stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2', ''],
  ]);

  var options = {
    chartArea: {width: '50%'},
    legend: { position: "none" },
    hAxis: {
      format: 'percent'
    }
  };

  var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

  chart.draw(data, options);
}
