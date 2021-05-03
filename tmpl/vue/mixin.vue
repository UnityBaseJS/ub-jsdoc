<main>
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