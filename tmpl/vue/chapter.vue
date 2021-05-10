<div class="row flex-xl-nowrap">

<sidebar :navigation="navigation"></sidebar>
<t-o-content class="d-none d-xl-block col-xl-2 bd-toc" :tableOfContent="tableOfContent"></t-o-content>

<article class="col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
  <div class="row justify-content-center doc-content-body">
    <component class="col-md-9 col-xxl-8 markdown-section" :is="cmpClass" v-bind="allData"></component>
  </div>
</article>

</div>
