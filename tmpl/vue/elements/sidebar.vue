<aside id="nav">
    <div class="sticky">
      <a href="index.html" class="navbar-brand">TOC</a>
      <search v-if="withSearch!==false"></search>
      <nav class="navbar navbar-vertical navbar-expand-lg navbar-light">
        <div class="collapse navbar-collapse">
          <ul class="nav flex-column nav-vertical-2">
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
      </nav>
    </div>

<!--    </div>-->
<!--    <div class="sidebar">-->
<!--      <ul class="main-nav">-->
<!--        <li v-for="nav in navigation">-->
<!--          <a v-if="nav.submenu.length === 1" :href="nav.submenu[0].link"><span>{{nav.name}}</span></a>-->
<!--          <template v-else>-->
<!--            <span>{{nav.name}}</span>-->
<!--            <template v-if="nav.submenu">-->
<!--              <ul class="sub-nav">-->
<!--                <li v-for="subnav in nav.submenu">-->
<!--                  <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{subnav.name}}</a>-->
<!--                </li>-->
<!--              </ul>-->
<!--            </template>-->
<!--          </template>-->
<!--        </li>-->
<!--      </ul>-->
<!--    </div>-->
</aside>
