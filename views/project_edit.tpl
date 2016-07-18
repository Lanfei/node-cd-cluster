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
	<h2 id="title" v-text="i18n('Projects')"></h2>
</div>
<div id="main">
	<div class="toolbar">
		<button @click="back" v-text="i18n('Back')"></button>
	</div>
	<h3 class="sub-title" v-text="i18n(name ? 'Configure Project' : 'Add Project')"></h3>
	<form @submit.prevent="submit">
		<div class="table-wrapper">
			<table>
				<thead>
				<tr>
					<th v-text="i18n('Name')" width="20%"></th>
					<th align="left">
						<span v-text="project['name']" v-if="name"></span>
						<input type="text" required v-model="project['name']" v-if="!name">
					</th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td v-text="i18n('Repository Type')"></td>
					<td align="left">
						<label>
							<input type="radio" name="repo_type" value="none" v-model="project['repo_type']">
							<span v-text="i18n('None')"></span>
						</label>
						<label>
							<input type="radio" name="repo_type" value="git" v-model="project['repo_type']">
							<span v-text="i18n('Git')"></span>
						</label>
						<label>
							<input type="radio" name="repo_type" value="svn" v-model="project['repo_type']">
							<span v-text="i18n('Subversion')"></span>
						</label>
					</td>
				</tr>
				<tr v-if="project['repo_type'] !== 'none'">
					<td v-text="i18n('Repository URL')"></td>
					<td align="left"><input type="text" v-model="project['repo_url']"></td>
				</tr>
				<tr v-if="project['repo_type'] === 'git'">
					<td v-text="i18n('Branch to build')"></td>
					<td align="left"><input type="text" v-model="project['repo_branch']" placeholder="master"></td>
				</tr>
				<tr>
					<td v-text="i18n('Build Scripts')"></td>
					<td align="left"><textarea v-model="project['build_scripts']"></textarea></td>
				</tr>
				<tr>
					<td v-text="i18n('Test Scripts')"></td>
					<td align="left"><textarea v-model="project['test_scripts']"></textarea></td>
				</tr>
				<tr>
					<td v-text="i18n('Deploy Nodes')" :rowspan="project['deploy_nodes'].length + 1"></td>
					<td align="left">
						<a @click="addNode" :disabled="!!editingNode" v-text="i18n('New Node')"></a>
					</td>
				</tr>
				<tr v-for="node in project['deploy_nodes']">
					<td align="left">
						<template v-if="node !== editingNode">
							<span v-text="node['host'] + ':' + node['port']"></span>
							<a class="option" @click="editNode(node)" :disabled="!!editingNode">Edit</a>
							<a class="option" @click="deleteNode(node)" :disabled="!!editingNode">Delete</a>
						</template>
						<template v-else>
							<label>
								<span v-text="i18n('Host:')"></span><br>
								<input type="text" v-model="node['host']" @keydown.enter.prevent="updateNode"
									   required><br>
							</label>
							<label>
								<span v-text="i18n('Port:')"></span><br>
								<input type="number" v-model="node['port']" @keydown.enter.prevent="updateNode"
									   required><br>
							</label>
							<label>
								<span v-text="i18n('Origin Working Directory:')"></span><br>
								<input type="text" v-model="node['cwd']" @keydown.enter.prevent="updateNode"
									   required><br>
							</label>
							<label>
								<span v-text="i18n('Token:')"></span><br>
								<input type="text" v-model="node['token']" @keydown.enter.prevent="updateNode"><br>
							</label>
							<button type="button" class="color-info" @click="updateNode">Apply</button>
							<button type="button" @click="restoreNode">Cancel</button>
						</template>
					</td>
				</tr>
				<tr>
					<td v-text="i18n('Ignores')"></td>
					<td align="left"><textarea v-model="project['ignores']"
											   placeholder="Files or directories, globs are supported."></textarea></td>
				</tr>
				<tr>
					<td v-text="i18n('Pre-Deploy Scripts')"></td>
					<td align="left"><textarea v-model="project['pre_deploy_scripts']"></textarea></td>
				</tr>
				<tr>
					<td v-text="i18n('Post-Deploy Scripts')"></td>
					<td align="left"><textarea v-model="project['post_deploy_scripts']"></textarea></td>
				</tr>
				<tr>
					<td v-text="i18n('Operation Scripts')" :rowspan="project['operation_scripts'].length + 1"></td>
					<td align="left">
						<a @click="addScript" :disabled="!!editingScript" v-text="i18n('New Script')"></a>
					</td>
				</tr>
				<tr v-for="item in project['operation_scripts']">
					<td align="left">
						<template v-if="editingScript !== item">
							<span v-text="item['name']"></span>
							<a class="option" @click="editScript(item)" :disabled="!!editingScript">Edit</a>
							<a class="option" @click="deleteScript(item)" :disabled="!!editingScript">Delete</a>
						</template>
						<template v-else>
							<label>
								<span v-text="i18n('Name:')"></span><br>
								<input type="text" v-model="item['name']" @keydown.enter.prevent="updateScript"><br>
							</label>
							<label>
								<span v-text="i18n('Command:')"></span><br>
								<textarea v-model="item['command']"></textarea><br>
							</label>
							<button type="button" class="color-info" @click="updateScript">Apply</button>
							<button type="button" @click="restoreScript">Cancel</button>
						</template>
					</td>
				</tr>
				<tr>
					<td v-text="i18n('Managers')" :rowspan="project['managers'].length + 1"></td>
					<td align="left">
						<select v-model="addingManager">
							<option :value="null" v-text="i18n('Please Select A User')"></option>
							<option :value="user['username']" v-text="user['username']" v-for="user in users"
									v-if="project['managers'].indexOf(user['username']) < 0"></option>
						</select>
						<a class="option" @click="addManager" :disabled="!addingManager"
						   v-text="i18n('Add Manager')"></a>
					</td>
				</tr>
				<tr v-for="username in project['managers']">
					<td align="left">
						<span v-text="username"></span>
						<a class="option" @click="removeManager(username)" v-text="i18n('Remove')"></a>
					</td>
				</tr>
				<tr>
					<td v-text="i18n('History Size')"></td>
					<td align="left">
						<input type="number" v-model="project['history_size']">
					</td>
				</tr>
				<tr v-if="name">
					<td v-text="i18n('Options')"></td>
					<td align="left">
						<button type="button" v-text="i18n('Clean Workspace')" @click="cleanWorkspace"></button>
						<button type="button" class="color-danger" v-text="i18n('Delete')"
								@click="deleteProject"></button>
					</td>
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
<script src="/js/project_edit.js"></script>
</body>
</html>