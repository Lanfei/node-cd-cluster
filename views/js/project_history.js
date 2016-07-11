(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: '#main',
		data: {
			id: null,
			name: '',
			history: {},
			STATUS_INITIAL: 0,
			STATUS_BUILDING: 1,
			STATUS_SUCCESS: 2,
			STATUS_FAILED: 3,
			STATUS_ABORTED: 4,
			STEP_CHECKOUT: 'checkout',
			STEP_BUILD: 'build',
			STEP_TEST: 'test',
			STEP_PACK: 'pack',
			STEP_DEPLOY: 'deploy'
		},
		methods: {
			init: function () {
				window.nav.init('projects');

				var self = this;
				var params = utils.parseParams('/projects/:name/histories/:id');
				var id = this.id = params['id'];
				var name = this.name = params['name'];

				reqwest(API + '/' + name + '/histories/' + id, function (res) {
					var history = self.history = res['data'];
					if (history['status'] === self.STATUS_BUILDING) {
						self.checkStatus();
					}
				});
			},
			back: function () {
				history.back();
				location.href = '/projects';
			},
			checkStatus: function () {
				var self = this;
				var id = this.id;
				var name = this.name;
				reqwest({
					url: API + '/' + name + '/histories/' + id,
					success: function (res) {
						var data = res['data'];
						if (JSON.stringify(self.history) !== JSON.stringify(data)) {
							self.history = data;
							Vue.nextTick(function () {
								window.scrollTo(window.scrollX, document.body.scrollHeight);
							});
						}
						if (data['status'] === self.STATUS_BUILDING) {
							setTimeout(function () {
								self.checkStatus();
							}, 1000);
						}
					},
					error: function () {
						setTimeout(function () {
							self.checkStatus();
						}, 1000);
					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
