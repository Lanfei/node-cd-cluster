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
	<h2 id="title" v-text="i18n('Histories')"></h2>
</div>
<div id="main">
	<h3 class="sub-title" v-text="i18n('History List')"></h3>
	<div class="table-wrapper">
		<table>
			<thead>
			<tr>
				<th v-text="i18n('Build ID')"></th>
				<th v-text="i18n('Project Name')"></th>
				<th v-text="i18n('Start Time')"></th>
				<th v-text="i18n('Duration')"></th>
				<th v-text="i18n('Status')"></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="history in histories | orderBy 'start_time' -1" track-by="$index">
				<td>
					<a :href="'/projects/' + history['project'] + '/histories/' + history['id']"
					   v-text="'#' + history['id']"></a>
				</td>
				<td>
					<a :href="'/projects/' + history['project']" v-text="history['project']"></a>
				</td>
				<td v-text="history['start_time'] | datetime"></td>
				<td v-text="history['duration'] | duration"></td>
				<td>
					<a class="tag {{history['status'] | statusColor}}" v-text="history['status'] | statusStr"
					   :href="'/projects/' + history['project'] + '/histories/' + history['id']"></a>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>
<script src="/js/libs/vue.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/history_list.js"></script>
</body>
</html>