<div class="item border-bottom" :id="func.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!func.deprecated }"><a :href="func.codeLink">{{func.name}}</a></span>(<template v-if="func.paramsForMethods && func.paramsForMethods.length > 0"><template v-for="param in func.paramsForMethods.slice(0, -1)">{{param.name}}<span v-if="param.optional" class="badge badge-pill badge-light">opt</span><span v-if="param.type && param.type.length > 0"> : <a :href="param.type[0].link">{{param.type[0].text}}</a></span><span>, </span></template>{{func.paramsForMethods.slice(-1)[0].name}}<span v-if="func.paramsForMethods.slice(-1)[0].optional" class="badge badge-pill badge-light">opt</span><span v-if="func.paramsForMethods.slice(-1)[0].type && func.paramsForMethods.slice(-1)[0].type.length > 0"> : <a :href="func.paramsForMethods.slice(-1)[0].type[0].link">{{func.paramsForMethods.slice(-1)[0].type[0].text}}</a></span></template>)<template v-if="func.returns">→<template v-for="ret in func.returns.slice(0, -1)"><a :href="ret.link">{{ret.text}}</a><span> | </span></template><a :href="func.returns.slice(-1)[0].link">{{func.returns.slice(-1)[0].text}}</a></template>
        <span v-if="func.scope" class="badge badge-light">{{func.scope}}</span>
        <span v-if="func.deprecated" class="badge badge-danger">deprecated</span>
        <anchor :id="func.name"></anchor>
    </h5>
    <div class="fromMD" v-if="func.deprecated">

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
        <div class="arguments" v-if="func.params && func.params.length > 0">
            <p class="arguments-title">Arguments info:</p>
            <ul>
                <li v-for="param in func.params">
                    <code>{{param.name}}</code><span
                        v-if="param.defaultvalue !== undefined"> = {{param.defaultvalue}} </span>: <a v-if="param.type"
                                                                                                      :href="param.type[0].link">{{param.type[0].text}}</a>
                    <div v-if="param.props">
                        <!--<p>Properties</p>-->
                        <ul>
                            <li v-for="prop in param.props">
                                <code>{{prop.name}}</code><span v-if="prop.defaultvalue">={{prop.defaultvalue}}</span>:
                                <a v-if="prop.type" :href="prop.type[0].link">{{prop.type[0].text}}</a>
                                <!--<p v-if="prop.description">{{prop.description}}</p>-->
                                <p v-html="prop.description"></p>
                            </li>
                        </ul>
                    </div>
                    <div class="fromMD">
                        <p v-if="param.description" v-html="param.description"></p>
                    </div>
                </li>
            </ul>
        </div>
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
