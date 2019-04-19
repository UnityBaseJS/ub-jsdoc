<div class="row flex-xl-nowrap">
    <sidebar :navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <h3 class="page-breadcrumb">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item" v-for="breadcrumb in clazz.breadcrumbs">
                        <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
                    </li>
                </ol>
            </nav>
        </h3>
        <div class="item border-bottom" :id="clazz.name">
            <!--all in one line to prevent creating redundant spaces during vue render-->
            <h5 class="alert alert-primary">
                new {{clazz.name}}(<template v-if="clazz.paramsForMethods && clazz.paramsForMethods.length > 0"><template v-for="param in clazz.paramsForMethods.slice(0, -1)">{{param.name}}<span v-if="param.optional" class="badge badge-pill badge-light">opt</span><span v-if="param.type && param.type.length > 0">: <span v-html="param.type[0]"></span></span><span>, </span></template>{{clazz.paramsForMethods.slice(-1)[0].name}}<span v-if="clazz.paramsForMethods.slice(-1)[0].optional"  class="badge badge-pill badge-light">opt</span><span v-if="clazz.paramsForMethods.slice(-1)[0].type && clazz.paramsForMethods.slice(-1)[0].type.length > 0">: <span v-html="clazz.paramsForMethods.slice(-1)[0].type[0]"></span></span></template>)<span class="anchor" :data-id="clazz.name">#</span>
            </h5>
            <div v-if="clazz.mixes && clazz.mixes.length > 0">
                Mixes In:
                <ul>
                    <li v-for="mixin in clazz.mixes">
                        <a :href="mixin.link">{{mixin.text}}</a>
                    </li>
                </ul>
            </div>
            <p></p>
            <div class="fromMD">
                <p v-html=clazz.classdesc></p>
            </div>
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
