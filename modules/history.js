var fs = require('fs-extra');
var async = require('async');
var utils = require('../libs/utils');

exports.STATUS_INITIAL = 0;
exports.STATUS_BUILDING = 1;
exports.STATUS_SUCCESS = 2;
exports.STATUS_FAILED = 3;
exports.STATUS_ABORTED = 4;

exports.STEP_CHECKOUT = 'checkout';
exports.STEP_BUILD = 'build';
exports.STEP_TEST = 'test';
exports.STEP_PACK = 'pack';
exports.STEP_DEPLOY = 'deploy';

exports.getHistoryDir = function (name, id) {
	var dir = utils.getConfigDir() + '/histories/' + name;
	if (id) {
		dir += '/' + id;
	}
	return dir;
};

exports.getHistoryPath = function (name, id, step) {
	return exports.getHistoryDir(name, id) + '/' + step;
};

exports.getOutput = function (name, id, step, next) {
	var filename = exports.getHistoryPath(name, id, step);
	fs.readFile(filename, function (err, data) {
		next(null, data && data.toString());
	});
};

exports.writeOutput = function (name, id, step, output, next) {
	var filename = exports.getHistoryPath(name, id, step);
	fs.outputFile(filename, output.toString(), {
		flag: 'a'
	}, next);
};

exports.removeHistory = function (name, id, next) {
	async.parallel([
		function (next) {
			var path = exports.getHistoryPath(name, id);
			fs.remove(path, next);
		},
		function (next) {
			var path = exports.getBuildPath(name, id);
			fs.remove(path, next);
		}
	], next);
};

exports.cleanHistories = function (name, next) {
	async.parallel([
		function (next) {
			var path = exports.getHistoryDir(name);
			fs.remove(path, next);
		},
		function (next) {
			var path = exports.getBuildDir(name);
			fs.remove(path, next);
		}
	], next);
};

exports.getBuildDir = function (name) {
	var configDir = utils.getConfigDir();
	return configDir + '/builds/' + name;
};

exports.getBuildPath = function (name, id) {
	return exports.getBuildDir(name) + '/' + id + '.zip';
};

exports.getBuildUrl = function (name, id) {
	return '/projects/' + name + '/builds/' + id;
};