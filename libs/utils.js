var os = require('os');
var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var errFactory = require('./err_factory');

exports.startInstance = function (role, env) {
	var configDir = exports.getConfigDir();
	var child = spawn(process.argv[0], [path.join(__dirname, '../bin/www')], {
		env: env,
		detached: true,
		stdio: ['ignore']
	});
	child.unref();
	child.stdout.on('data', function () {
		fs.outputFileSync(configDir + '/pids/' + role + '.pid', child.pid);
		process.exit();
	});
	child.stderr.on('data', function (data) {
		console.error(data.toString());
	});
	fs.outputJsonSync(configDir + '/envs/' + role + '.json', env);
};

exports.reloadInstance = function (role) {
	var configDir = exports.getConfigDir();
	var env = fs.readJsonSync(configDir + '/envs/' + role + '.json');
	exports.stopInstance(role);
	exports.startInstance(role, env);
};

exports.stopInstance = function (role) {
	try {
		var filename = exports.getConfigDir() + '/pids/' + role + '.pid';
		var pid = fs.readFileSync(filename);
		fs.remove(filename);
		process.kill(pid);
	} catch (e) {
		console.error(e.message);
	}
};

exports.extend = function (target, /** ..., **/ objects) {
	target = target || {};
	for (var i = 1, l = arguments.length; i < l; ++i) {
		var object = arguments[i];
		exports.forEach(object, function (value, key) {
			target[key] = value;
		});
	}
	return target;
};

exports.forEach = function (object, iterator, thisObj) {
	var i, l;
	if (Array.isArray(object)) {
		for (i = 0, l = object.length; i < l; ++i) {
			if (iterator.call(thisObj, object[i], i, object) === false) {
				break;
			}
		}
	} else if (object instanceof Object) {
		var key,
			keys = Object.keys(object);
		for (i = 0, l = keys.length; i < l; ++i) {
			key = keys[i];
			if (iterator.call(thisObj, object[key], key, object) === false) {
				break;
			}
		}
	} else if (object !== undefined && iterator !== undefined) {
		iterator.call(thisObj, object, 0, object);
	}
};

exports.receiveBody = function (stream, next) {
	var length = 0,
		chunks = [];
	stream.on('data', function (chunk) {
		chunks.push(chunk);
		length += chunk.length;
	});
	stream.on('end', function () {
		var body = Buffer.concat(chunks, length);
		next(null, body);
	});
};

exports.receiveJSON = function (stream, next) {
	exports.receiveBody(stream, function (err, body) {
		var data;
		if (body && body.length) {
			try {
				data = JSON.parse(body);
			} catch (e) {
				err = errFactory.notAcceptable(e.message, e.stack);
			}
		}
		next(err, data);
	});
};

exports.getConfigDir = function () {
	var configDir = os.homedir() + '/.cd-cluster';
	try {
		fs.accessSync(configDir);
	} catch (e) {
		fs.mkdirSync(configDir);
	}
	return configDir;
};

exports.readConfig = function (name, next) {
	var err, config;
	var configDir = exports.getConfigDir();
	var filename = configDir + '/' + name + '.json';
	try {
		config = fs.readJsonSync(filename);
	} catch (e) {
		err = e;
		config = null;
	}
	next && next(err, config);
	return config;
};

exports.writeConfig = function (name, config, next) {
	var configDir = exports.getConfigDir();
	var filename = configDir + '/' + name + '.json';
	fs.outputJson(filename, config, next);
};

exports.checkParams = function (params, next) {
	var err = null;
	var count = 0;
	exports.forEach(params, function (item) {
		if (!item && item !== 0) {
			err = errFactory.paramError();
			return false;
		}
		++count;
	});
	if (!count) {
		err = errFactory.paramError();
	}
	next(err);
};

exports.filter = function (target, cols) {
	var result = {};
	exports.forEach(target, function (value, field) {
		if (cols.indexOf(field) >= 0) {
			result[field] = value;
		}
	});
	return result;
};
