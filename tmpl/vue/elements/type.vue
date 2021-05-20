<section class="item" :id="type.name">
<h4 class="ud-member__signature">
  <anchor :member="type.name"></anchor>
  <a :href="type.codeLink" :class="{ deprecated: !!type.deprecated }">{{ type.name }}</a>
  <span v-if="type.deprecated" class="badge small-badge badge-danger">deprecated</span>
  <span v-if="type.scope" class="badge small-badge badge-light">{{ type.scope }}</span>
</h4>
<section class="ud-member__descr">
  <p v-html="type.description"></p>

<!--<p>{{func.return}}</p>-->

<!--<template v-if="type.deprecated">-->
<!--<p>{{type.deprecated}}</p>-->
<!--</template>-->

<!--alternate template for properties-->

<!--<template v-if="type.properties && type.properties.length > 0">-->
<!--<table class="table table-striped table-sm">-->
<!--<thead>-->
<!--<tr>-->
<!--<th scope="col">Name</th>-->
<!--<th scope="col">Type</th>-->
<!--<th scope="col">Attributes</th>-->
<!--&lt;!&ndash;<th scope="col">Default</th>&ndash;&gt;-->
<!--&lt;!&ndash;<th scope="col">Description</th>&ndash;&gt;-->
<!--</tr>-->
<!--</thead>-->
<!--<tbody>-->
<!--<tr v-for="property in type.properties">-->
<!--<td>{{property.name}}</td>-->
<!--<td><a v-if="property.type && property.type.length > 0" :href="property.type[0].link">{{property.type[0].text}}</a>-->
<!--</td>-->
<!--<td><p v-html="property.description"></p></td>-->
<!--</tr>-->
<!--</tbody>-->
<!--</table>-->
<!--</template>-->

  <section v-if="type.properties && type.properties.length > 0">
    <p class="arguments-title">Properties</p>
    <ul>
      <li v-for="property in type.properties">
        <code>{{ property.name }}</code>
        <span v-if="property.optional" class="badge small-badge badge-light">opt</span>
        <span v-if="property.defaultvalue !== undefined"> = {{ property.defaultvalue }}</span>
        <span v-if="property.type && property.type.length > 0">:&nbsp;
          <span v-for="(pt, idx) in property.type">
            <template v-html="pt"></template>
            <template v-if="idx<property.type.length-1">&nbsp;|&nbsp;</template>
          </span>
        </span>
        <div>
          <p v-if="property.description" v-html="property.description"></p>
        </div>
      </li>
    </ul>
  </section>
</section>
</section>
