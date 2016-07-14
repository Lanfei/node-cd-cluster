(function () {
	var API = '/api/auth/login';

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
			signup: function () {
				location.href = '/signup';
			},
			i18n: utils.i18n
		}
	});

})();
