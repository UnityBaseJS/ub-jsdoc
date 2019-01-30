<div class="item border-bottom" :id="func.name">
    <div class="anchor-wrapper">
        <h5 class="item-title-wrapper" v-bind:class="{ deprecated: func.deprecated}" v-bind:id="func.name">
            {{func.name}}
            (
            <i v-for="param in func.paramsForMethods">
                {{`${param.name}, `}}
            </i>
            )
        </h5>
        <span class="anchor" :data-id="func.name">#</span>
    </div>
    <div class="fromMD" v-if="func.deprecated">
        <p v-html="func.deprecated"></p>
    </div>
    <!--<p>{{func.return}}</p>-->
    <div v-else>
        <p v-if="func.scope">{{func.scope}}</p>
        <div class="fromMD">
            <p v-html="func.description"></p>
        </div>
        <template v-if="func.returns">
            <p v-if="func.returns && func.returns[0].type">Return: {{ func.returns[0].type.names[0]}}</p>
            <p v-else>{{func.returns[0].description}}</p>
        </template>
        <template v-if="func.params && func.params.length > 0">
            <p>Params</p>
            <ul>
                <li v-for="param in func.params">
                    <p>{{param.name}}</p>
                    <p v-if="param.type">{{param.type.names[0]}}</p>
                </li>
            </ul>
        </template>
        <template v-if="func.examples">
            <p>Examples</p>
            <example
                    v-for="example in func.examples"
                    :key="1"
                    :example="example"
            ></example>
        </template>
    </div>
</div>