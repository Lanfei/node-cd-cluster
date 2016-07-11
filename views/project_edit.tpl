<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>CD Cluster</title>
	<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<%- include('header') %>
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
						<a @click="addNode" :disabled="!!editingNode">New Node</a>
					</td>
				</tr>
				<tr v-for="node in project['deploy_nodes']">
					<td align="left">
						<div v-show="node !== editingNode">
							<span v-text="node['host'] + ':' + node['port']"></span>
							<a class="option" @click="editNode(node)" :disabled="!!editingNode">Edit</a>
							<a class="option" @click="deleteNode(node)" :disabled="!!editingNode">Delete</a>
						</div>
						<div v-show="node === editingNode">
							<label>
								Host:<br>
								<input type="text" v-model="node['host']" required>
							</label>
							<label>
								Port:<br>
								<input type="number" v-model="node['port']" required>
							</label>
							<label>
								Origin Working Directory:<br>
								<input type="text" v-model="node['cwd']" required>
							</label>
							<button type="button" class="color-info" @click="updateNode">Apply</button>
							<button type="button" @click="restoreNode">Cancel</button>
						</div>
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
					<td v-text="i18n('Options')"></td>
					<td align="left">
						<button type="button" v-text="i18n('Clean Workspace')" v-if="name"
								@click="cleanWorkspace"></button>
						<button type="button" class="color-danger" v-text="i18n('Delete')" v-if="name"
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