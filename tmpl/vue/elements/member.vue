<div class="item border-bottom" :id="member.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!member.deprecated }"><a :href="member.codeLink">{{member.name}}</a></span><template v-if="member.type && member.type.length > 0">: <span v-html="member.type[0]"></span></template><span v-if="member.deprecated" class="badge small-badge badge-danger">deprecated</span><span v-if="member.scope" class="badge small-badge badge-light">{{member.scope}}</span>
        <anchor :id="member.name"></anchor>
    </h5>
    <div class="fromMD">
        <p v-html="member.description"></p>
    </div>
    <template v-if="member.deprecated">
        <p>{{member.deprecated}}</p>
    </template>
    <template v-if="member.examples">
        <p class="arguments-title">Examples:</p>
        <example
                v-for="example in member.examples"
                :key="1"
                :example="example"
        ></example>
    </template>
    <template v-if="member.properties && member.properties.length > 0">
        <table class="table table-striped table-sm">
            <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Description</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="property in member.properties">
                <td>{{property.name}}</td>
                <td><span v-if="property.type && property.type.length > 0" v-html="property.type[0]"></span></td>
                <td><span v-html="property.description"></span></td>
            </tr>
            </tbody>
        </table>
    </template>
</div>
