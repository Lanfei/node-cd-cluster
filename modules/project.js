var path = require('path');
var http = require('http');
var fs = require('fs-extra');
var async = require('async');
var archiver = require('archiver');
var querystring = require('querystring');
var spawn = require('child_process').spawn;
var utils = require('../libs/utils');
var historyModule = require('../modules/history');

var tasks = {};

var projects = exports.projects = utils.readConfig('projects') || [];

utils.forEach(projects, function (project) {
	utils.forEach(project['histories'], function (history) {
		if (history['status'] === historyModule.STATUS_BUILDING) {
			history['status'] = historyModule.STATUS_ABORTED;
		}
	});
});
utils.writeConfig('projects', projects);

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
	var data;
	utils.forEach(projects, function (project, i) {
		if (project['name'] === name) {
			data = projects.splice(i, 1);
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

exports.buildProject = function (name, next) {
	var project = exports.getProject(name);
	var history;
	var historyId;
	if (!project) {
		next();
		return;
	}
	async.waterfall([
		function (next) {
			var histories = project['histories'] || {};
			var historyLength = project['history_length'] + 1 || 1;
			historyId = historyLength;
			history = histories[historyId] = {
				start_time: Date.now(),
				status: historyModule.STATUS_BUILDING
			};
			project['histories'] = histories;
			project['history_length'] = historyLength;
			exports.updateProject(name, project, next);
		},
		function (next) {
			exports.ensureWorkspace(name, next);
		},
		function (made, next) {
			var command;
			var repoType = project['repo_type'];
			if (repoType === 'git') {
				if (made) {
					var repoUrl = project['repo_url'];
					var branch = project['repo_branch'] || 'master';
					command = 'git clone --progress --depth 1 -b ' + branch + ' ' + repoUrl + ' ./';
				} else {
					command = 'git pull';
				}
			}
			history['step'] = historyModule.STEP_CHECKOUT;
			runCommand(name, historyId, history['step'], command, next);
		},
		function (next) {
			history['step'] = historyModule.STEP_BUILD;
			runCommand(name, historyId, history['step'], project['build_scripts'], next);
		},
		function (next) {
			history['step'] = historyModule.STEP_TEST;
			runCommand(name, historyId, history['step'], project['test_scripts'], next);
		},
		function (next) {
			history['step'] = historyModule.STEP_PACK;
			historyModule.writeOutput(name, historyId, history['step'], 'Creating zip file...\n', next);
		},
		function (next) {
			exports.packProject(name, historyId, project['ignores'], next);
		},
		function (next) {
			history['build_url'] = historyModule.getBuildUrl(name, historyId);
			historyModule.writeOutput(name, historyId, history['step'], 'Done.', next);
		},
		function (next) {
			history['step'] = historyModule.STEP_DEPLOY;
			exports.deployProject(name, historyId, next);
		},
		function (result, next) {
			historyModule.writeOutput(name, historyId, history['step'], result['output'], function (err) {
				next(result['error'] || err);
			});
		}
	], function (err) {
		var startTime = history['start_time'];
		history['duration'] = Date.now() - startTime;
		if (err) {
			history['status'] = historyModule.STATUS_FAILED;
			historyModule.writeOutput(name, historyId, history['step'], '\n' + err.message);
		} else {
			history['status'] = historyModule.STATUS_SUCCESS;
		}
		history['step'] = undefined;
		exports.updateProject(name, project);
		next && next(err);
	});
};

exports.abortProject = function (name, next) {
	var task = tasks[name];
	var project = exports.getProject(name);
	if (task && project) {
		var histories = project['histories'];
		var historyId = task['id'];
		var process = task['process'];
		var history = histories[historyId];
		if (process.killed || process.exitCode !== null) {
			next();
		} else {
			process.kill();
			process.on('exit', function () {
				history['status'] = historyModule.STATUS_ABORTED;
				exports.updateProject(name, project);
				next();
			});
		}
		delete tasks[name];
	} else {
		next();
	}
};

exports.packProject = function (name, historyId, ignores, next) {
	var zipPath = historyModule.getBuildPath(name, historyId);
	var workspace = exports.getWorkspace(name);
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	async.waterfall([
		function (next) {
			fs.ensureDir(path.dirname(zipPath), next);
		},
		function (made, next) {
			fs.remove(zipPath, next);
		},
		function (next) {
			var archive = archiver('zip', {});
			var output = fs.createWriteStream(zipPath);
			if (ignores) {
				ignores = ignores.split('\n').map(function (item) {
					if (item.slice(-1) === '/') {
						item += '**';
					}
					return item;
				});
			}
			try {
				archive.bulk([
					{
						src: '**/*',
						expand: true,
						ignore: ignores,
						cwd: workspace
					}
				]);
				archive.pipe(output);
				archive.finalize();
				output.on('close', next);
				archive.on('error', next);
			} catch (e) {
				next(e);
				output.end();
			}
		}
	], next);
};

exports.deployProject = function (name, historyId, next) {
	var project = exports.getProject(name);
	if (!project) {
		next();
		return;
	}
	var nodes = project['deploy_nodes'];
	var buildPath = historyModule.getBuildPath(name, historyId);
	var stream = fs.createReadStream(buildPath);
	async.map(nodes, function (node, next) {
		var data = {
			name: name,
			cwd: node['cwd'],
			host: node['host'],
			history_id: historyId,
			token: project['deploy_token'],
			pre_deploy_scripts: project['pre_deploy_scripts'],
			post_deploy_scripts: project['post_deploy_scripts']
		};
		var qs = querystring.stringify(data);
		var host = node['host'];
		var port = node['port'];
		var req = http.request({
			host: host,
			port: port,
			method: 'post',
			path: '/deploy?' + qs
		}, function (res) {
			utils.receiveJSON(res, next);
		});
		req.on('error', next);
		stream.pipe(req);
	}, function (err, results) {
		var output = '';
		var deployResult = {};
		if (results) {
			output = results.map(function (result, i) {
				result = result || {};
				if (result['error']) {
					deployResult['error'] = new Error('Deployment Failed');
				}
				var node = nodes[i];
				var host = node['host'];
				return '\u001b[1m' + host + ':\u001b[22m\n' + (result['data'] || result['error_desc'] || '');
			}).join('\n\n');
		}
		deployResult['output'] = output;
		next(err, deployResult);
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
	return utils.extend({}, process.env, {
		PROJECT_NAME: name,
		BUILD_ID: historyId
	});
};

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
				if (code !== 0) {
					next(new Error('Process exited with code ' + code));
				} else {
					next();
				}
			});
			p.on('error', next);
			tasks[name] = {
				id: historyId,
				process: p
			};
		}
	], function (err) {
		// fs.remove(commandFile);
		next(err);
	});
}
