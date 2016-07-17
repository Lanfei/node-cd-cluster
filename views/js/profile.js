(function () {
	var API = '/api/users';

	var vm = new Vue({
		el: 'body',
		data: {
			user: {}
		},
		methods: {
			init: function () {
				window.nav.init('profile');

				var username = document.getElementById('username').innerText.trim();
				var self = this;
				reqwest(API + '/' + username, function (res) {
					self.user = res['data'];
				});
			},
			back: function () {
				history.back();
				location.href = '/';
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
					error: function () {

					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
