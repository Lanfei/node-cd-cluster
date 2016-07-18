(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: 'body',
		data: {
			projects: [],
			curIndex: null,
			curParams: null,
			curProject: null,
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
			chooseProject: function (project, index) {
				var params = {};
				if (project.ignores) {
					params['ignores'] = project.ignores.trim().split('\n');
				} else {
					params['ignores'] = [];
					project['ignores'] = '';
				}
				if (project['deploy_nodes']) {
					params['deploy_nodes'] = project['deploy_nodes'].concat();
				} else {
					params['deploy_nodes'] = [];
					project['deploy_nodes'] = [];
				}
				this.curIndex = index;
				this.curParams = params;
				this.curProject = project;
			},
			buildProject: function () {
				var self = this;
				var name = this.curProject['name'];
				reqwest({
					url: API + '/' + name + '/build',
					method: 'post',
					data: JSON.stringify(this.curParams),
					success: function () {
						self.closeDialog();
						self.checkStatus(self.curIndex);
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
			toggleIgnore: function (ignore, e) {
				var params = this.curParams;
				if (e.target.checked) {
					params['ignores'].push(ignore);
				} else {
					params['ignores'].$remove(ignore);
				}
			},
			toggleNode: function (node, e) {
				var params = this.curParams;
				if (e.target.checked) {
					params['deploy_nodes'].push(node);
				} else {
					params['deploy_nodes'].$remove(node);
				}
				console.log(JSON.stringify(params))
			},
			closeDialog: function () {
				this.curProject = null;
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
