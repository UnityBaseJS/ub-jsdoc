<main>
<h3 class="page-breadcrumb">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item" v-for="breadcrumb in module.breadcrumbs">
                <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
            </li>
        </ol>
    </nav>
</h3>
<div class="fromMD">
    <p v-html=module.readme></p>
    <p v-if="module.description" v-html="module.description"></p>
</div>
<template v-if="module.examples">
    <example id="examples"
            v-for="example in module.examples"
            :key="1"
            :example="example"
    ></example>
</template>

<template v-if="subclasses.length > 0">
    <h3 class="ud-member__group" id="Classes">Classes</h3>
    <ul class="subclasses">
        <li v-for="clazz in subclasses">
            <a :href="clazz.link">{{ clazz.name }}</a>
        </li>
    </ul>
</template>

<template v-if="submodules.length > 0">
    <h3 class="ud-member__group" id="Submodules">Submodules</h3>
    <ul class="submodules">
        <li v-for="submodule in submodules">
            <a :href="submodule.link">{{ submodule.name }}</a>
        </li>
    </ul>
</template>

<template v-if="mixins.length > 0">
    <h3 class="ud-member__group" id="Mixins">Mixins</h3>
    <ul class="mixins">
        <li v-for="mixin in mixins">
            <a :href="mixin.link">{{ mixin.name }}</a>
        </li>
    </ul>
</template>

<template v-if="members.length > 0">
    <h3 class="ud-member__group" id="Members">Members</h3>
    <member
            v-for="member in members"
            :key="member.___id"
            :member="member"
    ></member>
</template>

<template v-if="funcs.length > 0">
    <h3 class="ud-member__group" id="Methods">Methods</h3>
    <func
            v-for="func in funcs"
            :key="func.___id"
            :func="func"
    ></func>
</template>

<template v-if="types.length > 0">
    <h3 class="ud-member__group" id="Types">Types</h3>
    <type
            v-for="type in types"
            :key="type.___id"
            :type="type"
    ></type>
</template>

<template v-if="events.length > 0">
  <h3 class="ud-member__group" id="events">Events</h3>
  <event
      v-for="event in events"
      :key="event.___id"
      :event="event"
  ></event>
</template>

</main>
