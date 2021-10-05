module.exports = function(app) {
  var commitList = require('../controllers/commitController');

  app.route('/seap/progress/ratio')
    .get(commitList.all_commits)
    .post(commitList.create_commit);


  app.route('/seap/progress/:uid')
    .get(commitList.load_commit)
    .put(commitList.update_commit)
    .delete(commitList.delete_commit);


  app.route('/seap/progress/all')
    .get();


  app.route('/seap/progress/:uid')
    .get();


  app.route('/seap/renew')
    .get();
};
