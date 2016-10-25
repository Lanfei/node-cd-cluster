var fs = require('fs');
var url = require('url');
var path = require('path');
var express = require('express');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var authCtrl = require('../ctrls/auth');
var userCtrl = require('../ctrls/user');
var historyCtrl = require('../ctrls/history');
var projectCtrl = require('../ctrls/project');
var profileCtrl = require('../ctrls/profile');

var router = express.Router();

var VIEWS_DIR = router.VIEWS_DIR = path.join(__dirname, '../views');

router.get('/', userModule.verifier, projectCtrl.getListViewHandler);

router.get('/signup', authCtrl.getSignupViewHandler);

router.get('/login', authCtrl.getLoginViewHandler);

router.get('/logout', authCtrl.getLogoutViewHandler);

router.get('/users', userModule.verifier, userCtrl.getListViewHandler);

router.get('/users/:name/edit', userModule.verifier, userCtrl.getEditViewHandler);

router.get('/histories', userModule.verifier, historyCtrl.getListViewHandler);

router.get('/projects', userModule.verifier, projectCtrl.getListViewHandler);

router.get('/projects/add', userModule.verifier, projectCtrl.getEditViewHandler);

router.get('/projects/:name', userModule.verifier, projectCtrl.getInfoViewHandler);

router.get('/projects/:name/edit', userModule.verifier, projectCtrl.getEditViewHandler);

router.get('/projects/:name/histories/:id', userModule.verifier, projectCtrl.getHistoryViewHandler);

router.get('/projects/:name/builds/:id', userModule.verifier, projectCtrl.downBuildPackHandler);

router.get('/profile', userModule.verifier, profileCtrl.getViewHandler);

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
		res.clearCookie('cdc_id_token');
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
