var async = require('async');
var color2html = require('color2html');
var utils = require('../libs/utils');
var userModule = require('../modules/user');
var projectModule = require('../modules/project');
var historyModule = require('../modules/history');

exports.getListViewHandler = function (req, res) {
	res.render('history_list');
};

exports.getHandler = function (req, res) {
	var result = [];
	var username = req.user['username'];
	var user = userModule.getUser(username);
	var histories = historyModule.getHistories();
	utils.forEach(histories, function (historyList, name) {
		var project = projectModule.getProject(name);
		var managers = project['managers'] || [];
		if (user['is_admin'] || managers.indexOf(username) >= 0) {
			historyList = historyList.map(function (history) {
				return utils.extend({}, history, {project: name});
			});
			result = result.concat(historyList);
		}
	});
	result.sort(function (historyA, historyB) {
		return historyA['start_time'] - historyB['start_time'];
	});
	res.json({
		data: result
	});
};

exports.getItemHandler = function (req, res, next) {
	var id = req.params['id'];
	var name = req.params['name'];
	var project = projectModule.getProject(name) || {};
	var history = historyModule.getHistory(name, id);
	if (!history) {
		next();
	} else {
		async.auto({
			check_result: function (next) {
				projectModule.checkPermission(req.user, project, next);
			},
			checkout_result: ['check_result', function (checkResult, next) {
				historyModule.getOutput(name, id, 'checkout', next);
			}],
			build_result: ['check_result', function (checkResult, next) {
				historyModule.getOutput(name, id, 'build', next);
			}],
			test_result: ['check_result', function (checkResult, next) {
				historyModule.getOutput(name, id, 'test', next);
			}],
			pack_result: ['check_result', function (checkResult, next) {
				historyModule.getOutput(name, id, 'pack', next);
			}],
			deploy_result: ['check_result', function (checkResult, next) {
				historyModule.getOutput(name, id, 'deploy', next);
			}]
		}, function (err, result) {
			if (err) {
				next(err);
			} else {
				utils.forEach(result, function (data, key) {
					result[key] = color2html(data);
				});
				history = utils.extend({}, history, result);
				res.json({
					data: history
				});
			}
		});
	}
};


