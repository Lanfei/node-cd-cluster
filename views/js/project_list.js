(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: '#main',
		data: {
			projects: [],
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
				reqwest(API, function (res) {
					var projects = res['data'];
					self.projects = projects;
					projects.forEach(function (project, i) {
						self.formatProject(project);
						var status = project['status'];
						if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
							self.checkStatus(i);
						}
					});
				});
			},
			addProject: function () {
				location.href = '/projects/add';
			},
			editProject: function (project) {
				location.href = '/projects/' + project['name'] + '/edit';
			},
			buildProject: function (project, index) {
				var self = this;
				var projects = this.projects;
				var name = project['name'];
				reqwest({
					url: API + '/' + name + '/build',
					method: 'post',
					success: function (res) {
						var project = res['data'];
						projects.splice(index, 1, self.formatProject(project));
						self.checkStatus(index);
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			abortProject: function (project, index) {
				var self = this;
				var projects = this.projects;
				var name = project['name'];
				reqwest({
					url: API + '/' + name + '/abort',
					method: 'post',
					success: function (res) {
						var project = res['data'];
						projects.splice(index, 1, self.formatProject(project));
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			formatProject: function (project) {
				var histories = project['histories'] || {};
				var historyLength = project['history_length'];
				var latestHistory = histories[historyLength] || {};
				project['last_build'] = latestHistory['start_time'];
				project['last_duration'] = latestHistory['duration'];
				project['status'] = latestHistory['status'] || this.STATUS_INITIAL;
				return project;
			},
			checkStatus: function (index) {
				var self = this;
				var projects = this.projects;
				var project = projects[index];
				var name = project['name'];
				reqwest(API + '/' + name + '/status', function (res) {
					var data = res['data'];
					var status = project['status'] = data['status'];
					project['last_build'] = data['start_time'];
					project['last_duration'] = data['duration'];
					if (status >= self.STATUS_UPDATING && status <= self.STATUS_DEPLOYING) {
						setTimeout(function () {
							self.checkStatus(index);
						}, 1000);
					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();
})();
