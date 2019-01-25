<div class="col-12 col-md-3 col-xl-2 bd-sidebar">
    <form class="bd-search d-flex align-items-center">
    </form>
    <div class="nav">
        <ul class="main-nav">
            <li v-for="nav in navigation">
                <a :href="nav.link">{{nav.name}}</a>
                <template v-if="nav.submenu">
                    <ul class="sub-nav">
                        <li v-for="subnav in nav.submenu">
                            <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{subnav.name}}</a>
                        </li>
                    </ul>
                </template>
            </li>
        </ul>
    </div>
</div>