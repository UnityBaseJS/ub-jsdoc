<div :id="func.name" class="item border-bottom">
<h5 class="alert alert-primary">
  <span :class="{ deprecated: !!func.deprecated }"><a :href="func.codeLink">{{ func.name }}</a></span>(<func-signature :func="func"></func-signature>)
  <template v-if="func.returns">→
    <template v-for="ret in (func.returns[0].type ? func.returns[0].type.slice(0, -1) : [])"><span
        v-html="ret"></span><span> | </span></template>
    <span v-html="(func.returns[0].type && func.returns[0].type.slice(-1)[0]) || '[wrong jsdoc]'"></span></template>
  <span v-if="func.scope" class="badge small-badge badge-light">{{ func.scope }}</span><span v-if="func.deprecated"
                                                                                             class="badge small-badge badge-danger">deprecated</span>
  <anchor :id="func.name"></anchor>
</h5>
<div v-if="func.deprecated" class="fromMD">
  <p v-html="func.deprecated"></p>
</div>
<div>
  <div class="fromMD">
    <p v-html="func.description"></p>
  </div>
  <template v-if="func.returns && func.returns[0].description">
    <p></p>
    <p class="arguments-title">Return:</p>
    <template v-html="func.returns[0].description"></template>
  </template>
  <func-params :func="func"></func-params>
  <template v-if="func.examples">
    <p class="arguments-title">Examples:</p>
    <example
        v-for="example in func.examples"
        :key="1"
        :example="example"
    ></example>
  </template>
</div>
</div>
