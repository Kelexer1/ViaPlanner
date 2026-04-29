<template>
  <div class="scroll-area">
    <SelectedCourseCard v-for="(course, code) in filterCourses(store.selectedCourses[store.selectedSession])"
      :key="code" :course="course" />
  </div>
</template>

<script setup lang="ts">
import { useTimetableStore } from '../../store/timetable';
import SelectedCourseCard from './SelectedCourseCard.vue';

const store = useTimetableStore() as any;

function filterCourses(selectedCourses: Array<any>) {
  const filteredCourses: Record<string, any> = {};

  for (const code in selectedCourses) {
    if (!code.includes('Lock')) filteredCourses[code] = selectedCourses[code];
  }

  return filteredCourses;
}
</script>

<style scoped>
.scroll-area {
  position: relative;
  margin: auto;
  height: 500px;
}
</style>
