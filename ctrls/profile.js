var errFactory = require('../libs/err_factory');
var userModule = require('../modules/user');

exports.getViewHandler = function (req, res) {
	var me = userModule.getUser(req.user['username']);
	if (me) {
		res.render('profile', {
			me: me
		});
	} else {
		next(errFactory.unauthorized());
	}
};