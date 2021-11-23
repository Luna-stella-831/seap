let all;

fetch("https://loki.ics.es.osaka-u.ac.jp/seap/api/all")
	.then((response) => response.json())
	.then((data) => plotBars(data));
////////////////////////////////////////////////////////////////////////////////

// → s1.lexer & today(2021/10/19 = 0.75

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

async function plotBars(all) {
	//console.log("all:" + all);
	const thisYear = all.filter((year) => year.year === 2021)[0];
	//console.log("thisYear:" + thisYear);

	const thisYearTasks = {};
	await calPassRatio(all, thisYearTasks, thisYear);

	console.log(drawingDatas);
	google.charts.load("current", { packages: ["corechart", "bar"] });
	google.charts.setOnLoadCallback(drawBasic);
}

async function parseThisYearInfo(thisYear) {
	return thisYear.tasks.map((task) => {
		if (task.taskName != "s0.trial") {
			const offsetHour = Math.round(
				(new Date() - new Date(task.deadline)) / (60 * 60 * 1000)
			);
			//console.log("taskName:" + task.taskName);
			//console.log("offsetHour:" + offsetHour);
			return {
				taskName: task.taskName,
				deadline: task.deadline,
				offsetHour: offsetHour,
			};
		}
	});
}

async function makeThisYearTasks(thisYearTasks, thisYear) {
	const tmp = await parseThisYearInfo(thisYear);
	tmp.shift(); // remove s0.trial
	tmp.forEach((t) => {
		//console.log("tmp:" + t.offsetHour);
		thisYearTasks[t.taskName] = t;
	});
}

async function calPassRatio(all, thisYearTasks, thisYear) {
	await makeThisYearTasks(thisYearTasks, thisYear);
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName != "s0.trial") {
				const taskName = task.taskName;
				const offset = thisYearTasks[taskName].offsetHour;
				//console.log(year.year + taskName + "'s offset: " + offset);
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
					if (year.year == new Date().getFullYear() - 1) {
						drawingDatas.push([
							test.testName.split(".")[3],
							passIdCount / allIdCount,
							"stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
							"",
						]);
					}
				});
			}
		});
	});
}
////////////////////////////////////////////////////////////////////////////////

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
