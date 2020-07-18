<div class="row flex-xl-nowrap">
    <tutor-sidebar :navigation="navigation"></tutor-sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <h1>Tutorials</h1>
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
    </main>
    <!--<t-o-content-->
            <!--v-bind:contents="contents"-->
    <!--&gt;</t-o-content>-->
</div>
