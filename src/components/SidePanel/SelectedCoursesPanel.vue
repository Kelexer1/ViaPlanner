<template>
  <div class="scroll-area">
    {{ selectedCourses }}
    <SelectedCourseCard
      v-for="(course, code) in filterCourses(store.selectedCourses[store.selectedSession])"
      :key="code"
      :course="course"
    />
  </div>
</template>

<script setup>
import { useTimetableStore } from '../../store/timetable';
import SelectedCourseCard from './SelectedCourseCard.vue';

const store = useTimetableStore();

function filterCourses(selectedCourses) {
  const filteredCourses = {};

  for (const code in selectedCourses) {
    if (!code.includes('Lock')) {
      filteredCourses[code] = selectedCourses[code];
    }
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
