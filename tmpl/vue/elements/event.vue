<div class="item border-bottom" :id="event.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!event.deprecated }"><a :href="event.codeLink">{{event.name}}</a></span>
        <span v-if="event.scope" class="badge small-badge badge-light">{{event.scope}}</span>
        <anchor :id="event.name"></anchor>
    </h5>
    <div class="fromMD" v-if="event.deprecated">
        <p v-html="event.deprecated"></p>
    </div>
    <!--<p>{{event.return}}</p>-->
    <div v-else>
        <div class="fromMD">
            <p v-html="event.description"></p>
        </div>
        <template v-if="event.returns && event.returns[0].description">
            <p></p>
            <p class="arguments-title">Return:</p>
            <template v-html="event.returns[0].description"></template>
        </template>
        <template v-if="event.params && event.params.length > 0">
            <p>Params</p>
            <ul>
                <li v-for="param in event.params">
                    <p>{{param.name}}</p>
                    <p v-if="param.type">{{param.type.names[0]}}</p>
                </li>
            </ul>
        </template>
        <template v-if="event.examples">
            <p class="arguments-title">Examples:</p>
            <example
                    v-for="example in event.examples"
                    :key="1"
                    :example="example"
            ></example>
        </template>
    </div>
</div>
