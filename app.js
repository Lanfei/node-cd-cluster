var os = require('os');
var fs = require('fs');
var path = require('path');
var gotpl = require('gotpl');
var express = require('express');
var cookieParser = require('cookie-parser');

var role = process.env['CLUSTER_ROLE'] || 'master';

var app = express();

if (role === 'slave') {
	var slaveRouter = require('./routes/slave');
	app.use(slaveRouter);
} else {
	var masterRouter = require('./routes/master');
	var viewRouter = require('./routes/view');

	var configDir = os.homedir() + '/.cd-cluster';
	try {
		fs.accessSync(configDir);
	} catch (e) {
		fs.mkdirSync(configDir);
	}

	gotpl.config('cache', process.env['NODE_ENV'] !== 'development');
	app.engine('tpl', gotpl.renderFile);
	app.set('views', viewRouter.VIEWS_DIR);
	app.set('view engine', 'tpl');

	app.use(cookieParser());
	app.use('/api', masterRouter);
	app.use(viewRouter);
}

app.use(function (err, req, res, next) {
	if (err.status >= 500) {
		console.error(err.stack);
	}
	next();
});

module.exports = app;