var fs = require('fs');
var url = require('url');
var path = require('path');
var express = require('express');
var errFactory = require('../libs/err_factory');
var indexCtrl = require('../ctrls/index');
var projectCtrl = require('../ctrls/project');

var router = express.Router();

var VIEWS_DIR = router.VIEWS_DIR = path.join(__dirname, '../views');

router.get('/', indexCtrl.getViewHandler);

router.get('/projects', projectCtrl.getListViewHandler);

router.get('/projects/add', projectCtrl.getEditViewHandler);

router.get('/projects/:name', projectCtrl.getInfoViewHandler);

router.get('/projects/:name/edit', projectCtrl.getEditViewHandler);

router.get('/projects/:name/histories/:id', projectCtrl.getHistoryViewHandler);

router.get('/projects/:name/builds/:id', projectCtrl.downBuildPackHandler);

router.use(function (req, res, next) {
	var pathname = url.parse(req.url).pathname;
	if (path.extname(pathname) === '.tpl') {
		next(errFactory.notFound());
	} else {
		next();
	}
});

router.use(express.static(VIEWS_DIR));

router.use(function (req, res, next) {
	next(errFactory.notFound());
});

router.use(function (err, req, res, next) {
	if (!err.status) {
		err = errFactory.unknownError(err.message, err.stack);
	}
	res.status(err.status);
	if (err.status >= 500) {
		res.end(err.stack);
	} else {
		res.end(err.desc || err.message);
	}
	next(err);
});

module.exports = router;
