<div class="d-none d-xl-block col-xl-2 bd-toc">
    <div class="description"
         v-for="content in tableOfContent">
        <template v-if="content.props.length > 0">
            <a :href="`#${content.name}`">{{content.name}}</a>
            <ul>
                <li v-for="prop in content.props">
                    <a :href="`#${prop.name}`">{{prop.name}}</a>
                </li>
            </ul>
        </template>
    </div>
</div>