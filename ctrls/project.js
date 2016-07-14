var fs = require('fs');
var async = require('async');
var color2html = require('color2html');
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var projectModule = require('../modules/project');
var historyModule = require('../modules/history');

var FIELDS = ['name', 'repo_type', 'repo_url', 'repo_branch', 'build_scripts', 'test_scripts', 'deploy_nodes', 'ignores', 'pre_deploy_scripts', 'post_deploy_scripts', 'operation_scripts'];

var projects = projectModule.projects;

exports.getListViewHandler = function (req, res) {
	res.render('project_list');
};

exports.getInfoViewHandler = function (req, res) {
	res.render('project_info');
};

exports.getEditViewHandler = function (req, res) {
	res.render('project_edit');
};

exports.getHistoryViewHandler = function (req, res) {
	res.render('project_history', req.params);
};

exports.downBuildPackHandler = function (req, res, next) {
	var id = req.params['id'];
	var name = req.params['name'];
	var filename = name + '-' + id + '.zip';
	var zipPath = historyModule.getBuildPath(name, id);
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
			res.download(zipPath, filename, function (err) {
				if (err) {
					next();
				}
			});
		}
	});
};

exports.getHandler = function (req, res) {
	res.json({
		data: projects
	});
};

exports.postHandler = function (req, res, next) {
	var project;
	async.waterfall([
		function (next) {
			userModule.checkPermission(req.user, next);
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
				data: project
			});
		}
	});
};

exports.getItemHandler = function (req, res) {
	var name = req.params['name'];
	var project = projectModule.getProject(name);
	projectModule.checkPermission(req.user, project, function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: project
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
			var newName = data['name'];
			if (newName && newName !== name) {
				checkConflict(newName, next);
			} else {
				next();
			}
		},
		function (next) {
			data = utils.extend({}, project, data);
			projectModule.updateProject(name, data, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: data
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
	var name = req.params['name'];
	async.waterfall([
		function (next) {
			checkProject(name, next);
		},
		function (data, next) {
			project = data;
			projectModule.checkPermission(req.user, project, next);
		},
		function (next) {
			var latestHistory = getLatestHistory(project);
			if (latestHistory['status'] === historyModule.STATUS_BUILDING) {
				next(errFactory.conflictError('The project is building now'));
			} else {
				next();
			}
		},
		function (next) {
			projectModule.buildProject(name);
			next();
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: project
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
				data: projectModule.getProject(name)
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
			projectModule.deployProject(name, historyId, next);
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
				data: getLatestHistory(project)
			});
		}
	});
};

exports.getHistoryHandler = function (req, res, next) {
	var id = req.params['id'];
	var name = req.params['name'];
	var project = projectModule.getProject(name) || {};
	var histories = project['histories'] || {};
	var history = histories[id];
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

function getLatestHistory(project) {
	var histories = project['histories'] || {};
	var historyLength = project['history_length'];
	var latestHistory = histories[historyLength] || {};
	latestHistory['status'] = latestHistory['status'] || historyModule.STATUS_INITIAL;
	return latestHistory;
}
