<main role="main">
<h3 class="page-breadcrumb">
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item" v-for="breadcrumb in interface.breadcrumbs">
        <a :href="breadcrumb.link">{{ breadcrumb.name }}</a>
      </li>
    </ol>
  </nav>
</h3>
<p v-html=interface.description></p>
<template v-if="funcs.length > 0">
  <h3 class="ud-member__group" id="Methods">Methods</h3>
  <func
      v-for="func in funcs"
      :key="func.___id"
      :func="func"
  ></func>
</template>
</main>
