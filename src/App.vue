<template>
  <div id="app">
    <router-view />
    <CourseDetailCardsLayer/>
    <Toast/>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useTimetableStore } from './store/timetable';
import CourseDetailCardsLayer from './components/CourseDetails/CourseDetailCardsLayer.vue';

const store = useTimetableStore();

onMounted(() => {
  store.initializeHistory();
  store.updatePreferences();
  initializeSessionGroup();
  applyDarkMode();
  generateCourseCards();
  loadCoursesToBuilder();
  store.loadBlockedTimesToBuilder();
});

async function initializeSessionGroup() {
  const sessionGroups = await store.getSessions();
  if (!store.selectedSessionGroup || !sessionGroups.some(sessionGroup => sessionGroup.group === store.selectedSessionGroup)) {
    const newSessionGroup = sessionGroups[sessionGroups.length - 1]
    store.selectedSessionGroup = newSessionGroup.group;

    store.selectedSubsessions = newSessionGroup.subsessions.map(subsession => subsession.value);

    console.log(`Initialized session group to ${newSessionGroup.group} -> ${store.selectedSubsessions}`);
  }
}

function applyDarkMode() {
  if (store.darkMode) {
      document.documentElement.classList.add('dark');
  } else {
      document.documentElement.classList.remove('dark');
  }
}

async function generateCourseCards() {
  const divisionalLegends = await store.getDivisionalLegends();
  const divisionalEnrolmentIndicators = await store.getDivisionalEnrolmentIndicators();

  for (const semester of Object.keys(store.selectedCourses)) {
    for (const course of Object.keys(store.selectedCourses[semester])) {
      store.registerDetailCard(course, store.selectedCourses[semester][course].courseData.sectionCode, {
        courseData: store.selectedCourses[semester][course].courseData,
        divisionalData: {
          divisionalLegends,
          divisionalEnrolmentIndicators
        }
      });
    }
  }
}

async function loadCoursesToBuilder() {
  for (const session of Object.values(store.selectedCourses)) {
    for (const course of Object.values(session)) {
      store.addCourseToBuilder(course["courseData"]);
    }
  }
}

watch(() => [store.maxGap, store.maxDayLength, store.minDayLength, store.maxHours, store.prefferedStart,
             store.prefferedMaxEnd, store.onlinePreference, store.avoidRushHour],
      () => store.updatePreferences()
);

</script>

<style lang='scss'>
#app {
  max-width: 100%;
  overflow: hidden;
}
</style>
