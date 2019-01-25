<div class="row flex-xl-nowrap">
    <sidebar v-bind:navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <h2 class="page-title">{{ module.name }}</h2>
        <p v-html=module.readme></p>
        <p v-if="module.description" v-html="module.description"></p>
        <template v-if="module.examples">
            <p class="subsection-title" id="examples">Examples</p>
            <ul>
                <li v-for="example in module.examples">
                    <code>
                        <pre>{{example}}</pre>
                    </code>
                </li>
            </ul>
        </template>

        <template v-if="subclasses.length > 0">
            <h4 class="subsection-title" id="classes">Classes</h4>
            <ul class="subclasses">
                <li v-for="clazz in subclasses">
                    <a :href="clazz.link">{{ clazz.name }}</a>
                </li>
            </ul>
        </template>

        <template v-if="submodules.length > 0">
            <h4 class="subsection-title" id="submodules">Submodules</h4>
            <ul class="submodules">
                <li v-for="submodule in submodules">
                    <a :href="submodule.link">{{ submodule.name }}</a>
                </li>
            </ul>
        </template>

        <template v-if="members.length > 0">
            <h4 class="subsection-title" id="members">Members</h4>
            <member
                    v-for="member in members"
                    v-bind:key="member.___id"
                    v-bind:member="member"
            ></member>
        </template>

        <template v-if="funcs.length > 0">
            <h4 class="subsection-title" id="methods">Methods</h4>
            <func
                    v-for="func in funcs"
                    v-bind:key="func.___id"
                    v-bind:func="func"
            ></func>
        </template>

        <template v-if="types.length > 0">
            <h4 class="subsection-title" id="types">Types</h4>
            <type
                    v-for="type in types"
                    v-bind:key="type.___id"
                    v-bind:type="type"
            ></type>
        </template>

    </main>
    <t-o-content
            v-bind:tableOfContent="tableOfContent"
    ></t-o-content>
</div>