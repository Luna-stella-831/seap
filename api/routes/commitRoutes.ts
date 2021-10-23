import * as control from "../controllers/commitController";
export function routes(app) {
  app.route("/api/progress/:uid").get(control.load_commit);

  app.route("/api/status/:uid").get(control.status);

  // renew (for test)
  app.route("/api/renew/:uid").get(control.renew);

  // renew (for gitbucket webhook)
  app.route("/api/renew/").post(control.renew);

  // all
  app.route("/api/all").get(control.all);
}
