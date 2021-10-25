import * as control from "../controllers/commitController";
const path = require('path');

export function routes(app) {
  app.route("/api/progress/:uid").get(control.load_commit);

  app.route("/api/status/:uid").get(control.status);

  // renew (for test)
  app.route("/api/renew/:uid").get(control.renew);

  // renew (for gitbucket webhook)
  app.route("/api/renew/").post(control.renew);

  // all
  app.route("/api/all").get(control.all);


  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
  });

  app.get('/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/main.js'));
  });
}
