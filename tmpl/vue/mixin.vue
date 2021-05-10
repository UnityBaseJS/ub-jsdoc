<main>
<h1 class="page-title">{{ mixin.name }}</h1>
<p v-html=mixin.description></p>
<template v-if="funcs.length > 0">
  <h3 class="ud-member__group" id="Methods">Methods</h3>
  <func
      v-for="func in funcs"
      v-bind:key="func.___id"
      v-bind:func="func"
  ></func>
</template>
</main>
