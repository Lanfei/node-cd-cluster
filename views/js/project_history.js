(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: 'body',
		data: {
			id: null,
			name: '',
			history: {},
			STATUS_INITIAL: 0,
			STATUS_UPDATING: 1,
			STATUS_BUILDING: 2,
			STATUS_TESTING: 3,
			STATUS_PACKING: 4,
			STATUS_DEPLOYING: 5,
			STATUS_SUCCESS: 6,
			STATUS_FAILED: 7,
			STATUS_ABORTED: 8
		},
		methods: {
			init: function () {
				window.nav.init('projects');

				var self = this;
				var params = utils.parseParams('/projects/:name/histories/:id');
				var id = this.id = params['id'];
				var name = this.name = params['name'];

				reqwest(API + '/' + encodeURIComponent(name) + '/histories/' + id, function (res) {
					var history = self.history = res['data'];
					var status = history['status'];
					if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
						setTimeout(function () {
							self.checkStatus();
						}, 1000);
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
					url: API + '/' + encodeURIComponent(name) + '/histories/' + id,
					success: function (res) {
						var data = res['data'];
						var status = data['status'];
						if (JSON.stringify(self.history) !== JSON.stringify(data)) {
							self.history = data;
							Vue.nextTick(function () {
								window.scrollTo(window.scrollX, document.body.scrollHeight);
							});
						}
						if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
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
