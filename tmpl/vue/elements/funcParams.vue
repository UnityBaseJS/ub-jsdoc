<div v-if="func.paramsForMethods && func.paramsForMethods.length > 0" class="arguments">
<h5>Parameters</h5>
<ul>
  <li v-for="param in func.paramsForMethods">
    <code>{{ param.name }}</code>
    <span v-if="param.defaultvalue !== undefined"> = {{ param.defaultvalue }} </span>:
    <span v-for="(pt, idx) in param.type">
          <template v-html="pt"></template>
          <template v-if="idx<param.type.length-1">| </template>
        </span>
    <div v-if="param.props">
      <!--<p>Properties</p>-->
      <ul>
        <li v-for="prop in param.props">
          <code>{{ prop.name }}</code><span v-if="prop.defaultvalue">={{ prop.defaultvalue }}</span>:
          <span
              v-if="prop.type" v-html="prop.type[0]"></span>
          <!--<p v-if="prop.description">{{prop.description}}</p>-->
          <p v-html="prop.description"></p>
        </li>
      </ul>
    </div>
    <div class="fromMD">
      <p v-if="param.description" v-html="param.description"></p>
    </div>
  </li>
</ul>
</div>