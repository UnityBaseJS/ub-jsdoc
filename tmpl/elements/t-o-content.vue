<div class="d-none d-xl-block col-xl-2 bd-toc">
    <div class="description"
         v-for="content in tableOfContent">
        <a :href="`#${content.name}`">{{content.name}}</a>
        <ul>
            <li v-for="prop in content.props">
                <a :href="`#${prop.name}`">{{prop.name}}</a>
            </li>
        </ul>
    </div>
</div>