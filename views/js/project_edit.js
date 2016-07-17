(function () {
	var API = '/api/projects';
	var USER_API = '/api/users';

	var vm = new Vue({
		el: 'body',
		data: {
			name: '',
			project: {
				repo_type: 'none',
				deploy_nodes: [],
				operation_scripts: [],
				managers: []
			},
			users: [],
			backupNode: null,
			editingNode: null,
			backupScript: null,
			editingScript: null,
			addingManager: null
		},
		methods: {
			init: function () {
				window.nav.init('projects');

				var self = this;
				var params = utils.parseParams('/projects/:name/edit');
				var name = this.name = params['name'];
				if (name) {
					reqwest(API + '/' + name, function (res) {
						var data = res['data'];
						data['managers'] = data['managers'] || [];
						data['deploy_nodes'] = data['deploy_nodes'] || [];
						data['operation_scripts'] = data['operation_scripts'] || [];
						self.project = data;
					});
				}
				reqwest(USER_API, function (res) {
					self.users = res['data'];
				});
			},
			back: function () {
				history.back();
				location.href = '/projects';
			},
			addNode: function () {
				if (!this.editingNode) {
					var node = {};
					this.editingNode = node;
					this.project['deploy_nodes'].push(node);
				}
			},
			editNode: function (node) {
				this.editingNode = node;
				this.backupNode = utils.extend({}, node);
			},
			deleteNode: function (node) {
				if (confirm(utils.i18n('Are you sure?'))) {
					this.backupNode = null;
					this.editingNode = null;
					this.project['deploy_nodes'].$remove(node);
				}
			},
			updateNode: function () {
				var node = this.editingNode;
				if (!node['host']) {
					alert(utils.i18n('Please fill in the host'));
				} else if (!node['port']) {
					alert(utils.i18n('Please fill in the port'));
				} else if (!node['cwd']) {
					alert(utils.i18n('Please fill in the origin working directory'));
				} else {
					this.backupNode = null;
					this.editingNode = null;
				}
			},
			restoreNode: function () {
				if (this.backupNode) {
					utils.extend(this.editingNode, this.backupNode);
					this.backupNode = null;
				} else {
					this.project['deploy_nodes'].pop();
				}
				this.editingNode = null;
			},
			addScript: function () {
				if (!this.editingScript) {
					var script = {};
					this.editingScript = script;
					this.project['operation_scripts'].push(script);
				}
			},
			editScript: function (script) {
				this.editingScript = script;
				this.backupScript = utils.extend({}, script);
			},
			deleteScript: function (script) {
				if (confirm(utils.i18n('Are you sure?'))) {
					this.backupScript = null;
					this.editingScript = null;
					this.project['operation_scripts'].$remove(script);
				}
			},
			updateScript: function () {
				var script = this.editingScript;
				if (!script['name']) {
					alert(utils.i18n('Please fill in the name'));
				} else if (!script['command']) {
					alert(utils.i18n('Please fill in the script'));
				} else {
					this.backupScript = null;
					this.editingScript = null;
				}
			},
			restoreScript: function () {
				if (this.backupScript) {
					utils.extend(this.editingScript, this.backupScript);
					this.backupScript = null;
				} else {
					this.project['operation_scripts'].pop();
				}
				this.editingScript = null;
			},
			addManager: function () {
				var manager = this.addingManager;
				var managers = this.project['managers'];
				if (manager && managers.indexOf(manager) < 0) {
					managers.push(manager);
				}
				this.addingManager = null;
			},
			removeManager: function (username) {
				this.project['managers'].$remove(username);
			},
			submit: function () {
				var name = this.name;
				var project = this.project;
				var url = name ? API + '/' + name : API;
				var method = name ? 'put' : 'post';
				reqwest({
					url: url,
					method: method,
					data: JSON.stringify(project),
					success: function () {
						location.href = '/projects';
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			cleanWorkspace: function () {
				if (!confirm(utils.i18n('Are you sure?'))) {
					return;
				}
				var name = this.name;
				reqwest({
					url: API + '/' + name + '/clean',
					method: 'post',
					success: function () {
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			deleteProject: function () {
				if (!confirm(utils.i18n('Are you sure?'))) {
					return;
				}
				var name = this.name;
				reqwest({
					url: API + '/' + name,
					method: 'delete',
					success: function () {
						location.href = '/projects';
					},
					error: function (err) {
						console.log(err);
					}
				});
			},
			i18n: utils.i18n
		}
	});

	vm.init();

})();