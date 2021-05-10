<section class="item" :id="member.name">
<h4 class="ud-member__signature">
  <anchor :member="member.name"></anchor>
  <a :href="member.codeLink" :class="{ deprecated: !!member.deprecated }">{{ member.name }}</a>
  <template v-if="member.type && member.type.length > 0">: <span v-html="member.type[0]"></span></template>
  <span v-if="member.deprecated" class="badge small-badge badge-danger">deprecated</span>
  <span v-if="member.scope" class="badge small-badge badge-light">{{ member.scope }}</span>
</h4>
<section class="ud-member__descr">
  <p v-html="member.description"></p>
  <p v-if="member.deprecated"
     class="bd-callout bd-callout-warning"
     v-html="member.deprecated">
  </p>
  <example v-if="member.examples"
           v-for="example in member.examples"
           :key="1"
           :example="example"
  ></example>
  <template v-if="member.properties && member.properties.length > 0">
    <table class="table table-striped table-sm">
      <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Type</th>
        <th scope="col">Description</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="property in member.properties">
        <td>{{ property.name }}</td>
        <td><span v-if="property.type && property.type.length > 0" v-html="property.type[0]"></span></td>
        <td><span v-html="property.description"></span></td>
      </tr>
      </tbody>
    </table>
  </template>
</section>
</section>
