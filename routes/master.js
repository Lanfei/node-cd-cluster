var fs = require('fs');
var express = require('express');
var color2html = require('color2html');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var authCtrl = require('../ctrls/auth');
var userCtrl = require('../ctrls/user');
var projectCtrl = require('../ctrls/project');
var historyCtrl = require('../ctrls/history');

var router = express.Router();

router.post('/auth/signup', authCtrl.signupHandler);

router.post('/auth/login', authCtrl.loginHandler);

router.get('/users', userModule.verifier, userCtrl.getHandler);

router.get('/users/:name', userModule.verifier, userCtrl.getItemHandler);

router.put('/users/:name', userModule.verifier, userCtrl.putItemHandler);

router.delete('/users/:name', userModule.verifier, userCtrl.deleteItemHandler);

router.get('/histories', userModule.verifier, historyCtrl.getHandler);

router.get('/projects', userModule.verifier, projectCtrl.getHandler);

router.post('/projects', userModule.verifier, projectCtrl.postHandler);

router.get('/projects/:name', userModule.verifier, projectCtrl.getItemHandler);

router.put('/projects/:name', userModule.verifier, projectCtrl.putItemHandler);

router.delete('/projects/:name', userModule.verifier, projectCtrl.deleteItemHandler);

router.post('/projects/:name/clean', userModule.verifier, projectCtrl.cleanHandler);

router.post('/projects/:name/build', userModule.decoder, projectCtrl.buildHandler);

router.post('/projects/:name/abort', userModule.verifier, projectCtrl.abortHandler);

router.post('/projects/:name/deploy', userModule.verifier, projectCtrl.deployHandler);

router.post('/projects/:name/execute', userModule.verifier, projectCtrl.executeHandler);

router.get('/projects/:name/status', userModule.verifier, projectCtrl.getStatusHandler);

router.get('/projects/:name/histories/:id', userModule.verifier, historyCtrl.getItemHandler);

router.use(function (req, res, next) {
	next(errFactory.notFound());
});

router.use(function (err, req, res, next) {
	if (!err.status) {
		err = errFactory.unknownError(err.message, err.stack);
	}
	res.status(err.status);
	res.json({
		error: err.message,
		error_desc: color2html(err.desc)
	});
	next(err);
});

module.exports = router;
