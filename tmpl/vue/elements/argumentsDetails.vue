<ul>
<li v-for="param in args">
  <code>{{ param.name }}</code>
  <span v-if="param.defaultvalue !== undefined"> = {{ param.defaultvalue }} </span>:
  <span v-for="(pt, idx) in param.type">
    <template v-html="pt"></template>
    <template v-if="idx < param.type.length-1">| </template>
  </span>
  <div v-if="param.props">
    <ul>
      <li v-for="prop in param.props">
        <code>{{ prop.name }}</code><span v-if="prop.defaultvalue">={{ prop.defaultvalue }}</span>
        <span v-if="prop.type && prop.type.length > 0">:&nbsp;
          <span v-for="(pt, idx) in prop.type">
            <template v-html="pt"></template>
            <template v-if="idx<prop.type.length-1">&nbsp;|&nbsp;</template>
          </span>
        </span>
        <p v-html="prop.description"></p>
      </li>
    </ul>
  </div>
  <div class="fromMD">
    <p v-if="param.description" v-html="param.description"></p>
  </div>
</li>
</ul>
