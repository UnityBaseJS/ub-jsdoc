<div class="item border-bottom" :id="member.name">
    <h5 class="alert alert-primary">
        <span :class="{ deprecated: !!member.deprecated }">{{member.name}}</span>
        <template v-if="member.type && member.type.length > 0"> : <a
                :href="member.type[0].link">{{member.type[0].text}}</a></template>
        <span v-if="member.deprecated" class="badge badge-danger">deprecated</span>
        <span v-if="member.scope" class="badge badge-light">{{member.scope}}</span>
        <span class="anchor" :data-id="member.name">#</span>
    </h5>
    <div class="fromMD">
        <p v-html="member.description"></p>
    </div>
    <template v-if="member.deprecated">
        <p>{{member.deprecated}}</p>
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
                <td><a v-if="property.type && property.type.length > 0" :href="property.type[0].link">{{property.type[0].text}}</a>
                </td>
                <td><span v-html="property.description"></span></td>
            </tr>
            </tbody>
        </table>
    </template>
</div>
