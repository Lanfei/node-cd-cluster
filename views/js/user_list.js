(function () {
	var API = '/api/users';

	var vm = new Vue({
		el: 'body',
		data: {
			me: {},
			users: []
		},
		methods: {
			init: function () {
				window.nav.init('users');

				var self = this;
				reqwest(API, function (res) {
					self.users = res['data'];
				});
			},
			deleteUser: function (user) {
				if (!confirm(utils.i18n('Are you sure?'))) {
					return;
				}
				var username = user['username'];
				reqwest({
					method: 'delete',
					url: API + '/' + username,
					success: function () {
						location.reload();
					},
					error: function () {

					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
