<section class="item" :id="event.name">
<h4 class="ud-member__signature">
  <anchor :member="event.name"></anchor>
  <a :href="event.codeLink" :class="{ deprecated: !!event.deprecated }">{{ event.name }}</a>
  <span v-if="event.scope" class="badge small-badge badge-light">{{ event.scope }}</span>
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
  <template v-if="event.params && event.params.length > 0">
    <p>Params</p>
    <ul>
      <li v-for="param in event.params">
        <p>{{ param.name }}</p>
        <p v-if="param.type">{{ param.type.names[0] }}</p>
      </li>
    </ul>
  </template>
</section>
</section>
