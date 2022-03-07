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
let slider = document.getElementById("time");
let scale0 = document.getElementById("start");
let timelimit = document.getElementById("timelimit");
let graphButton = document.getElementById("graph");
checkboxS1.addEventListener("change", changeOptions);
checkboxS2.addEventListener("change", changeOptions);
checkboxS3.addEventListener("change", changeOptions);
checkboxS4.addEventListener("change", changeOptions);
year2021.addEventListener("change", changeOptions);
year2020.addEventListener("change", changeOptions);
year2019.addEventListener("change", changeOptions);
year2018.addEventListener("change", changeOptions);
uidForm.addEventListener("keydown", function (e) {
	if (e.keyCode === 13) {
		changeUid();
	}
});
uidButton.addEventListener("click", changeUid);
graphButton.addEventListener("click", graphise);
window.onload = () => {
	slider.addEventListener("input", changeOptions);
}

//const endpoint = 'http://172.16.1.114:3000/seap/'; //@lab
//const endpoint = 'http://192.168.2.102:3000/seap/'; //@home
//const endpoint = 'http://10.11.191.249:3000/seap/'; //@odins-1x
const endpoint = 'http://localhost:3000/seap/'; //@local
//const endpoint = "https://loki.ics.es.osaka-u.ac.jp/seap/";
let endpointAllApi = endpoint + "api/all";

const uid = new URL(document.location.href).searchParams.get("uid");
uidForm.value = uid;

if (uid) {
	endpointAllApi = endpointAllApi + "/" + uid;
}

fetch(endpointAllApi)
	.then((response) => response.json())
	.then((data) => {
		all = data;
		setSliderRange()
		slider.focus();
		plotBars();
		indicateLimit();
	});

////////////////////////////////////////////////////////////////////////////////

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

	const thisYearTasks = {};
	await calPassRatio(thisYearTasks, thisYear);

	google.charts.load("current", {
		packages: ["corechart", "bar"],
	});
	google.charts.setOnLoadCallback(drawBasic);
}

function calOffset() {
	let length = new Date("2022-01-28T23:59:00.000") - new Date("2021-10-07T10:30:00.000")
	let pastLength;
	if (year2021.checked) {
		pastLength = new Date("2022-01-28T23:59:00.000") - new Date("2021-10-07T10:30:00.000")
	} else if (year2020.checked) {
		pastLength = new Date("2021-01-22T23:59:00.000") - new Date("2020-10-01T10:30:00.000")
	} else if (year2019.checked) {
		pastLength = new Date("2020-01-24T23:59:00.000") - new Date("2019-10-03T10:30:00.000")
	} else if (year2018.checked) {
		pastLength = new Date("2019-02-01T23:59:00.000") - new Date("2018-10-04T10:30:00.000")
	}
	return Math.round((length - pastLength) / (60 * 60 * 1000));
}

function calFinDay() {
	let finDay;
	if (year2021.checked) {
		finDay = 0
	} else if (year2020.checked) {
		finDay = new Date("2021-01-22T23:59:00.000") - new Date("2021-01-28T23:59:00.000")
	} else if (year2019.checked) {
		finDay = new Date("2020-01-23T23:59:00.000") - new Date("2020-01-28T23:59:00.000")
	} else if (year2018.checked) {
		finDay = new Date("2019-01-28T23:59:00.000") - new Date("2019-02-01T23:59:00.000")
	}
	return Math.round(finDay / (60 * 60 * 1000));
}

async function calPassRatio(thisYearTasks, thisYear) {
	await makeThisYearTasks(thisYearTasks, thisYear);
	let passTests = [];
	await checkPassedTests(passTests, thisYearTasks);
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName != "s0.trial") {
				const taskName = task.taskName;
				const offset = thisYearTasks[taskName].offsetHour - calFinDay();
				task.tests.forEach((test) => {
					const passIdCount = test.passInfos
						.filter((info) => info.hoursBefore <= offset)
						.map((info) => info.passIds.length)
						.reduce((a, b) => a + b, 0);

					let allIdCount = test.passInfos
						.map((info) => info.passIds.length)
						.reduce((a, b) => a + b, 0);

					if (year.year == 2021) {
						allIdCount = 79;
					}

					if (year.year == decideDrawingYear()) {
						if (test.testName.split(".")[1] == decideDrawingTask()) {
							//console.log(uidForm.value + "'s passTests "+ passTests)
							if (passTests.includes(test.testName)) {
								drawingDatas.push([
									test.testName.split(".")[3].split("test")[1],
									//.slice(0, test.testName.split(".")[3].length - 4),
									passIdCount / allIdCount,
									"color: #76A7FA",
									"",
								]);
							} else {
								drawingDatas.push([
									test.testName.split(".")[3].split("test")[1],
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

async function makeThisYearTasks(thisYearTasks, thisYear) {
	const tmp = await parseThisYearInfo(thisYear);
	tmp.shift(); // remove s0.trial
	tmp.forEach((t) => {
		thisYearTasks[t.taskName] = t;
	});
}

async function parseThisYearInfo(thisYear) {
	return thisYear.tasks.map((task) => {
		if (task.taskName != "s0.strial") {
			const offsetHour = Math.round(
				((new Date() - new Date(task.deadline)) / (60 * 60 * 1000))
			);
			return {
				taskName: task.taskName,
				deadline: task.deadline,
				offsetHour: offsetHour + Number(slider.value),
			};
		}
	});
}

async function checkPassedTests(passTests, thisYearTasks) {
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName != "s0.trial") {
				const taskName = task.taskName;
				const offset = thisYearTasks[taskName].offsetHour;
				task.tests.forEach((test) => {
					test.passInfos.map((info) => {
						if (info.passIds.includes(uidForm.value)) {
							passTests.push(test.testName);
						}
					});
				});
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

function changeOptions() {
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
	setSliderRange()
	slider.focus();
	plotBars();
	indicateLimit();
}

function changeUid() {
	changeOptions();
	if (!isUid()) {
		idNotFound.innerText = uidForm.value + " is not found.";
	} else {
		idNotFound.innerText = null;
	}
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

function indicateLimit() {
	all.filter((year) => year.year === decideDrawingYear())[0].tasks.map((task) => {
		if (task.taskName.startsWith(decideDrawingTask())) {
			let limitHour = (Math.round(
				((today(decideDrawingYear()) - new Date(task.deadline)) / (60 * 60 * 1000))
			) + Number(slider.value)) * (-1) + adjustLimit(decideDrawingTask());
			if (limitHour >= 0) {
				var limitDay = Math.floor(limitHour / 24)
				timelimit.innerText = task.taskName + "の締め切りまであと”" + limitDay + "日と" + limitHour % 24 + "時間”"
			} else {
				var limitDay = Math.floor(limitHour * (-1) / 24)
				timelimit.innerText = task.taskName + "の締め切りから”" + limitDay + "日と" + limitHour % 24 * (-1) + "時間”後"
			}
		}
	});
}

function adjustLimit(tk) {
	let thisYearDeadLine;
	let drawingYearDeadLine;
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName.startsWith(tk)) {
				if (year.year == 2021) {
					thisYearDeadLine = new Date(task.deadline)
				}
			}
		});
	});
	all.forEach((year) => {
		year.tasks.forEach((task) => {
			if (task.taskName.startsWith(tk)) {
				if (year.year == decideDrawingYear()) {
					drawingYearDeadLine = new Date(task.deadline)
				}
			}
		});
	});
	thisYearDeadLine.setFullYear(thisYearDeadLine.getFullYear() - (2021 - decideDrawingYear()))
	return (thisYearDeadLine - drawingYearDeadLine) / (60 * 60 * 1000);
}

function today(y) {
	let dt = new Date();
	dt.setFullYear(dt.getFullYear() - (2021 - y))
	return dt;
}

function setSliderRange() {
	//console.log("offset:" + calOffset())
	if (year2021.checked) {
		slider.min = Math.round(((new Date("2021-10-07T10:30:00.000") - new Date()) / (60 * 60 * 1000)))
		slider.max = Math.round(((new Date("2022-01-28T23:59:00.000") - new Date()) / (60 * 60 * 1000)))
	} else if (year2020.checked) {
		slider.min = Math.round(((new Date("2020-10-01T10:30:00.000") - today(2020)) / (60 * 60 * 1000)))
		slider.max = Math.round(((new Date("2021-01-22T23:59:00.000") - today(2020)) / (60 * 60 * 1000))) + adjustLimit("s4");
	} else if (year2019.checked) {
		slider.min = Math.round(((new Date("2019-10-03T10:30:00.000") - today(2019)) / (60 * 60 * 1000)))
		slider.max = Math.round(((new Date("2020-01-24T23:59:00.000") - today(2019)) / (60 * 60 * 1000))) + adjustLimit("s4");
	} else if (year2018.checked) {
		slider.min = Math.round(((new Date("2018-10-04T10:30:00.000") - today(2018)) / (60 * 60 * 1000)))
		slider.max = Math.round(((new Date("2019-02-01T23:59:00.000") - today(2018)) / (60 * 60 * 1000))) + adjustLimit("s4");
	}
}
////////////////////////////////////////////////////////////////////////////////

function drawBasic() {
	let Datas = drawingDatas.slice(1).sort(function (a, b) {
		if (a[0] > b[0]) {
			return 1;
		} else if (a[0] < b[0]) {
			return -1;
		} else {
			return 0;
		}
	});
	Datas.unshift([
		"City",
		"達成者割合",
		{
			role: "style",
		},
		{
			role: "annotation",
		},
	]);
	var data = google.visualization.arrayToDataTable(Datas);

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
		color: "#D9D9D9",
	};

	var chart = new google.visualization.BarChart(
		document.getElementById("chart_div")
	);

	chart.draw(data, options);
}

///////////////////////////////////////////////////////////////////////////

async function graphise() {
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
	let defaltTime = slider.value;
	let plotDatas = [
		['Hour', 'Ratio'],
	];
	var tY = all.filter((year) => year.year === 2021)[0];
	for (let i = 0; i <= 10; i++) {
		slider.value = i;

		var tYTs = {};
		await calPassRatio(tYTs, tY);

		drawingDatas.forEach((drawingData) => {
			if (drawingData[0] == "Normal20") {
				plotDatas.push([i, drawingData[1]]);
			}
		})
	}
	console.log(plotDatas)
	slider.value = defaltTime;
	google.charts.load('current', {
		'packages': ['corechart']
	});
	google.charts.setOnLoadCallback(drawGraph(plotDatas));

}

function drawGraph(plotDatas) {
	var data = google.visualization.arrayToDataTable(plotDatas);

	var options = {
		title: 'Company Performance',
		curveType: 'function',
		legend: {
			position: 'bottom'
		}
	};

	var graph = new google.visualization.LineChart(document.getElementById('curve_chart'));

	graph.draw(data, options);
}