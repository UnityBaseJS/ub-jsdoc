<div class="item border-bottom" :id="func.name">
    <h5 class="alert alert-primary">
        {{func.name}}(
        <template v-if="func.paramsForMethods && func.paramsForMethods.length>0">
            <template v-for="param in func.paramsForMethods.slice(0, -1)">
                {{param.name}}:<a :href="param.type[0].link">{{param.type[0].text}}</a><span>, </span>
            </template>
            {{func.paramsForMethods.slice(-1)[0].name}}:<a :href="func.paramsForMethods.slice(-1)[0].type[0].link">{{func.paramsForMethods.slice(-1)[0].type[0].text}}</a>
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
        <span class="anchor" :data-id="func.name">#</span>
    </h5>

    <!--<div class="anchor-wrapper">-->
    <!--<h5 class="item-title-wrapper" v-bind:class="{ deprecated: func.deprecated}" v-bind:id="func.name">-->
    <!--{{func.name}}-->
    <!--(-->
    <!--<i v-for="param in func.paramsForMethods">-->
    <!--{{`${param.name}, `}}-->
    <!--</i>-->
    <!--)-->
    <!--</h5>-->
    <!--<span class="anchor" :data-id="func.name">#</span>-->
    <!--</div>-->
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