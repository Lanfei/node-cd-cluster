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
			signup: function () {
				location.href = '/signup';
			},
			i18n: utils.i18n
		}
	});

})();
