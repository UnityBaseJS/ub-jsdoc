<div>
    <h5 v-bind:class="{ deprecated: func.deprecated}" v-bind:id="func.name">{{func.name}}</h5>
    <p v-if="func.deprecated" v-html="func.deprecated"></p>
    <!--<p>{{func.return}}</p>-->
    <div v-else>
        <p v-if="func.scope">{{func.scope}}</p>
        <p v-html="func.description"></p>
        <template v-if="func.returns">
            <p v-if="func.returns && func.returns[0].type">Return: {{ func.returns[0].type.names[0]}}</p>
            <p v-else>{{func.returns[0].description}}</p>
        </template>
        <div v-if="func.params && func.params.length > 0">
            <p>Params</p>
            <ul>
                <li v-for="param in func.params">
                    <p>{{param.name}}</p>
                    <p v-if="param.type">{{param.type.names[0]}}</p>
                </li>
            </ul>
        </div>
        <div v-if="func.examples">
            <p>Examples</p>
            <ul>
                <li v-for="example in func.examples">
                    <code><pre>{{example}}</pre></code>
                </li>
            </ul>
        </div>
    </div>
</div>