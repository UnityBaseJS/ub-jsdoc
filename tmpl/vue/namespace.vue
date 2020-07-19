<div class="row flex-xl-nowrap">
    <sidebar :navigation="navigation"></sidebar>
    <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content markdown-section" role="main">
        <h1 class="page-title">{{ namespace.name }}</h1>
        <div class="fromMD">
            <p v-html=namespace.readme></p>
            <p v-if="namespace.description" v-html="namespace.description"></p>
        </div>
        <template v-if="namespace.examples">
            <p class="arguments-title">Examples:</p>
            <example
                    v-for="example in namespace.examples"
                    :key="1"
                    :example="example"
            ></example>
        </template>

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

        <template v-if="types.length > 0">
            <h3 class="subsection-title" id="Types">Types</h3>
            <type
                    v-for="type in types"
                    v-bind:key="type.___id"
                    v-bind:type="type"
            ></type>
        </template>

        <template v-if="events.length > 0">
            <h3 class="subsection-title" id="events">Events</h3>
            <event
                    v-for="event in events"
                    v-bind:key="event.___id"
                    v-bind:event="event"
            ></event>
        </template>
    </main>
    <t-o-content
            v-bind:tableOfContent="tableOfContent"
    ></t-o-content>
</div>
