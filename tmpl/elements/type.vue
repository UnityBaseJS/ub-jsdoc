<div class="item" :id="type.name">
    <div class="anchor-wrapper">
        <h5 class="item-title-wrapper" v-bind:id="type.name">{{type.name}}</h5>
        <span class="anchor" :data-id="type.name">#</span>
    </div>
    <div class="fromMD">
        <p v-html="type.description"></p>
    </div>

    <!--<p>{{func.return}}</p>-->
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
