exports.unknownError = function (desc, stack) {
	var err = new Error('Unknown Error');
	err.status = 500;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.runtimeError = function (desc, stack) {
	var err = new Error('Runtime Error');
	err.status = 500;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.paramError = function (desc, stack) {
	var err = new Error('Param Error');
	err.status = 400;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.notAcceptable = function (desc, stack) {
	var err = new Error('Not Acceptable Content Type');
	err.status = 406;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.unprocessableEntity = function (desc, stack) {
	var err = new Error('Unprocessable Entity');
	err.status = 422;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.notFound = function (desc, stack) {
	var err = new Error('Not Found');
	err.status = 404;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.entityTooLarge = function (desc, stack) {
	var err = new Error('Entity Too Large');
	err.status = 413;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.unauthorized = function (desc, stack) {
	var err = new Error('Unauthorized');
	err.status = 401;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.conflictError = function (desc, stack) {
	var err = new Error('Conflict Error');
	err.status = 409;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};
