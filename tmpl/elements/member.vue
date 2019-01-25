<div>
    <h5 v-bind:id="member.name" class="item">{{member.name}}</h5>
    <p>Returns:</p>
    <!--<ul>-->
        <!--<li v-for="type in member.type">-->
            <!--<p>{{type}}</p>-->
        <!--</li>-->
    <!--</ul>-->
    <!--<a :href="member.type.href">{{member.type.text}}</a>-->
    <!--<p>{{func.return}}</p>-->
    <p v-html="member.description"></p>
    <template v-if="member.deprecated">
        <p>Deprecated!</p>
        <p>{{member.deprecated}}</p>
    </template>
    <p>Properties</p>
    <ul>
        <li v-for="property in member.properties">
            <p>{{property.name}}</p>
            <p>{{property.type}}</p>
            <p>{{property.description}}</p>
        </li>
    </ul>

    <!--<ul>-->
    <!--<li v-for="argument in arguments">-->
    <!--{{ argument }}-->
    <!--</li>-->
    <!--</ul>-->
</div>
