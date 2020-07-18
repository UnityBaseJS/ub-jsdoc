<div class="row flex-xl-nowrap">
    <sidebar :navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <h3 class="page-breadcrumb">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item" v-for="breadcrumb in interface.breadcrumbs">
                        <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
                    </li>
                </ol>
            </nav>
        </h3>
        <div class="fromMD">
            <p v-html=interface.description></p>
        </div>
        <template v-if="funcs.length > 0">
            <h3 class="subsection-title" id="Methods">Methods</h3>
            <func
                    v-for="func in funcs"
                    :key="func.___id"
                    :func="func"
            ></func>
        </template>
    </main>
    <t-o-content
            :tableOfContent="tableOfContent"
    ></t-o-content>
</div>
