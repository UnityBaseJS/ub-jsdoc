<div class="row flex-xl-nowrap">
    <sidebar v-bind:navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item" v-for="breadcrumb in clazz.breadcrumbs">
                    <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
                </li>
            </ol>
        </nav>
        <h1 class="page-title">{{ clazz.name }}</h1>
        <div class="fromMD">
            <p v-html=clazz.classdesc></p>
        </div>
        <template v-if="members.length > 0">
            <h3 class="subsection-title" id="Members">Members</h3>
            <member
                    v-for="member in members"
                    v-bind:key="member.___id"
                    v-bind:member="member"
            ></member>
        </template>
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