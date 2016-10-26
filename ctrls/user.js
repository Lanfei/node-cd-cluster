var async = require('async');
var token = require('../libs/token');
var utils = require('../libs/utils');
var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');
var projectModule = require('../modules/project');

var FIELDS = ['username', 'email', 'tel', 'is_admin', 'enabled'];

exports.getListViewHandler = function (req, res) {
	res.render('user_list', {
		me: userModule.getUser(req.user['username'])
	});
};

exports.getEditViewHandler = function (req, res, next) {
	userModule.checkAdminPermission(req.user, function (err) {
		if (err) {
			next(err);
		} else {
			res.render('user_edit');
		}
	});
};

exports.getHandler = function (req, res) {
	var users = userModule.getUsers();
	var result = users.map(function (user) {
		return utils.filter(user, FIELDS);
	});
	res.json({
		data: result
	});
};

exports.getItemHandler = function (req, res, next) {
	var username = req.params['name'];
	async.waterfall([
		function (next) {
			userModule.checkAdminPermission(req.user, next);
		},
		function (next) {
			checkUser(username, next);
		}
	], function (err, user) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: utils.filter(user, FIELDS)
			});
		}
	});
};

exports.putItemHandler = function (req, res, next) {
	var me;
	var user;
	var password;
	var username = req.params['name'];
	async.waterfall([
		function (next) {
			checkUser(username, next);
		},
		function (data, next) {
			user = data;
			var myName = req.user['username'];
			me = userModule.getUser(myName);
			if (myName !== user['username'] && !me['is_admin']) {
				next(errFactory.unauthorized());
			} else {
				next();
			}
		},
		function (next) {
			utils.receiveJSON(req, next);
		},
		function (data, next) {
			var editableFields;
			if (me['is_admin']) {
				editableFields = ['email', 'tel', 'is_admin', 'enabled'];
			} else {
				editableFields = ['email', 'tel'];
			}
			password = data['password'];
			data = utils.filter(data, editableFields);
			user = utils.extend({}, user, data);
			if (password) {
				user['password'] = token.md5(password);
			}
			userModule.updateUser(username, user, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

exports.deleteItemHandler = function (req, res, next) {
	var username = req.params['name'];
	async.waterfall([
		function (next) {
			userModule.checkAdminPermission(req.user, next);
		},
		function (next) {
			userModule.deleteUser(username, next)
		},
		function (next) {
			projectModule.removeManager(username, next);
		}
	], function (err) {
		if (err) {
			next(err);
		} else {
			res.json({
				data: 'ok'
			});
		}
	});
};

function checkUser(username, next) {
	var user = userModule.getUser(username);
	if (user) {
		next(null, user);
	} else {
		next(errFactory.notFound());
	}
}
