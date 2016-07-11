(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: '#main',
		data: {
			name: '',
			project: {
				repo_type: 'none',
				deploy_nodes: []
			},
			backupNode: null,
			editingNode: null
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
						data['deploy_nodes'] = data['deploy_nodes'] || [];
						self.project = data;
					});
				}
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
			handleSubmit: function (e) {
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
				e.preventDefault();
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