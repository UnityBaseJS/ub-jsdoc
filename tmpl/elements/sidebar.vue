<div class="col-12 col-md-3 col-xl-2 bd-sidebar collapse navbar-collapse" id="nav">
    <form class="bd-search align-items-center my-2">
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" id="search">
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