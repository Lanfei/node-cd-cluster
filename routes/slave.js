var express = require('express');
var errFactory = require('../libs/err_factory');
var slaveCtrl = require('../ctrls/slave');

var router = express.Router();

router.post('/deploy', slaveCtrl.deployHandler);

router.post('/execute', slaveCtrl.executeHandler);

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
