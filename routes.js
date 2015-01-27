var account   = require('./routes/account');
var user      = require('./routes/user');
var product   = require('./routes/product');
var sprint    = require('./routes/sprint');
var backlog   = require('./routes/backlog');
var task      = require('./routes/task');
var taskindex = require('./routes/taskindex');
var chart     = require('./routes/chart');

/*
 * CORS Support in Node.js web app written with Express
 */

// http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
app.all('/*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	next();
});
// handle OPTIONS requests from the browser
app.options('*', function (req, res, next) {
	res.send(200);
});

//Test
app.get('/hello', function (req, res) {
	res.send('hello world');
});

// Account
app.get('/ue_api/internal/user_list',       account.auth, user.list);
app.get('/ue_api/internal/user_info',       account.auth, user.detail);
app.get('/ue_api/internal/user_add',        account.auth, user.add);
app.get('/ue_api/internal/user_edit',       account.auth, user.edit);
app.get('/ue_api/internal/user_login',      account.auth, user.login);
app.get('/ue_api/internal/user_logout',     account.auth, user.logout);
app.get('/ue_api/internal/user_loginstatus',account.auth, user.loginstatus);

// Product
app.get('/ue_api/internal/product_list',    account.auth, product.list);
app.get('/ue_api/internal/product_info',    account.auth, product.detail);
app.get('/ue_api/internal/product_add',     account.auth, product.add);
app.get('/ue_api/internal/product_edit',    account.auth, product.edit);

// Sprint
app.get('/ue_api/internal/sprint_list',     account.auth, sprint.list);
app.get('/ue_api/internal/sprint_info',     account.auth, sprint.detail);
app.get('/ue_api/internal/sprint_add',      account.auth, sprint.add);
app.get('/ue_api/internal/sprint_edit',     account.auth, sprint.edit);

// Backlog
app.get('/ue_api/internal/backlog_list',    account.auth, backlog.list);
app.get('/ue_api/internal/backlog_info',    account.auth, backlog.detail);
app.get('/ue_api/internal/backlog_add',     account.auth, backlog.add);
app.get('/ue_api/internal/backlog_edit',    account.auth, backlog.edit);

// Task
app.get('/ue_api/internal/task_list',       account.auth, task.list);
app.get('/ue_api/internal/task_info',       account.auth, task.detail);
app.get('/ue_api/internal/task_add',        account.auth, task.add);
app.get('/ue_api/internal/task_edit',       account.auth, task.edit);
app.get('/ue_api/internal/task_lastmodify', account.auth, task.lastmodify);

// Taskindex
app.get('/ue_api/internal/taskindex_list',  account.auth, task.indexlist);
app.get('/ue_api/internal/taskindex_save',  account.auth, task.indexsave);

// Burndown
app.get('/ue_api/internal/burndown',        account.auth, task.burndown);
app.get('/ue_api/internal/burden',          account.auth, task.burden);
