var fs = require('fs');
var express = require('express');
var errFactory = require('../libs/err_factory');
var projectCtrl = require('../ctrls/project');

var router = express.Router();

router.get('/projects', projectCtrl.getHandler);

router.post('/projects', projectCtrl.postHandler);

router.get('/projects/:name', projectCtrl.getItemHandler);

router.put('/projects/:name', projectCtrl.putItemHandler);

router.delete('/projects/:name', projectCtrl.deleteItemHandler);

router.post('/projects/:name/clean', projectCtrl.cleanHandler);

router.post('/projects/:name/build', projectCtrl.buildHandler);

router.post('/projects/:name/abort', projectCtrl.abortHandler);

router.get('/projects/:name/status', projectCtrl.getStatusHandler);

router.get('/projects/:name/histories/:id', projectCtrl.getHistoryHandler);

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
		error_desc: err.desc
	});
	next(err);
});

module.exports = router;
