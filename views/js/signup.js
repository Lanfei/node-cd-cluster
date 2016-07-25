(function () {
	var API = '/api/auth/signup';

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
			login: function () {
				location.href = '/login';
			},
			i18n: utils.i18n
		}
	});

})();
