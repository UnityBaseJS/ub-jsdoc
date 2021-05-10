<main>
<h3 class="page-breadcrumb">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item" v-for="breadcrumb in clazz.breadcrumbs">
                <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
            </li>
        </ol>
    </nav>
</h3>
<section class="item" :id="clazz.name">
  <p v-html=clazz.classdesc></p>
  <example
      v-if="clazz.examples"
      v-for="example in clazz.examples"
      :key="1"
      :example="example"
  ></example>
  <div v-if="clazz.mixes && clazz.mixes.length > 0">
    Mixes In:
    <ul>
      <li v-for="mixin in clazz.mixes">
        <a :href="mixin.link">{{mixin.text}}</a>
      </li>
    </ul>
  </div>

  <h4 class="ud-member__signature">
    <anchor :member="clazz.name"></anchor>
    <a :href="clazz.codeLink">new {{clazz.name}}</a>
    (<func-signature :func="clazz"></func-signature>)
  </h4>
  <p>
    <func-params :func="clazz"></func-params>
  </p>
</section>
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
<template v-if="events.length > 0">
  <h3 class="ud-member__group" id="events">Events</h3>
  <event
    v-for="event in events"
    :key="event.___id"
    :event="event"
  ></event>
</template>
</main>
