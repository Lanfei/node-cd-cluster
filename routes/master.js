var fs = require('fs');
var express = require('express');
var color2html = require('color2html');
var token = require('../libs/token');
var errFactory = require('../libs/err_factory');
var authCtrl = require('../ctrls/auth');
var userCtrl = require('../ctrls/user');
var projectCtrl = require('../ctrls/project');
var historyCtrl = require('../ctrls/history');

var router = express.Router();

router.post('/auth/signup', authCtrl.signupHandler);

router.post('/auth/login', authCtrl.loginHandler);

router.get('/users', token.verifier, userCtrl.getHandler);

router.get('/users/:name', token.verifier, userCtrl.getItemHandler);

router.put('/users/:name', token.verifier, userCtrl.putItemHandler);

router.delete('/users/:name', token.verifier, userCtrl.deleteItemHandler);

router.get('/histories', token.verifier, historyCtrl.getHandler);

router.get('/projects', token.verifier, projectCtrl.getHandler);

router.post('/projects', token.verifier, projectCtrl.postHandler);

router.get('/projects/:name', token.verifier, projectCtrl.getItemHandler);

router.put('/projects/:name', token.verifier, projectCtrl.putItemHandler);

router.delete('/projects/:name', token.verifier, projectCtrl.deleteItemHandler);

router.post('/projects/:name/clean', token.verifier, projectCtrl.cleanHandler);

router.post('/projects/:name/build', token.decoder, projectCtrl.buildHandler);

router.post('/projects/:name/abort', token.verifier, projectCtrl.abortHandler);

router.post('/projects/:name/deploy', token.verifier, projectCtrl.deployHandler);

router.post('/projects/:name/execute', token.verifier, projectCtrl.executeHandler);

router.get('/projects/:name/status', token.verifier, projectCtrl.getStatusHandler);

router.get('/projects/:name/histories/:id', token.verifier, historyCtrl.getItemHandler);

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
