<div class="row flex-xl-nowrap">
    <sidebar v-bind:navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <p v-html=readme></p>
    </main>
    <t-o-content
            v-bind:contents="contents"
    ></t-o-content>
</div>