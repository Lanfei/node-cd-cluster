/*!
 * 错误管理模块
 * 错误码格式：错误级别 + 模块代码 + 错误代码
 * 错误级别：1 系统级别 2 服务级别 3 业务级别
 * 模块代码（系统级）：01 本地模块 02 远程模块
 * @module libs/err_factory
 * @author Gengchang
 */

exports.unknownError = function (desc, stack) {
	var err = new Error('Unknown Error');
	err.status = 500;
	err.desc = desc || '';
	err.stack = stack || err.stack;
	return err;
};

exports.buildError = function (desc, stack) {
	var err = new Error('Build Error');
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

exports.invalidSignature = function (desc, stack) {
	var err = new Error('Invalid Signature');
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
