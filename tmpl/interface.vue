<div class="row flex-xl-nowrap">
    <sidebar v-bind:navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <h3>{{ interface.name }}</h3>
        <p v-html=interface.description></p>
        <h4>Methods</h4>
        <func
                v-for="func in funcs"
                v-bind:key="func.___id"
                v-bind:func="func"
        ></func>
    </main>
    <t-o-content
            v-bind:tableOfContent="tableOfContent"
    ></t-o-content>
</div>