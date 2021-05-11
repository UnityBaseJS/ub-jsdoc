<div class="row flex-xl-nowrap">
<sidebar :navigation="navigation" :with-search="false"></sidebar>
<article class="col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
  <div class="row justify-content-center doc-content-body">
    <main class="col-md-9 col-xxl-8 markdown-section" v-html="readme"></main>
  </div>
</article>
</div>
