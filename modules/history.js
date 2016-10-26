var fs = require('fs-extra');
var async = require('async');
var utils = require('../libs/utils');

exports.STATUS_INITIAL = 0;
exports.STATUS_UPDATING = 1;
exports.STATUS_BUILDING = 2;
exports.STATUS_TESTING = 3;
exports.STATUS_PACKING = 4;
exports.STATUS_DEPLOYING = 5;
exports.STATUS_SUCCESS = 6;
exports.STATUS_FAILED = 7;
exports.STATUS_ABORTED = 8;

var histories = utils.readConfig('histories') || {};

utils.forEach(histories, function (historyList) {
	utils.forEach(historyList, function (history) {
		var status = history['status'];
		if (status >= exports.STATUS_UPDATING && status <= exports.STATUS_DEPLOYING) {
			history['status'] = exports.STATUS_ABORTED;
		}
	});
});
utils.writeConfig('histories', histories);

exports.getHistories = function () {
	return histories;
};

exports.addHistory = function (name, operator, status, next) {
	var historyList = histories[name] || [];
	var lastItem = historyList[historyList.length - 1] || {};
	var lastId = lastItem['id'] || 0;
	var id = lastId + 1;
	var history = {
		id: id,
		status: status || exports.STATUS_INITIAL,
		operator: operator,
		start_time: Date.now()
	};
	historyList.push(history);
	histories[name] = historyList;
	utils.writeConfig('histories', histories, function (err) {
		next(err, history);
	});
};

exports.getHistoryList = function (name) {
	return histories[name] || [];
};

exports.getHistory = function (name, id) {
	var historyList = histories[name] || [];
	for (var i = historyList.length - 1; i >= 0; --i) {
		var history = historyList[i];
		if (history['id'] === +id) {
			return history;
		}
	}
};

exports.getLatestHistory = function (name) {
	var historyList = histories[name] || [];
	return historyList[historyList.length - 1];
};

exports.updateHistory = function (name, id, data, next) {
	var history = exports.getHistory(name, id);
	utils.extend(history, data);
	utils.writeConfig('histories', histories, next);
};

exports.setHistorySize = function (name, size, next) {
	var historyList = histories[name] || [];
	var trash;
	if (historyList.length > size) {
		trash = historyList.splice(0, historyList.length - size);
	}
	async.each(trash, function (history, next) {
		var id = history['id'];
		exports.removeHistory(name, id, next);
	}, next);
};

exports.getOutputDir = function (name, id) {
	var dir = utils.getConfigDir() + '/outputs/' + encodeURIComponent(name);
	if (id) {
		dir += '/' + id;
	}
	return dir;
};

exports.getOutputPath = function (name, id, step) {
	return exports.getOutputDir(name, id) + '/' + step;
};

exports.getOutput = function (name, id, step, next) {
	var filename = exports.getOutputPath(name, id, step);
	fs.readFile(filename, function (err, data) {
		next(null, data && data.toString());
	});
};

exports.writeOutput = function (name, id, step, output, next) {
	var filename = exports.getOutputPath(name, id, step);
	fs.outputFile(filename, output.toString(), {
		flag: 'a'
	}, next);
};

exports.removeHistory = function (name, id, next) {
	async.parallel([
		function (next) {
			var path = exports.getOutputPath(name, id);
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
			var path = exports.getOutputDir(name);
			fs.remove(path, next);
		},
		function (next) {
			var path = exports.getBuildDir(name);
			fs.remove(path, next);
		},
		function (next) {
			delete histories[name];
			utils.writeConfig('histories', histories, next);
		}
	], next);
};

exports.getBuildDir = function (name) {
	var configDir = utils.getConfigDir();
	return configDir + '/builds/' + encodeURIComponent(name);
};

exports.getBuildPath = function (name, id) {
	return exports.getBuildDir(name) + '/' + id + '.tar.gz';
};

exports.getBuildUrl = function (name, id) {
	return '/projects/' + encodeURIComponent(name) + '/builds/' + id;
};
