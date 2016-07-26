var ms = require('ms');
var fs = require('fs-extra');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');

var secret = getSecret();

function getSecret() {
	var configDir = utils.getConfigDir();
	var filename = configDir + '/secret';
	var secret = '';
	try {
		secret = fs.readFileSync(filename).toString();
	} catch (e) {
		for (var i = 0; i < 32; ++i) {
			var rnd = 48 + Math.floor(Math.random() * 75);
			secret += String.fromCharCode(rnd);
		}
		fs.outputFile(filename, secret);
	}
	return secret;
}

exports.verifier = function (req, res, next) {
	var token = req.cookies['cdc_id_token'] || req.query['id_token'];
	if (token) {
		jwt.verify(token, secret, function (err, decoded) {
			if (err) {
				err = errFactory.unauthorized(err.message, err.stack);
				res.clearCookie('cdc_id_token');
			}
			req.user = decoded;
			next(err);
		});
	} else {
		next(errFactory.unauthorized());
	}
};

exports.decoder = function (req, res, next) {
	var token = req.cookies['cdc_id_token'] || req.query['id_token'];
	if (token) {
		req.user = jwt.decode(token);
	}
	next();
};

exports.sign = function (payload, next) {
	jwt.sign(payload, secret, {}, function (err, token) {
		next(err, {
			id_token: token
		});
	});
};

exports.md5 = function (data) {
	var md5 = crypto.createHash('md5');
	md5.update(new Buffer(String(data)).toString('binary'));
	return md5.digest('hex');
};
