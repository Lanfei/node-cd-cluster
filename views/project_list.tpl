<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>CD Cluster</title>
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" href="/css/iconfont.css">
</head>
<body>
<%- include('sidebar') %>
<div id="header">
	<h2 id="title">PROJECTS</h2>
</div>
<div id="main">
	<div class="toolbar">
		<button @click="addProject">Add Project</button>
	</div>
	<h3 class="sub-title">Project List</h3>
	<div class="table-wrapper">
		<table>
			<thead>
			<tr>
				<th v-text="i18n('Name')"></th>
				<th v-text="i18n('Last Build')"></th>
				<th v-text="i18n('Last Duration')"></th>
				<th v-text="i18n('Status')"></th>
				<th v-text="i18n('Options')"></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="project in projects" track-by="$index">
				<td>
					<a :href="'/projects/' + project['name']" v-text="project['name']"></a>
				</td>
				<td v-text="project['last_build'] | datetime"></td>
				<td v-text="project['last_duration'] | duration"></td>
				<td>
					<a class="tag {{project['status'] | statusColor}}" v-text="project['status'] | statusStr"
					   :href="project['status'] ? '/projects/' + project['name'] + '/histories/' + project['history_length'] : null"></a>
				</td>
				<td>
					<a class="option" @click="buildProject(project, $index)" v-text="i18n('Build')"
					   v-if="project['status'] < STATUS_INITIAL || project['status'] > STATUS_DEPLOYING"></a>
					<a class="option" @click="abortProject(project, $index)" v-else>Abort</a>
					<a class="option" @click="editProject(project)" v-text="i18n('Configure')"></a>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>
<script src="/js/libs/vue.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/project_list.js"></script>
</body>
</html>