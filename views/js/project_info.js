(function () {
	var API = '/api/projects';

	var vm = new Vue({
		el: '#main',
		data: {
			project: {},
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
			i18n: utils.i18n
		}
	});

	vm.init();

})();