<template>
  <div>
    <TopNavBar />
    <!-- <SideBar /> -->
    <TaskBoard />
  </div>
</template>

<script setup lang="ts">
import TopNavBar from "./components/layouts/TopNavBar.vue";
import TaskBoard from "./components/layouts/TaskBoard.vue";
import SideBar from "./components/layouts/SideBar.vue";
</script>
