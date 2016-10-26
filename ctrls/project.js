var fs = require('fs');
var async = require('async');
var color2html = require('color2html');
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var projectModule = require('../modules/project');
var historyModule = require('../modules/history');

var FIELDS = ['name', 'repo_type', 'repo_url', 'repo_branch', 'build_scripts', 'test_scripts', 'deploy_nodes', 'ignores', 'pre_deploy_scripts', 'post_deploy_scripts', 'operation_scripts', 'env_vars', 'remote_build_enabled', 'remote_build_token', 'history_size', 'managers'];

exports.getListViewHandler = function (req, res) {
	res.render('project_list', {
		me: userModule.getUser(req.user['username'])
	});
};

exports.getInfoViewHandler = function (req, res, next) {
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (project, next) {
			projectModule.checkPermission(req.user, project, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.render('project_info');
		}
	});
};

exports.getEditViewHandler = function (req, res, next) {
	var me = userModule.getUser(req.user['username']);
	userModule.checkAdminPermission(req.user, function (err) {
		if (err) {
			next(err);
		} else {
			res.render('project_edit', {
				me: me
			});
		}
	});
};

exports.getHistoryViewHandler = function (req, res) {
	res.render('project_history', req.params);
};

exports.downBuildPackHandler = function (req, res, next) {
	var id = req.params['id'];
	var name = req.params['name'];
	var filename = encodeURIComponent(name) + '-' + id + '.tar.gz';
	var buildPath = historyModule.getBuildPath(name, id);
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (project, next) {
			projectModule.checkPermission(req.user, project, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.download(buildPath, filename, function (err) {
				if (err) {
					next();
				}
			});
		}
	});
};

exports.getHandler = function (req, res) {
	var username = req.user['username'];
	var user = userModule.getUser(username);
	var projects = projectModule.getProjects();
	var result;
	if (user['is_admin']) {
		result = projects;
	} else {
		result = projects.filter(function (project) {
			var managers = project['managers'] || [];
			return managers.indexOf(username) >= 0;
		});
	}
	result = result.map(getProjectWithStatus);
	res.json({
		data: result
	});
};

exports.postHandler = function (req, res, next) {
	var project;
	async.waterfall([
		function (next) {
			userModule.checkAdminPermission(req.user, next);
		},
		function (next) {
			utils.receiveJSON(req, next);
		},
		function (data, next) {
			project = utils.filter(data, FIELDS);
			utils.checkParams([project['name']], next);
		},
		function (next) {
			checkConflict(project['name'], next);
		},
		function (next) {
			projectModule.addProject(project, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.status(201);
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.getItemHandler = function (req, res) {
	var name = req.params['name'];
	var project = projectModule.getProject(name);
	var histories = historyModule.getHistoryList(name);
	projectModule.checkPermission(req.user, project, function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: utils.extend({}, project, {
					histories: histories
				})
			});
		}
	});
};

exports.putItemHandler = function (req, res, next) {
	var name = req.params['name'];
	var data;
	var project;

	async.waterfall([
		function (next) {
			userModule.checkAdminPermission(req.user, next);
		},
		function (next) {
			checkProject(name, next);
		},
		function (data, next) {
			project = data;
			utils.receiveJSON(req, next);
		},
		function (json, next) {
			data = utils.filter(json, FIELDS);
			data = utils.extend({}, project, data);
			data['name'] = name;
			projectModule.updateProject(name, data, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.deleteItemHandler = function (req, res, next) {
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			userModule.checkAdminPermission(req.user, next);
		},
		function (next) {
			projectModule.deleteProject(name, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.cleanHandler = function (req, res, next) {
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			var project = projectModule.getProject(name);
			projectModule.checkPermission(req.user, project, next);
		},
		function (next) {
			projectModule.cleanWorkspace(name, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.buildHandler = function (req, res, next) {
	var project;
	var user = req.user || {};
	var name = req.params['name'];
	var token = req.query['token'] || '';
	var username = user['username'];
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (data, next) {
			project = data;
			var remoteBuildEnabled = project['remote_build_enabled'];
			var remoteBuildToken = project['remote_build_token'] || '';
			if (remoteBuildEnabled && token === remoteBuildToken) {
				username = username || '<Remote Build>';
				next();
			} else {
				projectModule.checkPermission(user, project, next);
			}
		},
		function (next) {
			var latestHistory = historyModule.getLatestHistory(project) || {};
			var status = latestHistory['status'];
			if (status >= historyModule.STATUS_UPDATING && status <= historyModule.STATUS_DEPLOYING) {
				next(errFactory.conflictError('The project is building now'));
			} else {
				next();
			}
		},
		function (next) {
			utils.receiveJSON(req, next);
		},
		function (params, next) {
			projectModule.buildProject(name, username, params);
			next();
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			})
		}
	});
};

exports.abortHandler = function (req, res, next) {
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (project, next) {
			projectModule.checkPermission(req.user, project, next);
		},
		function (next) {
			projectModule.abortProject(name, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.deployHandler = function (req, res, next) {
	var name = req.params['name'];
	var historyId = req.query['history_id'];
	async.waterfall([
		function (next) {
			utils.checkParams(historyId, next);
		},
		function (next) {
			checkProject(name, next);
		},
		function (project, next) {
			projectModule.checkPermission(req.user, project, next);
		},
		function (next) {
			projectModule.deployProject(name, historyId, null, next);
		}
	], function (err, result) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: color2html(result)
			});
		}
	});
};

exports.executeHandler = function (req, res, next) {
	var name = req.params['name'];
	var scriptId = req.query['script_id'];
	async.waterfall([
		function (next) {
			utils.checkParams(scriptId, next);
		},
		function (next) {
			checkProject(name, next);
		},
		function (project, next) {
			projectModule.checkPermission(req.user, project, next);
		},
		function (next) {
			projectModule.executeScript(name, scriptId, next);
		}
	], function (err, result) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: color2html(result)
			});
		}
	});
};

exports.getStatusHandler = function (req, res, next) {
	var project;
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (data, next) {
			project = data;
			projectModule.checkPermission(req.user, project, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: historyModule.getLatestHistory(project['name']) || {}
			});
		}
	});
};

exports.getHistoryHandler = function (req, res, next) {
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

function checkProject(name, next) {
	var project = projectModule.getProject(name);
	if (project) {
		next(null, project);
	} else {
		next(errFactory.notFound('Project `' + name + '` is not exists.'));
	}
}

function checkConflict(name, next) {
	var project = projectModule.getProject(name);
	if (project) {
		next(errFactory.conflictError('Project `' + name + '` is already exists.'));
	} else {
		next();
	}
}

function getProjectWithStatus(project) {
	var history = historyModule.getLatestHistory(project['name']) || {};
	var statusData = {
		last_build_id: history['id'] || null,
		last_build_time: history['start_time'] || null,
		last_duration: history['duration'] || null,
		status: history['status'] || historyModule.STATUS_INITIAL
	};
	return utils.extend({}, project, statusData);
}
