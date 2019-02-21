<div class="item border-bottom" :id="event.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!event.deprecated }"><a :href="event.codeLink">{{event.name}}</a></span>
        <span v-if="event.scope" class="badge badge-light">{{event.scope}}</span>
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
        <template v-if="event.returns">
            <p v-if="event.returns && event.returns[0].type">Return: {{ event.returns[0].type.names[0]}}</p>
            <p v-else>{{event.returns[0].description}}</p>
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
            <p>Examples</p>
            <example
                    v-for="example in event.examples"
                    :key="1"
                    :example="example"
            ></example>
        </template>
    </div>
</div>