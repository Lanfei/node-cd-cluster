(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: 'body',
		data: {
			project: {},
			executing: false,
			executionResult: null,
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
				var params = utils.parseParams('/projects/:name');
				var name = params['name'];
				if (name) {
					reqwest(API + '/' + encodeURIComponent(name), function (res) {
						var project = res['data'];
						var histories = project['histories'];
						var latestHistory = histories[histories.length - 1] || {};
						var status = latestHistory['status'];
						self.project = project;
						if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
							self.checkStatus();
						}
					});
				}
			},
			checkStatus: function () {
				var self = this;
				var project = this.project;
				var name = project['name'];
				reqwest(API + '/' + encodeURIComponent(name) + '/status', function (res) {
					var data = res['data'];
					var status = data['status'];
					var histories = project['histories'];
					histories.pop();
					histories.push(data);
					if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
						setTimeout(function () {
							self.checkStatus(project);
						}, 1000);
					}
				});
			},
			back: function () {
				history.back();
				location.href = '/projects';
			},
			abort: function () {
				var self = this;
				var project = this.project;
				var name = project['name'];
				reqwest({
					url: API + '/' + encodeURIComponent(name) + '/abort',
					method: 'post',
					success: function () {
						self.checkStatus();
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
			deploy: function (historyId) {
				var self = this;
				var name = this.project['name'];
				self.executing = true;
				self.executionResult = '';
				reqwest({
					method: 'post',
					url: API + '/' + encodeURIComponent(name) + '/deploy?history_id=' + historyId,
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
					url: API + '/' + encodeURIComponent(name) + '/execute?script_id=' + scriptId,
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