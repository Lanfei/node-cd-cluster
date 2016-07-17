(function () {
	var API = '/api/auth/login';

	new Vue({
		el: '#auth',
		data: {
			user: {}
		},
		methods: {
			submit: function () {
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
			},
			signup: function () {
				location.href = '/signup';
			},
			i18n: utils.i18n
		}
	});

})();
