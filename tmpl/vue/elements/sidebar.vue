<aside class="col-md-3 col-xl-2 bd-sidebar">
<form v-if="withSearch!==false" autocomplete="off" role="search" class="bd-search d-flex align-items-center">
    <span
        class="fts-autocomplete"
        style="position: relative; display: inline-block; direction: ltr;">
      <input type="search" class="form-control ds-input" id="search"
             placeholder="Search..." aria-label="Search for..."
             autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false"
             aria-owns="algolia-autocomplete-listbox-0"
             style="position: relative; vertical-align: top;" dir="auto"/>
      <div class="dropdown">
        <div class="dropdown-menu" id="search-result"></div>
      </div>
    </span>
  <button class="btn bd-search-docs-toggle d-md-none p-0 ml-3"
          type="button" data-toggle="collapse"
          data-target="#collapsedSidebar"
          aria-controls="collapsedSidebar" aria-expanded="false" aria-label="Toggle navigation">
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" role="img" focusable="false">
      <title>Menu</title>
      <path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"
            d="M4 7h22M4 15h22M4 23h22"></path>
    </svg>
  </button>
</form>
<div id="collapsedSidebar" class="collapse d-md-block row">
  <nav class="bd-links" aria-label="Main navigation">
    <div v-for="nav in navigation"
         class="active bd-toc-item"
    >
      <!--        :class="{active: nav.submenu.findIndex(i=>i.isCurrent)!==-1}" to allow collapsing-->
      <a class="bd-toc-link" :href="nav.submenu.length === 1 ? nav.submenu[0].link : '#'">{{ nav.name }}</a>
      <ul v-if="nav.submenu.length>1" class="nav bd-sidenav">
        <li v-for="subnav in nav.submenu" :class="{ active: subnav.isCurrent }">
          <a :href="subnav.link">{{ subnav.name }}</a>
        </li>
      </ul>
    </div>
  </nav>
</div>
</aside>
