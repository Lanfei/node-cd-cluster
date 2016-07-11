<div id="nav">
	<h1 id="logo">CD Cluster</h1>
	<ul class="menus">
		<li class="item" :class="{'item-cur': menu['name'] === curPage}" v-for="menu in menus">
			<a class="link" :href="menu['link']" v-text="i18n(menu['label'])"></a>
		</li>
	</ul>
</div>
<div id="header">
	<h2 id="title">PROJECTS</h2>
</div>