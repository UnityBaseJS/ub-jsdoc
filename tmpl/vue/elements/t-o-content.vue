<div class="d-none d-xl-block col-xl-2 bd-toc">
    <template v-for="content in tableOfContent">
        <div class="description" v-if="content.props.length > 0">
            <a v-if="content.name">{{content.name}}</a>
            <ul>
                <li v-for="prop in content.props">
                    <a :href="prop.link">{{prop.name}}</a>
                </li>
            </ul>
        </div>
    </template>
</div>
