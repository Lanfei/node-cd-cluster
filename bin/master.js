#!/usr/bin/env node

var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var program = require('commander');
var utils = require('../libs/utils');
var pkg = require('../package.json');

program
	.version(pkg.version, '-v, --version');

program
	.command('start [port=8080]')
	.description('start cd-cluster master')
	.action(function (port) {
		var env = process.env;
		env['PORT'] = port || 8080;
		var child = spawn(process.argv[0], [__dirname + '/www'], {
			detached: true,
			env: env
		});
		child.unref();
		child.stdout.on('data', function () {
			fs.outputFileSync(utils.getConfigDir() + '/pids/master.pid', child.pid);
			process.exit();
		});
		child.stderr.on('data', function (data) {
			console.error(data.toString());
		});
	});

program
	.command('stop')
	.description('stop cd-cluster master')
	.action(function () {
		try {
			var filename = utils.getConfigDir() + '/pids/master.pid';
			var pid = fs.readFileSync(filename);
			fs.remove(filename);
			process.kill(pid);
		} catch (e) {
			console.log(e.message);
		}
	});

if (!process.argv.slice(2).length) {
	program.help();
}

program.parse(process.argv);