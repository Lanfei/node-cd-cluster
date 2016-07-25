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
<div id="toast-wrapper"><label id="toast"></label></div>
<div id="header">
	<h2 id="title" v-text="i18n('Profile')"></h2>
</div>
<div id="main">
	<h3 class="sub-title" v-text="i18n('My Profile')"></h3>
	<form @submit.prevent="submit">
		<div class="table-wrapper">
			<table>
				<thead>
				<tr>
					<th v-text="i18n('Username')" width="20%"></th>
					<th align="left" id="username"><%= me['username'] %></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td v-text="i18n('Password')"></td>
					<td align="left"><input type="password" v-model="user['password']" placeholder="********"></td>
				</tr>
				<tr>
					<td v-text="i18n('Email')"></td>
					<td align="left"><input type="email" v-model="user['email']"></td>
				</tr>
				<tr>
					<td v-text="i18n('Tel')"></td>
					<td align="left"><input type="tel" v-model="user['tel']"></td>
				</tr>
				<tr>
					<td colspan="2">
						<button type="submit" class="color-primary" v-text="i18n('Submit')"></button>
						<button type="button" v-text="i18n('Cancel')" @click="back"></button>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</form>
</div>
<script src="/js/libs/vue.min.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/profile.js"></script>
</body>
</html>