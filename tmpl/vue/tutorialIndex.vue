<div class="row flex-xl-nowrap">
<sidebar :navigation="navigation"></sidebar>
<article class="col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
  <div class="row justify-content-center doc-content-body">
    <main  class="col-md-9 col-xxl-8 markdown-section">
      <h1>Articles</h1>
      <ul class="main-nav">
        <li v-for="nav in navigation">
          <a :href="nav.link">{{ nav.name }}</a>
          <template v-if="nav.submenu.length">
            <ul class="sub-nav">
              <li v-for="subnav in nav.submenu">
                <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{ subnav.name }}</a>
              </li>
            </ul>
          </template>
        </li>
      </ul>
    </main>
  </div>
</article>
</div>
