<div>
    <h5 v-bind:id="type.name">{{type.name}}</h5>
    <!--<p>{{func.return}}</p>-->
    <p v-html="type.description"></p>
    <template v-if="type.deprecated">
        <p>Deprecated!</p>
        <p>{{type.deprecated}}</p>
    </template>
    <p>Properties</p>
    <ul>
        <li v-for="property in type.properties">
            <p>{{property.name}}</p>
            <p>{{property.type}}</p>
            <p>{{property.description}}</p>
            <p>{{property.optional}}</p>
        </li>
    </ul>
</div>
