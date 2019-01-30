<div class="item border-bottom" :id="member.name">
    <div class="anchor-wrapper">
        <div>
            <h5 class="item-title-wrapper">
                <div class="item-name alert-primary">
                    {{member.name}}
                </div>
                <template v-if="member.type && member.type.length > 0">
                    <div v-for="type in member.type" class="item-type">
                        :
                        <a :href="type.href">{{type.text}}</a>
                    </div>
                </template>
            </h5>
        </div>
        <span class="anchor" :data-id="member.name">#</span>
    </div>

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
