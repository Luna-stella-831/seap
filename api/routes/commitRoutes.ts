import * as commitList from '../controllers/commitController';
export function routes(app) {

  app.route('/seap/progress/ratio')
    .get(commitList.return_ratio)
    .post(commitList.create_commit);


  app.route('/seap/progress/:uid')
    .get(commitList.load_commit)
    .put(commitList.update_commit)
    .delete(commitList.delete_commit);


  app.route('/seap/progress/all')
    .get();


  app.route('/seap/renew')
    .get();
};
