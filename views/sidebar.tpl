<div id="nav">
	<h1 id="logo"><a class="text" href="/">CD Cluster</a></h1>
	<ul class="menus">
		<li class="item" :class="{'item-cur': menu['name'] === curPage}" v-for="menu in menus">
			<a class="link" :href="menu['link']">
				<i class="iconfont icon-{{menu['icon']}}"></i>
				<span class="text" v-text="i18n(menu['label'])"></span>
			</a>
		</li>
	</ul>
</div>