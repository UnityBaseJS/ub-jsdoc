<div class="item border-bottom" :id="func.name">
    <h5 class="alert alert-primary">
        <!--all in one line to prevent creating redundant spaces during vue render-->
        <span :class="{ deprecated: !!func.deprecated }"><a :href="func.codeLink">{{func.name}}</a></span>(<template v-if="func.paramsForMethods && func.paramsForMethods.length > 0"><template v-for="param in func.paramsForMethods.slice(0, -1)">{{param.name}}<span v-if="param.optional" class="badge badge-pill badge-light">opt</span><span v-if="param.type && param.type.length > 0">: <span v-html="param.type[0]"></span></span><span>, </span></template>{{func.paramsForMethods.slice(-1)[0].name}}<span v-if="func.paramsForMethods.slice(-1)[0].optional" class="badge badge-pill badge-light">opt</span><span v-if="func.paramsForMethods.slice(-1)[0].type && func.paramsForMethods.slice(-1)[0].type.length > 0">: <span v-html="func.paramsForMethods.slice(-1)[0].type[0]"></span></span></template>)<template v-if="func.returns">→<template v-for="ret in func.returns[0].type.slice(0, -1)"><span v-html="ret"></span><span> | </span></template><span v-html="func.returns[0].type.slice(-1)[0]"></span></template><span v-if="func.scope" class="badge badge-light">{{func.scope}}</span><span v-if="func.deprecated" class="badge badge-danger">deprecated</span><anchor :id="func.name"></anchor>
    </h5>
    <div class="fromMD" v-if="func.deprecated">
        <p v-html="func.deprecated"></p>
    </div>
    <div>
        <div class="fromMD">
            <p v-html="func.description"></p>
        </div>
        <template v-if="func.returns && func.returns[0].description">
            <p></p>
            <p class="arguments-title">Return:</p>
            <template v-html="func.returns[0].description"></template>
        </template>
        <div class="arguments" v-if="func.params && func.params.length > 0">
            <p></p>
            <p class="arguments-title">Arguments info:</p>
            <ul>
                <li v-for="param in func.params">
                    <code>{{param.name}}</code><span
                        v-if="param.defaultvalue !== undefined"> = {{param.defaultvalue}} </span>: <span
                        v-if="param.type" v-html="param.type[0]"></span>
                    <div v-if="param.props">
                        <!--<p>Properties</p>-->
                        <ul>
                            <li v-for="prop in param.props">
                                <code>{{prop.name}}</code><span v-if="prop.defaultvalue">={{prop.defaultvalue}}</span>:
                                <span
                                        v-if="prop.type" v-html="prop.type[0]"></span>
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
            <p class="arguments-title">Examples:</p>
            <example
                    v-for="example in func.examples"
                    :key="1"
                    :example="example"
            ></example>
        </template>
    </div>
</div>
