<div class="row flex-xl-nowrap">
    <main-sidebar :navigation="navigation"></main-sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <p v-html=readme></p>
    </main>
    <t-o-content
            :contents="contents"
    ></t-o-content>
</div>
