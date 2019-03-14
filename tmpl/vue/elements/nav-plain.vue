<div class="sidebar">
    <ul class="main-nav">
        <li v-for="nav in navigation">
            <a v-if="nav.submenu.length === 1" :href="nav.submenu[0].link"><span>{{nav.name}}</span></a>
            <template v-else>
                <span>{{nav.name}}</span>
                <template v-if="nav.submenu">
                    <ul class="sub-nav">
                        <li v-for="subnav in nav.submenu">
                            <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{subnav.name}}</a>
                        </li>
                    </ul>
                </template>
            </template>
        </li>
    </ul>
</div>
