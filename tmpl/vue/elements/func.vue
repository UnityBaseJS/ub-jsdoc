<section :id="func.name" class="item">
  <h4 class="ud-member__signature">
    <anchor :member="func.name"></anchor>
    <a :href="func.codeLink" :class="{ deprecated: !!func.deprecated }">{{ func.name }}</a>
    (<func-signature :func="func"></func-signature>)
    <template v-if="func.returns">→
      <template v-for="ret in (func.returns[0].type ? func.returns[0].type.slice(0, -1) : [])"><span
          v-html="ret"></span><span> | </span></template>
      <span v-html="(func.returns[0].type && func.returns[0].type.slice(-1)[0]) || '[wrong jsdoc]'"></span></template>
    <span v-if="func.scope" class="badge small-badge badge-light">{{ func.scope }}</span>
    <span v-if="func.deprecated" class="badge small-badge badge-danger">deprecated</span>
  </h4>
  <section class="ud-member__descr">
    <p v-if="func.deprecated" class="bd-callout bd-callout-warning" v-html="func.deprecated"></p>
    <p v-html="func.description"></p>
    <template v-if="func.returns && func.returns[0].description">
      <p class="arguments-title">Return:</p>
      <template v-html="func.returns[0].description"></template>
    </template>
    <func-params :func="func"></func-params>
    <example
      v-if="func.examples"
      v-for="(example, index) in func.examples"
      :key="index"
      :example="example"
    ></example>
  </section>
</section>
