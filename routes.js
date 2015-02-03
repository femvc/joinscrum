'use strict';
var user      = require('./routes/user');
var account   = require('./routes/account');
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
app.get('/ue_api/internal/user_list'       ,account.auth, user.list);
app.get('/ue_api/internal/user_detail'     ,account.auth, user.detail);
app.get('/ue_api/internal/user_save'       ,account.auth, user.save);
app.get('/ue_api/internal/user_login'      ,account.auth, user.login);
app.get('/ue_api/internal/user_logout'     ,account.auth, user.logout);
app.get('/ue_api/internal/user_loginstatus',account.auth, user.loginstatus);

// Product
app.get('/ue_api/internal/product_list'    ,account.auth, product.list);
app.get('/ue_api/internal/product_detail'  ,account.auth, product.detail);
app.get('/ue_api/internal/product_save'    ,account.auth, product.save);

// Sprint
app.get('/ue_api/internal/sprint_list',     account.auth, sprint.list);
app.get('/ue_api/internal/sprint_detail',   account.auth, sprint.detail);
app.get('/ue_api/internal/sprint_save',     account.auth, sprint.save);

// Backlog
app.get('/ue_api/internal/backlog_list',    account.auth, backlog.list);
app.get('/ue_api/internal/backlog_detail',  account.auth, backlog.detail);
app.get('/ue_api/internal/backlog_save',    account.auth, backlog.save);

// Task
app.get('/ue_api/internal/task_list',       account.auth, task.list);
app.get('/ue_api/internal/task_detail',     account.auth, task.detail);
app.get('/ue_api/internal/task_save',       account.auth, task.save);
// app.get('/ue_api/internal/task_lastmodify', account.auth, task.lastmodify);

// Taskindex
app.get('/ue_api/internal/taskindex_list',  account.auth, taskindex.list);
app.get('/ue_api/internal/taskindex_save',  account.auth, taskindex.save);

// Burndown
// app.get('/ue_api/internal/burndown',        account.auth, chart.burndown);
app.get('/ue_api/internal/burden',          account.auth, chart.burden);