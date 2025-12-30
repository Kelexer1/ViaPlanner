<template>
  <div class="w-lg">
    <AutoComplete
      ref="searchBarComponent"
      @complete="populateRecommendations()"
      @focus="onFocus()"
      @blur="isActive = false"
      @option-select="courseSearched()"
      optionLabel="formattedName"
      v-model="currentQuery"
      :suggestions="allCourses"
      loader="pi pi-spinner"
      :loading="loading"
      :placeholder="!loading ? 'Search courses...' : 'Loading...'"
      :inputStyle="{
        'background-color': dynamicColor,
        'border': 'none',
        'border-radius': '4px',
        'color': dynamicTextColor
      }"
      @minLength="5"
      fluid
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

const searchBarComponent = ref(null);
const allCourses = ref([]);
const loading = ref(false);
const isActive = ref(false);
const currentQuery = ref(null);

const dynamicTextColor = computed(() => {
  return store.darkMode ? '#ffffff' : '#222222';
})

const dynamicColor = computed(() => {
  if (isActive.value || currentQuery.value) {
    return store.darkMode ? '#18181b' : '#ffffff';
  }

  return store.darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(179, 179, 179, 0.3)';
})

function parseSessionEmoji(sessions) {
  return sessions.map(session => {
      if (session.length < 5) {
          return '';
      }

      const month = session.substring(4, 5);

      return session.length === 6 ? '☀️' : (month === '9' ? '🍁' : month === '5' ? '☀️' : '❄️');
  }).join('');
}

async function populateRecommendations() {
  const query = currentQuery.value.trim();
  if (!query || query.length < 3) {
    return;
  }

  try {
    loading.value = true;

    const coursesDataResult = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses/${query}`, {
      params: {
        page: 1,
        limit: 5,
        sessions: [...store.selectedSubsessions].join(','),
        divisions: [...store.selectedDivisions].join(',')
      }
    });

    const courses = Array.from(coursesDataResult.data.courses);

    allCourses.value = courses.map(course => {
      course.formattedName = `${parseSessionEmoji(course.sessions)}  ${course.code} ${course.sectionCode} - ${course.name}`;
      return course;
    });

    store.searchBarSuggestions = courses.map(course => `${course.code} ${course.sectionCode}`);

    store.removeUnusedCards();

    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.log(`Error fetching data for ${query}: ${error.message}`);
  }

}

async function courseSearched() {
  const searchValue = currentQuery.value;
  currentQuery.value = '' // Clear search bar

  store.removeUnusedCards(); // Remove any leftover cards from before

  const divisionalLegends = await store.getDivisionalLegends();
  const divisionalEnrolmentIndicators = await store.getDivisionalEnrolmentIndicators();

  if (divisionalLegends && divisionalEnrolmentIndicators) {
    store.registerDetailCard(searchValue.code, searchValue.sectionCode, {
      courseData: searchValue,
      divisionalData: {
        divisionalLegends,
        divisionalEnrolmentIndicators
      }
    });
    store.setDetailCardVisibility(`${searchValue.code} ${searchValue.sectionCode}`, true);
  } else {
    // Show detail card without any divisional data (the property is optional)
    store.registerDetailCard(searchValue.code, searchValue.sectionCode, {
      courseData: searchValue
    });
    store.setDetailCardVisibility(`${searchValue.code} ${searchValue.sectionCode}`, true);
  }
}

function onFocus() {
  isActive.value = true;
  if (allCourses.value.length > 0 && currentQuery.value && currentQuery.value.length >= 3 && searchBarComponent.value) {
    searchBarComponent.value.overlayVisible = true;
  }
}
</script>
