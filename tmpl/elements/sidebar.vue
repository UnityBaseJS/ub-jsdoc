<div class="col-12 col-md-3 col-xl-2 bd-sidebar collapse navbar-collapse" id="nav">
    <form class="bd-search align-items-center my-2">
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" id="search">
    </form>

    <div class="sidebar">
        <ul class="main-nav accordion" id="accordionExample">
            <li v-for="nav in navigation">
                <button class="btn"  type="button" data-toggle="collapse" :data-target="`#collapse${nav.name}`"
                        :aria-expanded="nav.isCurrent !== undefined?nav.isCurrent.toString():false"  :aria-controls="`collapse${nav.name}`">
                    <span>{{nav.name}}</span>
                </button>
                <div :id="`collapse${nav.name}`" class="collapse" :class="{show:nav.isCurrent}"
                     :aria-labelledby="`heading${nav.name}`"
                     data-parent="#accordionExample">
                    <template v-if="nav.submenu">
                        <ul class="sub-nav">
                            <li v-for="subnav in nav.submenu">
                                <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{subnav.name}}</a>
                            </li>
                        </ul>
                    </template>
                </div>
            </li>
        </ul>
    </div>
</div>