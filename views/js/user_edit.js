(function () {
	var API = '/api/users';

	var vm = new Vue({
		el: 'body',
		data: {
			user: {}
		},
		methods: {
			init: function () {
				window.nav.init('users');

				var params = utils.parseParams('/users/:name/edit');
				var username = params['name'];
				var self = this;
				reqwest(API + '/' + username, function (res) {
					self.user = res['data'];
				});
			},
			back: function () {
				history.back();
				location.href = '/users';
			},
			submit: function () {
				var user = this.user;
				var username = user['username'];
				reqwest({
					method: 'put',
					url: API + '/' + username,
					data: JSON.stringify(user),
					success: function () {
						location.href = '/users';
					},
					error: function (xhr) {
						try {
							var res = JSON.parse(xhr.responseText);
							utils.showToast(res['error_desc'] || res['error']);
						} catch (e) {
							utils.showToast(xhr['statusText']);
						}
					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
