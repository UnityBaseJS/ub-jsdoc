<main>
  <h1 class="page-title">{{ namespace.name }}</h1>
  <div class="fromMD">
      <p v-html=namespace.readme></p>
      <p v-if="namespace.description" v-html="namespace.description"></p>
  </div>
  <template v-if="namespace.examples">
      <example
              v-for="example in namespace.examples"
              :key="1"
              :example="example"
      ></example>
  </template>

  <template v-if="members.length > 0">
      <h3 class="ud-member__group" id="Members">Members</h3>
      <member
              v-for="member in members"
              v-bind:key="member.___id"
              v-bind:member="member"
      ></member>
  </template>

  <template v-if="funcs.length > 0">
      <h3 class="ud-member__group" id="Methods">Methods</h3>
      <func
              v-for="func in funcs"
              v-bind:key="func.___id"
              v-bind:func="func"
      ></func>
  </template>

  <template v-if="types.length > 0">
      <h3 class="ud-member__group" id="Types">Types</h3>
      <type
              v-for="type in types"
              v-bind:key="type.___id"
              v-bind:type="type"
      ></type>
  </template>

  <template v-if="events.length > 0">
      <h3 class="ud-member__group" id="events">Events</h3>
      <event
              v-for="event in events"
              v-bind:key="event.___id"
              v-bind:event="event"
      ></event>
  </template>
</main>
