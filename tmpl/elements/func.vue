<div class="item border-bottom" :id="func.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!func.deprecated }">{{func.name}}</span>(
        <template v-if="func.paramsForMethods && func.paramsForMethods.length>0">
            <template v-for="param in func.paramsForMethods.slice(0, -1)">{{param.name}}<span v-if="param.optional"
                                                                                              class="badge badge-pill badge-light">opt</span>:
                <a :href="param.type[0].link">{{param.type[0].text}}</a><span>, </span></template>
            {{func.paramsForMethods.slice(-1)[0].name}}<span v-if="func.paramsForMethods.slice(-1)[0].optional"
                                                             class="badge badge-pill badge-light">opt</span>: <a
                :href="func.paramsForMethods.slice(-1)[0].type[0].link">{{func.paramsForMethods.slice(-1)[0].type[0].text}}</a>
        </template>
        )
        <template v-if="func.returns">
            →
            <template v-for="ret in func.returns.slice(0, -1)">
                <a :href="ret.link">{{ret.text}}</a>
                <span>| </span>
            </template>
            <a :href="func.returns.slice(-1)[0].link">{{func.returns.slice(-1)[0].text}}</a>
        </template>
        <span v-if="func.scope" class="badge badge-light">{{func.scope}}</span>
        <span class="anchor" :data-id="func.name">#</span>
    </h5>
    <div class="fromMD" v-if="func.deprecated">
        <span v-if="func.deprecated" class="badge badge-danger">Super!deprecated</span>
        <p v-html="func.deprecated"></p>
    </div>
    <!--<p>{{func.return}}</p>-->
    <div>
        <div class="fromMD">
            <p v-html="func.description"></p>
        </div>
        <template v-if="func.returns">
            <p v-if="func.returns && func.returns[0].type">Return: {{ func.returns[0].type.names[0]}}</p>
            <p v-else>{{func.returns[0].description}}</p>
        </template>
        <template v-if="func.params && func.params.length > 0">
            <p>Arguments</p>
            <ul>
                <li v-for="param in func.params">
                    <!--<p>{{param.name}}:</p><a v-if="param.type[0]" :href="param.type[0].link">{{param.type[0].text}}</a>-->
                    <div v-if="param.props">
                        <p>Properties</p>
                        <ul>
                            <li v-for="prop in param.props">
                                <!--<p>{{prop.name}}:</p><a v-if="prop.type[0]" :href="prop.type[0].link">{{prop.type[0].text}}</a>-->
                            </li>
                        </ul>

                    </div>
                    <!--<p v-if="param.type">{{param.type.names[0]}}</p>-->
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