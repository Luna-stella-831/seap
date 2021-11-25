let all;
let checkboxS1 = document.getElementById("s1");
let checkboxS2 = document.getElementById("s2");
let checkboxS3 = document.getElementById("s3");
let checkboxS4 = document.getElementById("s4");
let year2021 = document.getElementById("2021");
let year2020 = document.getElementById("2020");
let year2019 = document.getElementById("2019");
let year2018 = document.getElementById("2018");
let uidForm = document.getElementById("studentId");
let uidButton = document.getElementById("checkButton");
let idNotFound = document.getElementById("idNotFound");
checkboxS1.addEventListener("change", taskChange);
checkboxS2.addEventListener("change", taskChange);
checkboxS3.addEventListener("change", taskChange);
checkboxS4.addEventListener("change", taskChange);
year2021.addEventListener("change", changeYear);
year2020.addEventListener("change", changeYear);
year2019.addEventListener("change", changeYear);
year2018.addEventListener("change", changeYear);
uidForm.addEventListener("keydown", function (e) {
	if (e.keyCode === 13) {
		changeUid();
	}
});
uidButton.addEventListener("click", changeUid);

//const endpoint = 'http://172.16.1.114:3000/seap/';
const endpoint = "https://loki.ics.es.osaka-u.ac.jp/seap/";
const endpointAllApi = endpoint + "api/all";

const uid = new URL(document.location.href).searchParams.get("uid");
uidForm.value = uid;

fetch(endpointAllApi)
	.then((response) => response.json())
	.then((data) => {
		all = data;
		plotBars();
	});

////////////////////////////////////////////////////////////////////////////////

// → s1.lexer & today(2021/10/19 = 0.75

var drawingDatas = [
	[
		"City",
		"達成者割合",
		{
			role: "style",
		},
		{
			role: "annotation",
		},
	],
];

async function plotBars() {
	const thisYear = all.filter((year) => year.year === 2021)[0];
	//console.log("thisYear:" + thisYear);

	const thisYearTasks = {};
	await calPassRatio(thisYearTasks, thisYear);

	//console.log(drawingDatas);
	google.charts.load("current", {
		packages: ["corechart", "bar"],
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
			//console.log(task.taskName + "締め切りまであと" + offsetHour * (-1) + "時間");
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

async function checkPassedTests(passTests, thisYearTasks) {
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName != "s0.trial") {
				const taskName = task.taskName;
				const offset = thisYearTasks[taskName].offsetHour;
				//console.log(year.year + taskName + "'s offset: " + offset);
				task.tests.forEach((test) => {
					test.passInfos.map((info) => {
						if (info.passIds.includes(uidForm.value)) {
							//console.log(uidForm.value + " pass "+ test.testName)
							passTests.push(test.testName);
						}
					});
				});
			}
		});
	});
}

async function calPassRatio(thisYearTasks, thisYear) {
	await makeThisYearTasks(thisYearTasks, thisYear);
	let passTests = [];
	await checkPassedTests(passTests, thisYearTasks);
	//console.log(passTests);
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

					let allIdCount = test.passInfos
						.map((info) => info.passIds.length)
						.reduce((a, b) => a + b);
					
					if(year.year==2021){
						allIdCount = 79;
					}
					//console.log("passTests：" + passTests);
					//console.log(test.testName + " = " + passIdCount + " / " + allIdCount);
					//document.write(test.testName + ":" + passIdCount / allIdCount);

					// TODO
					// you should bind by year
					if (year.year == decideDrawingYear()) {
						//console.log(decideDrawingTask());
						if (test.testName.split(".")[1] == decideDrawingTask()) {
							//console.log(uidForm.value + "'s passTests "+ passTests)
							if (passTests.includes(test.testName)) {
								drawingDatas.push([
									test.testName.split(".")[3],
									//.slice(0, test.testName.split(".")[3].length - 4),
									passIdCount / allIdCount,
									"color: #76A7FA",
									"",
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
				//console.log(uidForm.value);
				//console.log(passTests);
			}
		});
	});
}

function decideDrawingYear() {
	if (year2021.checked) {
		return 2021;
	} else if (year2020.checked) {
		return 2020;
	} else if (year2019.checked) {
		return 2019;
	} else if (year2018.checked) {
		return 2018;
	}
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
		[
			"City",
			"達成者割合",
			{
				role: "style",
			},
			{
				role: "annotation",
			},
		],
	];
	plotBars();
}

function changeYear(event){
	drawingDatas = [
		[
			"City",
			"達成者割合",
			{
				role: "style",
			},
			{
				role: "annotation",
			},
		],
	];
	plotBars();
}

function changeUid() {
	drawingDatas = [
		[
			"City",
			"達成者割合",
			{
				role: "style",
			},
			{
				role: "annotation",
			},
		],
	];
	if (!isUid()) {
		idNotFound.innerText = uidForm.value + " is not found.";
	} else {
		idNotFound.innerText = null;
	}
	plotBars();
}

function isUid() {
	if (uidForm.value.length != 8) {
		return false;
	} else if (!uidForm.value.startsWith("09B")) {
		return false;
	} else {
		return true;
	}
}
////////////////////////////////////////////////////////////////////////////////

function drawBasic() {
	var data = google.visualization.arrayToDataTable(drawingDatas);

	var options = {
		chartArea: {
			width: "50%",
			height: "90%",
		},
		legend: {
			position: "none",
		},
		bars: "horizontal",
		axes: {
			x: {
				0: {
					side: "top",
					label: "Percentage",
				}, // Top x-axis.
			},
		},
		hAxis: {
			format: "percent",
			minValue: 0,
			maxValue: 1,
		},
		width: "1200",
		height: "900",
	};

	var chart = new google.visualization.BarChart(
		document.getElementById("chart_div")
	);

	chart.draw(data, options);
}