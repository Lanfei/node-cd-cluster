var fs = require('fs');
var url = require('url');
var path = require('path');
var express = require('express');
var token = require('../libs/token');
var errFactory = require('../libs/err_factory');
var authCtrl = require('../ctrls/auth');
var userCtrl = require('../ctrls/user');
var historyCtrl = require('../ctrls/history');
var projectCtrl = require('../ctrls/project');
var profileCtrl = require('../ctrls/profile');

var router = express.Router();

var VIEWS_DIR = router.VIEWS_DIR = path.join(__dirname, '../views');

router.get('/', token.verifier, projectCtrl.getListViewHandler);

router.get('/signup', authCtrl.getSignupViewHandler);

router.get('/login', authCtrl.getLoginViewHandler);

router.get('/logout', authCtrl.getLogoutViewHandler);

router.get('/users', token.verifier, userCtrl.getListViewHandler);

router.get('/users/:name/edit', token.verifier, userCtrl.getEditViewHandler);

router.get('/histories', token.verifier, historyCtrl.getListViewHandler);

router.get('/projects', token.verifier, projectCtrl.getListViewHandler);

router.get('/projects/add', token.verifier, projectCtrl.getEditViewHandler);

router.get('/projects/:name', token.verifier, projectCtrl.getInfoViewHandler);

router.get('/projects/:name/edit', token.verifier, projectCtrl.getEditViewHandler);

router.get('/projects/:name/histories/:id', token.verifier, projectCtrl.getHistoryViewHandler);

router.get('/projects/:name/builds/:id', token.verifier, projectCtrl.downBuildPackHandler);

router.get('/profile', token.verifier, profileCtrl.getViewHandler);

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
	if (err.status === 401) {
		res.redirect('/login');
		return;
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
