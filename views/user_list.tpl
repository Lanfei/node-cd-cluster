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
	<h2 id="title" v-text="i18n('Users')"></h2>
</div>
<div id="main">
	<h3 class="sub-title" v-text="i18n('User List')"></h3>
	<div class="table-wrapper">
		<table>
			<thead>
			<tr>
				<th v-text="i18n('Name')"></th>
				<th v-text="i18n('Email')"></th>
				<th v-text="i18n('Tel')"></th>
				<th v-text="i18n('Role')"></th>
				<th v-text="i18n('Status')"></th>
				<% if (me['is_admin']) { %>
				<th v-text="i18n('Options')"></th>
				<% } %>
			</tr>
			</thead>
			<tbody>
			<tr v-for="user in users" track-by="$index">
				<td v-text="user['username']"></td>
				<td v-text="user['email']"></td>
				<td v-text="user['tel']"></td>
				<td>
					<span class="tag color-primary" v-if="user['is_admin']" v-text="i18n('Admin')"></span>
					<span class="tag" v-else v-text="i18n('Normal')"></span>
				</td>
				<td>
					<span class="tag color-success" v-if="user['enabled']" v-text="i18n('Enabled')"></span>
					<span class="tag color-warning" v-else v-text="i18n('Disabled')"></span>
				</td>
				<% if (me['is_admin']) { %>
				<td>
					<a class="option" :href="'/users/' + user['username'] + '/edit'" v-text="i18n('Edit')"></a>
					<a class="option" @click="deleteUser(user)" v-text="i18n('Delete')"></a>
				</td>
				<% } %>
			</tr>
			</tbody>
		</table>
	</div>
</div>
<script src="/js/libs/vue.min.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/user_list.js"></script>
</body>
</html>