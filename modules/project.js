var qs = require('qs');
var zlib = require('zlib');
var path = require('path');
var http = require('http');
var tar = require('tar-fs');
var fs = require('fs-extra');
var async = require('async');
var minimatch = require("minimatch");
var spawn = require('child_process').spawn;
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var historyModule = require('../modules/history');

var tasks = {};

var projects = utils.readConfig('projects') || [];

exports.getProjects = function () {
	return projects;
};

exports.getProject = function (name) {
	return projects.filter(function (project) {
		return project['name'] === name;
	})[0];
};

exports.addProject = function (project, next) {
	projects.push(project);
	utils.writeConfig('projects', projects, next);
};

exports.updateProject = function (name, data, next) {
	var shouldCleanWorkspace = false;
	utils.forEach(projects, function (project, i) {
		if (project['name'] === name) {
			projects[i] = data;
			shouldCleanWorkspace =
				data['repo_type'] !== project['repo_type'] ||
				data['repo_url'] !== project['repo_url'] ||
				data['repo_branch'] !== project['repo_branch'];
			return false;
		}
	});
	async.parallel([
		function (next) {
			utils.writeConfig('projects', projects, next);
		},
		function (next) {
			if (shouldCleanWorkspace) {
				exports.cleanWorkspace(name, next);
			} else {
				next();
			}
		},
		function (next) {
			if (shouldCleanWorkspace) {
				exports.abortProject(name, next);
			} else {
				next();
			}
		}
	], function (err) {
		next && next(err);
	});
};

exports.deleteProject = function (name, next) {
	utils.forEach(projects, function (project, i) {
		if (project['name'] === name) {
			projects.splice(i, 1);
			return false;
		}
	});
	async.parallel([
		function (next) {
			utils.writeConfig('projects', projects, next);
		},
		function (next) {
			exports.cleanWorkspace(name, next);
		},
		function (next) {
			historyModule.cleanHistories(name, next);
		}
	], function (err) {
		next(err);
	});
};

exports.buildProject = function (name, operator, params, next) {
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	var step;
	var history;
	var historyId;
	var ignores;
	var deployNodes;
	params = params || {};
	async.waterfall([
		function (next) {
			historyModule.addHistory(name, operator, historyModule.STATUS_UPDATING, next);
		},
		function (data, next) {
			history = data;
			historyId = history['id'];
			historyModule.setHistorySize(name, +project['history_size'] || 1, next);
		},
		function (next) {
			exports.ensureWorkspace(name, next);
		},
		function (made, next) {
			var command;
			var repoType = project['repo_type'];
			var repoUrl = project['repo_url'];
			var repoBranch = project['repo_branch'] || 'master';
			if (repoType === 'git') {
				if (made) {
					command = 'git clone --recurse --progress --depth 1 -b ' + repoBranch + ' ' + repoUrl + ' ./';
				} else {
					command = '' +
						'git pull\n' +
						'git submodule init\n' +
						'git submodule sync --recursive\n' +
						'git submodule update --init --recursive --depth 1';
				}
			} else if (repoType === 'svn') {
				if (made) {
					command = 'svn co ' + repoUrl + ' ./';
				} else {
					command = 'svn up';
				}
			}
			step = 'checkout';
			runCommand(name, historyId, step, command, function (err) {
				if (err) {
					exports.cleanWorkspace(name);
				}
				next(err);
			});
		},
		function (next) {
			step = 'build';
			history['status'] = historyModule.STATUS_BUILDING;
			historyModule.updateHistory(name, historyId, history, next);
		},
		function (next) {
			runCommand(name, historyId, step, project['build_scripts'], next);
		},
		function (next) {
			step = 'test';
			history['status'] = historyModule.STATUS_TESTING;
			historyModule.updateHistory(name, historyId, history, next);
		},
		function (next) {
			runCommand(name, historyId, step, project['test_scripts'], next);
		},
		function (next) {
			step = 'pack';
			history['status'] = historyModule.STATUS_PACKING;
			historyModule.updateHistory(name, historyId, history, next);
		},
		function (next) {
			ignores = params['ignores'];
			if (!ignores && project['ignores']) {
				ignores = project['ignores'].split('\n');
			}
			var ignoreStr = ignores.join('\n    ') || 'Empty';
			historyModule.writeOutput(name, historyId, step, 'Packing files...\n\nIgnores:\n    ' + ignoreStr + '\n', next);
		},
		function (next) {
			exports.packProject(name, historyId, ignores, next);
		},
		function (next) {
			history['build_url'] = historyModule.getBuildUrl(name, historyId);
			historyModule.updateHistory(name, historyId, history, next);
		},
		function (next) {
			historyModule.writeOutput(name, historyId, step, '\nDone.', next);
		},
		function (next) {
			step = 'deploy';
			history['status'] = historyModule.STATUS_DEPLOYING;
			historyModule.updateHistory(name, historyId, history, next);
		},
		function (next) {
			deployNodes = params['deploy_nodes'] || project['deploy_nodes'];
			var nodeStr = deployNodes.map(function (node) {
					return '    ' + node['host'] + ':' + node['port'];
				}).join('\n') || 'Empty';
			historyModule.writeOutput(name, historyId, step, 'Nodes:\n' + nodeStr + '\n', next);
		},
		function (next) {
			exports.deployProject(name, historyId, deployNodes, next);
		},
		function (result, next) {
			historyModule.writeOutput(name, historyId, step, '\n' + result, next);
		}
	], function (err) {
		var startTime = history['start_time'];
		history['duration'] = Date.now() - startTime;
		if (err) {
			history['status'] = historyModule.STATUS_FAILED;
			historyModule.writeOutput(name, historyId, step, (err.desc || err.message) + '\n' + '\u001b[31mFailed.\u001b[39m');
		} else {
			history['status'] = historyModule.STATUS_SUCCESS;
		}
		historyModule.updateHistory(name, historyId, history, next);
	});
};

exports.abortProject = function (name, next) {
	var task = tasks[name];
	var project = exports.getProject(name);
	if (task && project) {
		var historyId = task['id'];
		var process = task['process'];
		var archive = task['archive'];
		var request = task['request'];
		var history = historyModule.getHistory(name, historyId);

		function updateHistory() {
			history['status'] = historyModule.STATUS_ABORTED;
			historyModule.updateHistory(name, historyId, history, next);
		}

		if (request) {
			request.abort();
			updateHistory();
		} else if (archive) {
			archive.destroy();
			updateHistory();
		} else if (process) {
			if (process.killed || process.exitCode !== null) {
				updateHistory();
			} else {
				process.kill();
				process.on('exit', function () {
					updateHistory();
				});
			}
		} else {
			updateHistory();
		}
		delete tasks[name];
	} else {
		next();
	}
};

exports.packProject = function (name, historyId, ignores, next) {
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	var task = tasks[name];
	var workspace = exports.getWorkspace(name);
	var buildPath = historyModule.getBuildPath(name, historyId);
	async.waterfall([
		function (next) {
			fs.ensureDir(path.dirname(buildPath), next);
		},
		function (made, next) {
			if (ignores) {
				ignores = ignores.map(function (item) {
					if (item.slice(-1) === '/') {
						item += '**';
					}
					return item;
				});
			}
			var archive = tar.pack(workspace, {
				ignore: function (filename) {
					for (var i = 0, l = ignores.length; i < l; ++i) {
						var relative = path.relative(workspace, filename);
						try {
							if (fs.statSync(filename).isDirectory()) {
								relative += '/';
							}
						} catch (e) {
						}
						if (minimatch(relative, ignores[i])) {
							return true;
						}
					}
				}
			});
			archive.pipe(zlib.Gzip()).pipe(fs.createWriteStream(buildPath)).on('finish', next);
			if (!task) {
				task = tasks[name] = {
					id: historyId,
					archive: archive
				};
			}
		}
	], function (err) {
		if (task && task['archive']) {
			delete tasks[name];
		}
		next(err);
	});
};

exports.deployProject = function (name, historyId, nodes, next) {
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	var task = tasks[name];
	var buildPath = historyModule.getBuildPath(name, historyId);
	var stream = fs.createReadStream(buildPath);
	if (!task) {
		task = tasks[name] = {
			id: historyId,
			requests: []
		}
	}
	nodes = nodes || project['deploy_nodes'];
	async.map(nodes, function (node, next) {
		var data = {
			name: name,
			cwd: node['cwd'],
			host: node['host'],
			token: node['token'],
			history_id: historyId,
			env_vars: project['env_vars'],
			pre_deploy_scripts: project['pre_deploy_scripts'],
			post_deploy_scripts: project['post_deploy_scripts']
		};
		var finished = false;
		var query = qs.stringify(data);
		var host = node['host'];
		var port = node['port'];
		var req = http.request({
			host: host,
			port: port,
			method: 'post',
			path: '/deploy?' + query
		}, function (res) {
			utils.receiveJSON(res, function (err, json) {
				if (!finished) {
					finished = true;
					next(err, json);
				}
			});
		});
		req.on('error', function (err) {
			if (!finished) {
				finished = true;
				next(err);
			}
		});
		stream.pipe(req);
		if (task) {
			task['requests'].push(req);
		}
	}, function (err, results) {
		if (task && task['requests']) {
			delete tasks[name];
		}
		if (err) {
			next(err);
		} else {
			resolveNodeResults(results, nodes, next);
		}
	});
};

exports.executeScript = function (name, scriptId, next) {
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	var nodes = project['deploy_nodes'];
	var operationScript = project['operation_scripts'] || [];
	var script = operationScript[scriptId];
	async.map(nodes, function (node, next) {
		var data = {
			name: name,
			cwd: node['cwd'],
			host: node['host'],
			token: node['token'],
			script_id: scriptId,
			command: script['command'],
			env_vars: project['env_vars']
		};
		var finished = false;
		var query = qs.stringify(data);
		var host = node['host'];
		var port = node['port'];
		var req = http.request({
			host: host,
			port: port,
			method: 'post',
			path: '/execute?' + query
		}, function (res) {
			utils.receiveJSON(res, function (err, json) {
				if (!finished) {
					finished = true;
					next(err, json);
				}
			});
		});
		req.on('error', function (err) {
			if (!finished) {
				finished = true;
				next(err);
			}
		});
		req.end();
	}, function (err, results) {
		if (err) {
			next(err);
		} else {
			resolveNodeResults(results, nodes, next);
		}
	});
};

exports.ensureWorkspace = function (name, next) {
	fs.ensureDir(exports.getWorkspace(name), next);
};

exports.cleanWorkspace = function (name, next) {
	fs.remove(exports.getWorkspace(name), next);
};

exports.getWorkspace = function (name) {
	var configDir = utils.getConfigDir();
	return configDir + '/workspace/' + name;
};

exports.getBuildEnv = function (name, historyId) {
	var project = exports.getProject(name) || {};
	return utils.extend({}, process.env, {
		PROJECT_NAME: name,
		BUILD_ID: historyId
	}, project['env_vars']);
};

exports.checkPermission = function (user, project, next) {
	var username = user['username'];
	var managers = project['managers'] || [];
	user = userModule.getUser(username);
	if (user && user['is_admin'] && user['enabled'] || managers.indexOf(username) >= 0) {
		next();
	} else {
		next(errFactory.unauthorized());
	}
};

exports.removeManager = function (manager, next) {
	utils.forEach(projects, function (project) {
		var managers = project['managers'];
		var index = managers.indexOf(manager);
		if (index >= 0) {
			managers.splice(index, 1);
			return false;
		}
	});
	utils.writeConfig('projects', projects, next);
};

function resolveNodeResults(results, nodes, next) {
	var err;
	var output = '';
	var failed = false;
	if (results) {
		output = results.map(function (res, i) {
			var msg = '';
			var node = nodes[i];
			var host = node['host'];
			if (res && res['data']) {
				msg += res['data'];
			}
			if (res && res['error']) {
				failed = true;
				msg += '\n\n' + res['error_desc'] || res['error'];
			}
			return '\u001b[1m' + host + ':\u001b[22m\n' + msg;
		}).join('\n\n');
	}
	if (failed) {
		err = errFactory.runtimeError(output);
	}
	next(err, output);
}

function runCommand(name, historyId, step, command, next) {
	if (!command) {
		next();
		return;
	}
	var configDir = utils.getConfigDir();
	var env = exports.getBuildEnv(name, historyId);
	var commandFile = configDir + '/tmp/' + name + '-' + historyId + '-' + step;
	async.waterfall([
		function (next) {
			historyModule.writeOutput(name, historyId, step, command + '\n', next);
		},
		function (next) {
			fs.outputFile(commandFile, command, next);
		},
		function (next) {
			var finished = false;
			var workspace = exports.getWorkspace(name);
			var p = spawn('sh', [commandFile], {
				cwd: workspace,
				env: env
			});
			p.stdout.on('data', function (data) {
				historyModule.writeOutput(name, historyId, step, data);
			});
			p.stderr.on('data', function (data) {
				historyModule.writeOutput(name, historyId, step, data);
			});
			p.on('close', function (code) {
				if (!finished) {
					finished = true;
					if (code) {
						next(errFactory.runtimeError('Process exited with code ' + code));
					} else {
						next();
					}
				}
			});
			p.on('error', function (err) {
				if (!finished) {
					finished = true;
					next(err);
				}
			});
			tasks[name] = {
				id: historyId,
				process: p
			};
		}
	], function (err) {
		fs.remove(commandFile);
		if (tasks[name]) {
			delete tasks[name];
			next(err);
		}
	});
}
