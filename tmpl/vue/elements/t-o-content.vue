<nav aria-label="Secondary navigation">
  <nav id="toc">
    <ul>
    <template v-for="content in tableOfContent">
      <template v-if="content.props.length > 0">
        <li>
          <a :href="'#'+content.name" v-if="content.name">{{content.name}}</a>
          <ul>
            <li v-for="prop in content.props">
              <a :href="prop.link">{{prop.name}}</a>
            </li>
          </ul>
        </li>
      </template>
    </template>
    </ul>
  </nav>
</nav>
