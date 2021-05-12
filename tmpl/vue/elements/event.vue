<section class="item" :id="event.name">
<h4 class="ud-member__signature">
  <anchor :member="event.name"></anchor>
  <a :href="event.codeLink" :class="{ deprecated: !!event.deprecated }">{{ event.name }}</a>
  &nbsp;-->&nbsp;(<func-signature :func="event"></func-signature>)
</h4>
<section class="ud-member__descr">
  <p v-html="event.description"></p>
  <p v-if="event.deprecated" class="bd-callout bd-callout-warning" v-html="event.deprecated"></p>
  <example
      v-if="event.examples"
      v-for="example in event.examples"
      :key="1"
      :example="example"
  ></example>
  <template v-if="event.returns && event.returns[0].description">
    <p class="arguments-title">
      Return:
    </p>
    <template v-html="event.returns[0].description"></template>
  </template>
  <func-params :func="event"></func-params>
</section>
</section>
