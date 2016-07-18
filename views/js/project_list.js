(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: 'body',
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
					self.projects = res['data'];
					self.projects.forEach(function (project, i) {
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
				var name = project['name'];
				reqwest({
					url: API + '/' + name + '/build',
					method: 'post',
					success: function () {
						self.checkStatus(index);
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			abortProject: function (project, index) {
				var self = this;
				var name = project['name'];
				reqwest({
					url: API + '/' + name + '/abort',
					method: 'post',
					success: function () {
						self.checkStatus(index);
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			checkStatus: function (index) {
				var self = this;
				var projects = this.projects;
				var project = projects[index];
				var name = project['name'];
				reqwest(API + '/' + name + '/status', function (res) {
					var data = res['data'];
					var status = data['status'];
					project['status'] = status || self.STATUS_INITIAL;
					project['last_build_id'] = data['id'];
					project['last_duration'] = data['duration'];
					project['last_build_time'] = data['start_time'];
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
