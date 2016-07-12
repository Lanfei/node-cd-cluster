(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: '#main',
		data: {
			project: {},
			executing: false,
			executionResult: null,
			STATUS_INITIAL: 0,
			STATUS_BUILDING: 1,
			STATUS_SUCCESS: 2,
			STATUS_FAILED: 3,
			STATUS_ABORTED: 4
		},
		methods: {
			init: function () {
				window.nav.init('projects');

				var self = this;
				var params = utils.parseParams('/projects/:name');
				var name = params['name'];
				if (name) {
					reqwest(API + '/' + name, function (res) {
						self.project = res['data'];
					});
				}
			},
			back: function () {
				history.back();
				location.href = '/projects';
			},
			deploy: function (historyId) {
				var self = this;
				var name = this.project['name'];
				self.executing = true;
				self.executionResult = '';
				reqwest({
					method: 'post',
					url: API + '/' + name + '/deploy?history_id=' + historyId,
					success: function (res) {
						self.executionResult = res['data'];
						self.executing = false;
					},
					error: function (xhr) {
						try {
							var res = JSON.parse(xhr.responseText);
							self.executionResult = res['error_desc'] || res['error'];
						} catch (e) {
							self.executionResult = xhr['statusText'];
						}
						self.executing = false;
					}
				});
			},
			executeScript: function (scriptId) {
				var self = this;
				var name = this.project['name'];
				self.executing = true;
				self.executionResult = '';
				reqwest({
					method: 'post',
					url: API + '/' + name + '/execute?script_id=' + scriptId,
					success: function (res) {
						self.executionResult = res['data'];
						self.executing = false;
					},
					error: function (xhr) {
						try {
							var res = JSON.parse(xhr.responseText);
							self.executionResult = res['error_desc'] || res['error'];
						} catch (e) {
							self.executionResult = xhr['statusText'];
						}
						self.executing = false;
					}
				});
			},
			closeDialog: function () {
				this.executing = false;
				this.executionResult = '';
			},
			i18n: utils.i18n
		}
	});

	vm.init();

})();