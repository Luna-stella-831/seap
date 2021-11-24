let all;
let checkboxS1 = document.getElementById("s1");
let checkboxS2 = document.getElementById("s2");
let checkboxS3 = document.getElementById("s3");
let checkboxS4 = document.getElementById("s4");
let idButton = document.getElementById("checkButton");
let idFrom = document.getElementById("studentId");
checkboxS1.addEventListener("change", taskChange);
checkboxS2.addEventListener("change", taskChange);
checkboxS3.addEventListener("change", taskChange);
checkboxS4.addEventListener("change", taskChange);
idButton.addEventListener('click', butotnClick);

fetch("https://loki.ics.es.osaka-u.ac.jp/seap/api/all")
	.then((response) => response.json())
	.then((data) => plotBars(data));
////////////////////////////////////////////////////////////////////////////////

// → s1.lexer & today(2021/10/19 = 0.75

var drawingDatas = [
	["City", "達成者割合", {
		role: "style"
	}, {
			role: "annotation"
		}],
	//["Lexer#Test01", 0.93, "color: #76A7FA", ""],
	//["Lexer#Test02", 0.85, "color: #76A7FA", ""],
	//[
	//	"Lexer#Test03",
	//	0.33,
	//	"stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
	//	"",
	//],
	//[
	//	"Lexer#Test04",
	//	0.32,
	//	"stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
	//	"",
	//],
	//[
	//	"Lexer#Test05",
	//	0.11,
	//	"stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
	//	"",
	//],
];

async function plotBars(all) {
	//console.log("all:" + all);
	const thisYear = all.filter((year) => year.year === 2021)[0];
	//console.log("thisYear:" + thisYear);

	const thisYearTasks = {};
	await calPassRatio(all, thisYearTasks, thisYear);

	console.log(drawingDatas);
	google.charts.load("current", {
		packages: ["corechart", "bar"]
	});
	google.charts.setOnLoadCallback(drawBasic);
}

async function parseThisYearInfo(thisYear) {
	return thisYear.tasks.map((task) => {
		if (task.taskName != "s0.trial") {
			const offsetHour = Math.round(
				(new Date() - new Date(task.deadline)) / (60 * 60 * 1000)
				//(new Date("2022-01-28T23:59:00.000+09:00") - new Date(task.deadline)) /
				//	(60 * 60 * 1000)
			);
			console.log(task.taskName + "締め切りまであと" + offsetHour * (-1) + "時間");
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
				let passTests = [];
				task.tests.forEach((test) => {
					const passIdCount = test.passInfos
						.filter((info) => info.hoursBefore < offset)
						.map((info) => info.passIds.length)
						.reduce((a, b) => a + b);

					const allIdCount = test.passInfos
						.map((info) => info.passIds.length)
						.reduce((a, b) => a + b);

					test.passInfos.map((info) => {
						if (info.passIds.includes(idFrom.value)) {
							passTests.push(test.testName);
						}
					})
					console.log("passTests：" + passTests);
					//console.log(test.testName + " = " + passIdCount + " / " + allIdCount);
					//document.write(test.testName + ":" + passIdCount / allIdCount);

					// TODO
					// you should bind by year
					if (year.year == 2021 - 1) {
						//console.log(decideDrawingTask());
						if (test.testName.split(".")[1] == decideDrawingTask()) {
							if (passTests.includes(test.testName)) {
								drawingDatas.push([
									test.testName.split(".")[3],
									//.slice(0, test.testName.split(".")[3].length - 4),
									passIdCount / allIdCount,
									"color: #76A7FA", "",
								]);
							} else {
								drawingDatas.push([
									test.testName.split(".")[3],
									//.slice(0, test.testName.split(".")[3].length - 4),
									passIdCount / allIdCount,
									"stroke-color: blue; stroke-width: 1; fill-color: #76A7FA; opacity: 0.2",
									"",
								]);
							}
						}
					}
				});
			}
		});
	});
}



function decideDrawingTask() {
	if (checkboxS1.checked) {
		return "s1";
	} else if (checkboxS2.checked) {
		return "s2";
	} else if (checkboxS3.checked) {
		return "s3";
	} else if (checkboxS4.checked) {
		return "s4";
	}
}

function taskChange(event) {
	//console.log("選択されているのは " + event.currentTarget.value + " です");
	drawingDatas = [
		["City", "達成者割合", {
			role: "style"
		}, {
				role: "annotation"
			}],
	];
	fetch("https://loki.ics.es.osaka-u.ac.jp/seap/api/all")
		.then((response) => response.json())
		.then((data) => plotBars(data));
}

function butotnClick() {
	drawingDatas = [
		["City", "達成者割合", {
			role: "style"
		}, {
				role: "annotation"
			}],
	];
	fetch("https://loki.ics.es.osaka-u.ac.jp/seap/api/all")
		.then((response) => response.json())
		.then((data) => plotBars(data));
}
////////////////////////////////////////////////////////////////////////////////

function drawBasic() {
	var data = google.visualization.arrayToDataTable(drawingDatas);

	var options = {
		chartArea: {
			width: "50%"
		},
		legend: {
			position: "none"
		},
		hAxis: {
			format: "percent",
			minValue: 0,
			maxValue: 1,
		},
		width: 1500,
		height: 2000,
	};

	var chart = new google.visualization.BarChart(
		document.getElementById("chart_div")
	);

	chart.draw(data, options);
}