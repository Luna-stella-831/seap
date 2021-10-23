import * as control from "../controllers/commitController";
export function routes(app) {
  app.route("/seap/progress/:uid").get(control.load_commit);

  app.route("/seap/status/:uid").get(control.status);

  // renew (for test)
  app.route("/seap/renew/:uid").get(control.renew);

  // renew (for gitbucket webhook)
  app.route("/seap/renew/").post(control.renew);

  // all
  app.route("/seap/all").get(control.all);
}
