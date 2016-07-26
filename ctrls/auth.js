var async = require('async');
var utils = require('../libs/utils');
var token = require('../libs/token');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');

var users = userModule.getUsers();

exports.getSignupViewHandler = function (req, res) {
	res.render('signup');
};

exports.getLoginViewHandler = function (req, res) {
	res.render('login');
};

exports.getLogoutViewHandler = function (req, res) {
	res.clearCookie('cdc_id_token');
	res.redirect('/login');
};

exports.signupHandler = function (req, res, next) {
	var user;
	var isFirst = users.length === 0;
	async.waterfall([
		function (next) {
			utils.receiveJSON(req, next);
		},
		function (data, next) {
			user = data;
			utils.checkParams([data['username'], data['password']], next);
		},
		function (next) {
			checkConflict(user['username'], next);
		},
		function (next) {
			if (isFirst) {
				user['enabled'] = true;
				user['is_admin'] = true;
			} else {
				user['enabled'] = false;
				user['is_admin'] = false;
			}
			user['password'] = token.md5(user['password']);
			userModule.addUser(user, next);
		},
		function (next) {
			token.sign({
				username: user['username']
			}, next);
		}
	], function (err, jwt) {
		if (err) {
			next(err);
		} else {
			if (isFirst) {
				res.cookie('cdc_id_token', jwt['id_token']);
			}
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.loginHandler = function (req, res, next) {
	var username;
	var password;
	async.waterfall([
		function (next) {
			utils.receiveJSON(req, next);
		},
		function (data, next) {
			username = data['username'];
			password = data['password'];
			utils.checkParams([username, password], next);
		},
		function (next) {
			var user = userModule.getUser(username);
			if (user && user['password'] === token.md5(password) && user['enabled']) {
				next();
			} else {
				next(errFactory.unauthorized('Incorrect username or password'));
			}
		},
		function (next) {
			token.sign({
				username: username
			}, next);
		}
	], function (err, jwt) {
		if (err) {
			next(err);
		} else {
			res.cookie('cdc_id_token', jwt['id_token']);
			res.json({
				data: jwt
			});
		}
	});
};

function checkConflict(username, next) {
	var user = userModule.getUser(username);
	if (user) {
		next(errFactory.conflictError('User `' + username + '` is already exists.'));
	} else {
		next();
	}
}
