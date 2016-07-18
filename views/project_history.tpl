<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>CD Cluster</title>
	<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<%- include('sidebar') %>
<div id="header">
	<h2 id="title" v-text="i18n('Projects')"></h2>
</div>
<div id="main">
	<div class="toolbar">
		<button @click="back" v-text="i18n('Back')"></button>
	</div>
	<h3 class="sub-title" v-text="'History #' + id"></h3>
	<div class="table-wrapper">
		<table>
			<thead>
			<tr>
				<th v-text="i18n('Name')" width="20%"></th>
				<th v-text="name" align="left"></th>
			</tr>
			</thead>
			<tbody>
			<tr>
				<td v-text="i18n('Status')"></td>
				<td align="left">
					<span class="tag {{history['status'] | statusColor}}" v-text="history['status'] | statusStr"></span>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Start Time')"></td>
				<td v-text="history['start_time'] | datetime" align="left"></td>
			</tr>
			<tr v-if="history['duration']">
				<td v-text="i18n('Duration')"></td>
				<td v-text="history['duration'] | duration" align="left"></td>
			</tr>
			<tr v-if="history['build_url']">
				<td v-text="i18n('Build Pack')"></td>
				<td align="left">
					<a :href="history['build_url']" v-text="i18n('Download')"></a>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Checkout Result')"></td>
				<td align="left">
					<pre v-html="history['checkout_result']"></pre>
					<i class="loading"
					   v-if="history['status'] === STATUS_UPDATING"></i>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Build Result')"></td>
				<td align="left">
					<pre v-html="history['build_result']"></pre>
					<i class="loading"
					   v-if="history['status'] === STATUS_BUILDING"></i>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Test Result')"></td>
				<td align="left">
					<pre v-html="history['test_result']"></pre>
					<i class="loading"
					   v-if="history['status'] === STATUS_TESTING"></i>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Pack Result')"></td>
				<td align="left">
					<pre v-html="history['pack_result']"></pre>
					<i class="loading"
					   v-if="history['status'] === STATUS_PACKING"></i>
				</td>
			</tr>
			<tr>
				<td v-text="i18n('Deploy Result')"></td>
				<td align="left">
					<pre v-html="history['deploy_result']"></pre>
					<i class="loading"
					   v-if="history['status'] === STATUS_DEPLOYING"></i>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>
<script src="/js/libs/vue.min.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/project_history.js"></script>
</body>
</html>