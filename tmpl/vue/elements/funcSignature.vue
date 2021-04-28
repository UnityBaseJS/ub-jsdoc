<span>
<template v-if="func.paramsForMethods && func.paramsForMethods.length > 0">
  <template v-for="param in func.paramsForMethods.slice(0, -1)">
    {{ param.name }}<span v-if="param.optional" class="badge small-badge badge-light">opt</span>
    <span v-if="param.type && param.type.length > 0">:&nbsp;
      <span v-for="(pt, idx) in param.type">
        <template v-html="pt"></template>
        <template v-if="idx<param.type.length-1">&nbsp;|&nbsp;</template>
      </span>
    </span>
    <span>, </span>
  </template>
  {{ func.paramsForMethods.slice(-1)[0].name }}
  <span v-if="func.paramsForMethods.slice(-1)[0].optional" class="badge small-badge badge-light">opt</span>
  <span v-if="func.paramsForMethods.slice(-1)[0].type && func.paramsForMethods.slice(-1)[0].type.length > 0">:&nbsp;
    <span v-html="func.paramsForMethods.slice(-1)[0].type[0]"></span>
  </span>
</template>
</span>