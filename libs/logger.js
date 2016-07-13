var fs = require('fs-extra');
var morgan = require('morgan');
var dateStream = require('date-stream');
var utils = require('./utils');

var streams = {};
var isDevelopment = process.env['NODE_ENV'] === 'development';

var logDir = utils.getConfigDir() + '/logs';
fs.ensureDirSync(logDir);

exports.getDailyStream = function (type) {
	if (!streams[type]) {
		streams[type] = dateStream.getStream(logDir + '/' + type + '.log');
	}
	return streams[type];
};

exports.getAccessLogger = function () {
	if (isDevelopment) {
		return morgan('dev');
	} else {
		return morgan(':remote-addr [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', {
			stream: exports.getDailyStream('access')
		});
	}
};

exports.writeLog = function (type, data, dailySplit) {
	if (dailySplit) {
		var stream = exports.getDailyStream(type);
		stream.write(data + '\n');
	} else {
		fs.appendFile(logDir + '/' + type + '.log', data + '\n');
	}
};

exports.writeError = function (err) {
	var msg = err.message;
	if (err.desc) {
		msg += ':' + err.desc;
	}
	msg += '\n' + err.stack;
	if (isDevelopment) {
		console.error(msg);
	} else {
		var stream = exports.getDailyStream('error');
		stream.write(msg + '\n\n');
	}
};
