import * as control from "../controllers/commitController";
const path = require("path");

export function routes(app) {
	app.route("/seap/api/progress/:uid").get(control.load_commit);

	app.route("/seap/api/status/:uid").get(control.status);

	// renew (for test)
	app.route("/seap/api/renew/:uid").get(control.renew);

	// renew (for gitbucket webhook)
	app.route("/seap/api/renew/").post(control.renew);

	// all (create main screen)
	app.route("/seap/api/all").get(control.all);

	// all (create main screen) with param (uid)
	app.route("/seap/api/all/:uid").get(control.all);

	app.get("/seap", (req, res) => {
		res.sendFile(path.join(__dirname, "/index.html"));
	});

	app.get("/seap/main.js", (req, res) => {
		res.sendFile(path.join(__dirname, "/main.js"));
	});
}
