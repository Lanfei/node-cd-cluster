var fs = require('fs-extra');
var async = require('async');
var unzip2 = require('unzip2');
var spawn = require('child_process').spawn;
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');
var projectModule = require('../modules/project');

var expectedToken = process.env['CD_CLUSTER_TOKEN'] || '';

exports.deployHandler = function (req, res, next) {
	var cwd = req.query['cwd'];
	var name = req.query['name'];
	var host = req.query['host'];
	var token = req.query['token'] || '';
	var historyId = req.query['history_id'];
	var preDeployScripts = req.query['pre_deploy_scripts'];
	var postDeployScripts = req.query['post_deploy_scripts'];
	var deployResult = '';
	var env = projectModule.getBuildEnv(name, historyId);
	async.waterfall([
		function (next) {
			if (token === expectedToken) {
				next();
			} else {
				next(errFactory.unauthorized('Invalid Token'));
			}
		},
		function (next) {
			utils.checkParams(cwd, next);
		},
		function (next) {
			runCommand('pre-deploy', preDeployScripts, cwd, env, next);
		},
		function (output, next) {
			deployResult += output;
			var stream = req.pipe(unzip2.Extract({path: cwd}));
			var finished = false;

			function callback(err) {
				if (!finished) {
					finished = true;
					next(err);
				}
			}

			stream.on('finish', callback);
			stream.on('error', callback);
		},
		function (next) {
			deployResult += '\nDeploying files...\n\n';
			runCommand('post-deploy', postDeployScripts, cwd, env, next);
		},
		function (output, next) {
			deployResult += output;
			next();
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: deployResult
			});
		}
	});
};

exports.executeHandler = function (req, res, next) {
	var cwd = req.query['cwd'];
	var name = req.query['name'];
	var command = req.query['command'];
	var token = req.query['token'] || '';
	var env = projectModule.getBuildEnv(name);
	async.waterfall([
		function (next) {
			if (token === expectedToken) {
				next();
			} else {
				next(errFactory.unauthorized('Invalid Token'));
			}
		},
		function (next) {
			runCommand('execute', command, cwd, env, next);
		}
	], function (err, output) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: output
			});
		}
	});
};

function runCommand(type, command, cwd, env, next) {
	if (!command) {
		next(null, '');
		return;
	}
	var finished = false;
	var output = command + '\n';
	var configDir = utils.getConfigDir();
	var rnd = Math.floor(Math.random() * Date.now());
	var commandFile = configDir + '/tmp/' + type + '-' + rnd;
	async.waterfall([
		function (next) {
			fs.outputFile(commandFile, command, next);
		},
		function (next) {
			var p = spawn('sh', [commandFile], {
				cwd: cwd,
				env: env
			});
			p.stdout.on('data', function (data) {
				output += data.toString();
			});
			p.stderr.on('data', function (data) {
				output += data.toString();
			});
			p.on('close', function (code) {
				if (!finished) {
					finished = true;
					if (code !== 0) {
						next(errFactory.runtimeError(output + '\nProcess exited with code ' + code));
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
		}
	], function (err) {
		fs.remove(commandFile);
		next(err, output);
	});
}
