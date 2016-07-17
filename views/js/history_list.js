(function () {
	var API = '/api/histories';

	var vm = new Vue({
		el: 'body',
		data: {
			histories: []
		},
		methods: {
			init: function () {
				window.nav.init('histories');

				var self = this;
				reqwest(API, function (res) {
					self.histories = res['data'];
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
