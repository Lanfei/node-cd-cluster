#!/usr/bin/env node

var program = require('commander');
var utils = require('../libs/utils');
var pkg = require('../package.json');

program
	.version(pkg.version, '-v, --version');

program
	.command('start [port=8081]')
	.description('start the slave server')
	.option('-t, --token [token]', 'a token used to verify requests')
	.action(function (port, options) {
		var env = process.env;
		env['CD_CLUSTER_PORT'] = port || 8081;
		env['CD_CLUSTER_ROLE'] = 'slave';
		env['CD_CLUSTER_TOKEN'] = options['token'];
		utils.startInstance('slave', env);
	});

program
	.command('stop')
	.description('stop the slave server')
	.action(function () {
		utils.stopInstance('slave');
	});

program
	.command('reload')
	.description('reload the slave server')
	.action(function () {
		utils.reloadInstance('slave');
	});

if (!process.argv.slice(2).length) {
	program.help();
}

program.parse(process.argv);
