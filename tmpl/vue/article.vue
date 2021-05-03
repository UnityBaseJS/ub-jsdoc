<div class="row justify-content-between">
  <!--navigation-->
  <sidebar class="col-lg-3 col-xxl-2 p-3 navbar-collapse" :navigation="navigation"></sidebar>
  <!--/navigation-->
  <!--content-->
  <article class="col-lg-9 col-xxl-10 doc-content bd-content markdown-section" role="main">
    <div class="row justify-content-between doc-content-body">
      <component class="col-md-9 col-xxl-8" :is="cmpClass" v-bind="allData"></component>
      <t-o-content class="col-md-3 col-xxl-3 d-none d-md-block" :tableOfContent="tableOfContent"></t-o-content>
    </div>
  </article>
  <!--/content-->
</div>