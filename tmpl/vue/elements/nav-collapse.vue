<div class="sidebar">
    <ul class="main-nav accordion" id="accordionNav">
        <li v-for="nav in navigation">
            <button class="btn" type="button" data-toggle="collapse" :data-target="`#collapse${nav.name.replace(/\s/g,'')}`"
                    :aria-expanded="nav.isCurrent !== undefined?nav.isCurrent.toString():false"
                    :aria-controls="`collapse${nav.name.replace(/\s/g,'')}`">
                <span>{{nav.name}}</span>
                <i class="fas" :class="{ 'fa-caret-right': !nav.isCurrent, 'fa-caret-down': nav.isCurrent }"></i>
            </button>
            <div :id="`collapse${nav.name.replace(/\s/g,'')}`" class="collapse" :class="{show:nav.isCurrent}"
                 :aria-labelledby="`heading${nav.name}`"
                 data-parent="#accordionNav">
                <template v-if="nav.submenu">
                    <ul class="sub-nav">
                        <li v-for="subnav in nav.submenu">
                            <a :href="subnav.link" :class="{ current: subnav.isCurrent }">{{subnav.name}}</a>
                        </li>
                    </ul>
                </template>
            </div>
        </li>
    </ul>
</div>
