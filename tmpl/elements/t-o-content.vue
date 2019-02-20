<div class="d-none d-xl-block col-xl-2 bd-toc">
    <div class="description"
         v-for="content in tableOfContent">
        <template v-if="content.props.length > 0">
            <a v-if="content.name" :href="`#${content.name}`">{{content.name}}</a>
            <ul>
                <li v-for="prop in content.props">
                    <a :href="prop.link">{{prop.name}}</a>
                </li>
            </ul>
        </template>
    </div>
</div>