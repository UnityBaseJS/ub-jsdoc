<div>
    <h5 v-bind:class="{ deprecated: event.deprecated}" v-bind:id="event.name">{{event.name}}</h5>
    <p v-if="event.deprecated" v-html="event.deprecated"></p>
    <!--<p>{{event.return}}</p>-->
    <div v-else>
        <p v-if="event.scope">{{event.scope}}</p>
        <p v-html="event.description"></p>
        <template v-if="event.returns">
            <p v-if="event.returns && event.returns[0].type">Return: {{ event.returns[0].type.names[0]}}</p>
            <p v-else>{{event.returns[0].description}}</p>
        </template>
        <div v-if="event.params && event.params.length > 0">
            <p>Params</p>
            <ul>
                <li v-for="param in event.params">
                    <p>{{param.name}}</p>
                    <p v-if="param.type">{{param.type.names[0]}}</p>
                </li>
            </ul>
        </div>
        <div v-if="event.examples">
            <p>Examples</p>
            <ul>
                <li v-for="example in event.examples">
                    <code><pre>{{example}}</pre></code>
                </li>
            </ul>
        </div>
    </div>
</div>