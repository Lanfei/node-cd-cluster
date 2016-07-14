(function () {
	var API = '/api/auth/signup';

	new Vue({
		el: '#auth',
		data: {
			user: {}
		},
		methods: {
			handleSubmit: function (e) {
				reqwest({
					url: API,
					method: 'post',
					data: JSON.stringify(this.user),
					success: function () {
						location.href = '/';
					},
					error: function () {
						console.error('error');
					}
				});
				e.preventDefault();
			},
			login: function () {
				location.href = '/login';
			},
			i18n: utils.i18n
		}
	});

})();
