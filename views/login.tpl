<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>CD Cluster</title>
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" href="/css/iconfont.css">
</head>
<body>
<div id="toast-wrapper"><label id="toast"></label></div>
<div id="auth">
	<h1 class="title">CD Cluster</h1>
	<form class="table-wrapper" @submit.prevent="submit">
		<table>
			<thead>
			<tr>
				<th><h2 class="sub-title" v-text="i18n('Log In')"></h2></th>
			</tr>
			</thead>
			<tbody>
			<tr>
				<td>
					<label>
						<input type="text" :placeholder="i18n('Username')" v-model="user['username']" pattern="^\w+$" required>
					</label>
					<label>
						<input type="password" :placeholder="i18n('Password')" v-model="user['password']" required>
					</label>
					<button class="color-primary" v-text="i18n('Login')"></button>
					<button type="button" v-text="i18n('Sign Up') + ' ➤'" @click="signup"></button>
				</td>
			</tr>
			</tbody>
		</table>
	</form>
</div>
<script src="/js/libs/vue.min.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/login.js"></script>
</body>
</html>