<div class="row flex-xl-nowrap">
    <sidebar :navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <h1 class="page-title">{{ mixin.name }}</h1>
        <div class="fromMD">
            <p v-html=mixin.description></p>
        </div>
        <template v-if="funcs.length > 0">
            <h3 class="subsection-title" id="Methods">Methods</h3>
            <func
                    v-for="func in funcs"
                    v-bind:key="func.___id"
                    v-bind:func="func"
            ></func>
        </template>
    </main>
    <t-o-content
            v-bind:tableOfContent="tableOfContent"
    ></t-o-content>
</div>
