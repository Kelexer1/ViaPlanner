<template>
  <div :class="sideBarRootClasses">
    <h1 class="text-xl font-bold mr-4">{{ sideBarTitle }}</h1>
    <p class="text-lg font-medium">{{ Object.keys(store.selectedCourses[store.selectedSession]).length * 0.5 }} credits</p>
    <hr class="mb-3" />
    <img
      :src="imgSrc"
      class="absolute z-0"
      width="100%"
      style="left: 50%; top: 50%; transform: translate(-50%, -50%);"
    >
    <div
      class="flex flex-row justify-center items-start"
      :style="{ 'height' : `${coursePanelHeight}px`, 'z-index' : -1 }"
    >
      <div class="flex flex-col w-full">
        <SelectedCourseCard
          v-for="(course, code) in store.selectedCourses[store.selectedSession]"
          :key="code"
          :course="course"
          class="z-1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch} from 'vue';
import { useTimetableStore } from '../../store/timetable';
import fallBackground from '../../assets/fall-background.png';
import winterBackground from '../../assets/winter-background.png';
import SelectedCourseCard from './SelectedCourseCard.vue';
import { useWindowSize } from '../../composables/useWindowSize';

const store = useTimetableStore();
const { height } = useWindowSize();

const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  }
});

const sideBarTitle = ref('Loading Sessions...');

async function updateSideBarTitle() {
  const sessions = await store.getSessions();
  const sessionGroup = sessions.find(sessionGroup => sessionGroup.group === store.selectedSessionGroup);

  if (sessionGroup) {
    const sessionKey = ` (${store.selectedSession})`;
    const subsession = sessionGroup.subsessions.find(subsession => subsession.label.includes(sessionKey));
    sideBarTitle.value = subsession ? subsession.label.replace(sessionKey, '') : 'Loading Sessions...';
  } else {
    sideBarTitle.value = 'Loading Sessions...';
  }
}

onMounted(updateSideBarTitle);
watch(() => store.selectedSessionGroup, updateSideBarTitle);
watch(() => store.selectedSession, updateSideBarTitle);

const coursePanelHeight = computed(() => {
  if (props.fullscreen) {
    return Math.max(height.value - 170, 240);
  }

  return (height.value - 99) * 0.6;
});

const sideBarRootClasses = computed(() => {
  if (props.fullscreen) {
    return 'p-4 bg-timetablecell transition-colors duration-1000 shadow-md relative h-full overflow-y-auto rounded-none mt-0';
  }

  return 'p-4 mt-3 bg-timetablecell transition-colors duration-1000 rounded-md rounded-r-none shadow-md relative';
});

const imgSrc = computed(() => {
  if (store.selectedSession === 'F') {
    return fallBackground;
  }

  return winterBackground;
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');

.right-scroll-area {
  position: relative;
  height: 90% !important;
  background-color: transparent;
  padding-left: 10px;
  padding-right: 10px;
}

* {
  font-family: 'Montserrat', sans-serif;
}
</style>
