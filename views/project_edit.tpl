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
		<button @click="back">Back</button>
	</div>
	<h3 class="sub-title">Add Project</h3>
	<form @submit="handleSubmit">
		<div class="table-wrapper">
			<table>
				<thead>
				<tr>
					<th v-text="i18n('Name')" width="20%"></th>
					<th align="left"><input type="text" required v-model="project['name']"></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td v-text="i18n('Repository Type')"></td>
					<td align="left">
						<label>
							<input type="radio" name="repo_type" value="none" v-model="project['repo_type']">
							None
						</label>
						<label>
							<input type="radio" name="repo_type" value="git" v-model="project['repo_type']"> Git
						</label>
						<label>
							<input type="radio" name="repo_type" value="svn" v-model="project['repo_type']">
							Subversion
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
								<div v-text="i18n('Host:')"></div>
								<input type="text" v-model="node['host']" required>
							</label>
							<label>
								<div v-text="i18n('Port:')"></div>
								<input type="number" v-model="node['port']" required>
							</label>
							<label>
								<div v-text="i18n('Origin Working Directory:')"></div>
								<input type="text" v-model="node['cwd']" required>
							</label>
							<label>
								<div v-text="i18n('Token:')"></div>
								<input type="text" v-model="node['token']">
							</label>
							<button type="button" class="color-info" @click="updateNode">Apply</button>
							<button type="button" @click="restoreNode">Cancel</button>
						</template>
					</td>
				</tr>
				<tr>
					<td v-text="i18n('Ignored Files/Paths')"></td>
					<td align="left"><textarea v-model="project['ignores']"></textarea></td>
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
								<div v-text="i18n('Name:')"></div>
								<input type="text" v-model="item['name']">
							</label>
							<label>
								<div v-text="i18n('Command:')"></div>
								<textarea v-model="item['command']"></textarea>
							</label>
							<button type="button" class="color-info" @click="updateScript">Apply</button>
							<button type="button" @click="restoreScript">Cancel</button>
						</template>
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
						<button type="submit" v-text="i18n('Cancel')" @click="back"></button>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</form>
</div>
<script src="/js/libs/vue.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/project_edit.js"></script>
</body>
</html>