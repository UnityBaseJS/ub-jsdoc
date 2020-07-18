<div class="row flex-xl-nowrap">
    <sidebar :navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <div v-html="html"></div>
    </main>
    <t-o-content
            :tableOfContent="tableOfContent"
    ></t-o-content>
</div>
