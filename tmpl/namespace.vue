<div class="row flex-xl-nowrap">
    <sidebar v-bind:navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content" role="main">
        <h3>{{ namespace.name }}</h3>
        <p v-html=namespace.readme></p>
        <p v-if="namespace.description" v-html="namespace.description"></p>
        <template v-if="namespace.examples">
            <p>Examples</p>
            <ul>
                <li v-for="example in namespace.examples">
                    <code>
                        <pre>{{example}}</pre>
                    </code>
                </li>
            </ul>
        </template>

        <h4>Members</h4>
        <member
                v-for="member in members"
                v-bind:key="member.___id"
                v-bind:member="member"
        ></member>
        <h4>Methods</h4>
        <func
                v-for="func in funcs"
                v-bind:key="func.___id"
                v-bind:func="func"
        ></func>
        <h4>Types</h4>
        <type
                v-for="type in types"
                v-bind:key="type.___id"
                v-bind:type="type"
        ></type>
        <h4>Events</h4>
        <event
                v-for="event in events"
                v-bind:key="event.___id"
                v-bind:event="event"
        ></event>
    </main>
    <t-o-content
            v-bind:tableOfContent="tableOfContent"
    ></t-o-content>
</div>