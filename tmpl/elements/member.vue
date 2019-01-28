<div class="item" :id="member.name">
    <div class="anchor-wrapper">
        <h5 class="item-title">{{member.name}}</h5>
        <span class="anchor" :data-id="member.name">#</span>
    </div>
    <template v-if="member.type && member.type.length > 0">
        <p>Type:</p>
        <ul>
            <li v-for="type in member.type">
                <a :href="type.href">{{type.text}}</a>
            </li>
        </ul>
    </template>
    <div class="fromMD">
        <p v-html="member.description"></p>
    </div>
    <template v-if="member.deprecated">
        <p>Deprecated!</p>
        <p>{{member.deprecated}}</p>
    </template>
    <template v-if="member.properties && member.properties.length > 0">
        <p>Properties</p>
        <ul>
            <li v-for="property in member.properties">
                <p>{{property.name}}</p>
                <p>{{property.type}}</p>
                <p>{{property.description}}</p>
            </li>
        </ul>
    </template>


    <!--<ul>-->
    <!--<li v-for="argument in arguments">-->
    <!--{{ argument }}-->
    <!--</li>-->
    <!--</ul>-->
</div>
