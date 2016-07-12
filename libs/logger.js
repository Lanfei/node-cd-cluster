/*!
 * 日志模块
 * @module libs/logger
 * @author Gengchang
 */
var fs = require('fs-extra');
var morgan = require('morgan');
var dateStream = require('date-stream');
var utils = require('./utils');

var streams = {};
var isDevelopment = process.env['NODE_ENV'] === 'development';

var logDir = utils.getConfigDir() + '/logs';
fs.ensureDirSync(logDir);

/**
 * 获取按日分割文件流
 * @param  {String} type 日志类型
 * @return {Stream}      文件流
 */
exports.getDailyStream = function (type) {
	if (!streams[type]) {
		streams[type] = dateStream.getStream(logDir + '/' + type + '.log');
	}
	return streams[type];
};

/**
 * 获取访问日志处理中间件
 * @return {Function}
 */
exports.getAccessLogger = function () {
	if (isDevelopment) {
		return morgan('dev');
	} else {
		return morgan(':remote-addr [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', {
			stream: exports.getDailyStream('access')
		});
	}
};

/**
 * 写入日志，生产环境写入文件，开发环境输出至控制台
 * @param {String}  type         日志类型，同时也作为文件名
 * @param {String}  data         要写入的日志内容
 * @param {Boolean} [dailySplit] 是否按日分割
 */
exports.writeLog = function (type, data, dailySplit) {
	if (dailySplit) {
		var stream = exports.getDailyStream(type);
		stream.write(data + '\n');
	} else {
		fs.appendFile(logDir + '/' + type + '.log', data + '\n');
	}
};

/**
 * 写入错误日志
 * @param {Error} err 错误对象
 */
exports.writeError = function (err) {
	if (isDevelopment) {
		console.error(err.message + ': ' + err.desc + '\n' + err.stack);
	} else {
		var data = err.message + ': ' + err.desc + '\n' + err.stack + '\n';
		var stream = exports.getDailyStream('error');
		stream.write(data + '\n');
	}
};
