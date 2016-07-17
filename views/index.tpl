<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>CD Cluster</title>
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" href="//at.alicdn.com/t/font_1468750585_682355.css">
</head>
<body>
<%- include('sidebar') %>
<div id="header">
	<h2 id="title">PROJECTS</h2>
</div>
<div id="main">
	<div class="toolbar">
		<button>Add Project</button>
	</div>
	<h3 class="sub-title">Project List</h3>
	<div class="table-wrapper">
		<table>
			<thead>
			<tr>
				<th>Name</th>
				<th>Last Build</th>
				<th>Last Duration</th>
				<th>Last Status</th>
				<th>Options</th>
			</tr>
			</thead>
			<tbody>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag">Initial</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag color-success">Success</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag color-primary">Building</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag color-info">Info</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag color-warning">Warning</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td><label class="tag color-danger">Danger</label></td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			<tr>
				<td>Bibu</td>
				<td>4 min 37 sec</td>
				<td>N/A</td>
				<td>
					<div class="progress">
						<div class="progress-bar color-info"></div>
					</div>
				</td>
				<td>
					<a class="option">Build</a>
					<a class="option">Configure</a>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
	<h3 id="sub-title">Add Project</h3>
	<form action="">
		<div class="table-wrapper">
			<table>
				<thead>
				<tr>
					<th>Name</th>
					<th><input type="text"></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td>Repository Type</td>
					<td>
						<label><input type="radio" checked> None</label>
						<label><input type="radio"> Git</label>
					</td>
				</tr>
				<tr>
					<td>Repository URL</td>
					<td><input type="url"></td>
				</tr>
				<tr>
					<td>Test Script</td>
					<td><textarea></textarea></td>
				</tr>
				<tr>
					<td>Build Script</td>
					<td><textarea></textarea></td>
				</tr>
				</tbody>
			</table>
		</div>
	</form>
</div>
<script src="/js/libs/vue.js"></script>
<script src="/js/libs/reqwest.min.js"></script>
<script src="/js/common.js"></script>
<script src="/js/index.js"></script>
</body>
</html>