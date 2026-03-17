<template>
  <div
    class="noScrollbar w-full wrap-break-word overflow-y-auto"
    :style="{
      'height': duration * oneHourHeight
    }"
  >
    <!-- Non-empty event -->
    <div
      v-if="!isEmpty"
      class="h-full text-white p-1 text-sm"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <div
        class="flex flex-row justify-between"
      >
        <h3 class="font-bold relative">{{ eventData.course }}</h3>
        <div class="absolute right-0">
          <Button
            v-if="sectionLocked"
            rounded
            text
            icon="pi pi-lock"
            @click="blockSectionToggle()"
            iconClass="text-white"
          />
          <Button
            v-else-if="hovered"
            rounded
            text
            icon="pi pi-lock-open"
            @click="blockSectionToggle()"
            iconClass="text-white"
          />
        </div>
      </div>
      <p>{{ eventData.activity }} ({{ activityData.building.buildingCode ? activityData.building.buildingCode : 'Online' }})</p>
      <p>{{ parseTime(eventData.start) }} - {{ parseTime(eventData.end) }}</p>
    </div>
    <!-- Empty event -->
    <div
      v-else-if="eventData.start % 3600 === 0 && eventData.end % 3600 === 0"
      :class="['event', 'h-full', dynamicColor]"
      :style="{ 'height': getHeight }"
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
    >
      <div
        v-show="hovered"
        class="m-0 p-0 h-[100%] flex items-center"
        @click="blockTimeToggle()"
        v-ripple
      >
        <p
          v-show="hovered"
          class="text-center unselectable text-text-primary w-full"
        >
          {{ dynamicText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

const hovered = ref(false);

const height = ref(window.innerHeight);
window.addEventListener('resize', () => height.value = window.innerHeight);

const props = defineProps({
  eventData: {
    type: Object,
    required: true
  },
  day: {
    type: String,
  },
  semester: {
    type: String
  },
  isEmpty: {
    type: Boolean
  }
});

const secondsToHours = (seconds) => seconds / 3600;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const activityData = computed(() => {
  return !props.isEmpty ? store.selectedCourses[store.selectedSession][props.eventData.course].courseData.sections
    .find((section) => section.name === props.eventData.activity).meetingTimes
    .find((meetingTime) => {
      return meetingTime.day === days.indexOf(props.day) + 1 &&
      meetingTime.start === props.eventData.start &&
      meetingTime.end === props.eventData.end
    })
  : null;
});

const duration = computed(() => {
  return secondsToHours(props.eventData.end - props.eventData.start);
});

const oneHourHeight = computed(() => {
  return (height - 168) / 9 > 65 ? (height - 168) / 9 : 65;
});

const getHeight = computed(() => {
  return `${duration * oneHourHeight}px`;
});

const dynamicText = computed(() => {
  return !timeBlocked.value ? 'Block This Time' : 'Unblock This Time';
});

const dynamicColor = computed(() => {
  const lockedColor = 'bg-timetablecell-hover';
  const background = 'bg-transparent';

  if (timeBlocked.value) {
    return lockedColor;
  }

  return hovered.value ? lockedColor : background;
});

const sectionLocked = computed(() => {
  const lockedActivitiesForCourse = store.lockedSections[props.semester][props.eventData.course] || [];
  return lockedActivitiesForCourse.includes(props.eventData.activity);
});

const timeBlocked = computed(() => {
  const blockedTimesForSemester = store.blockedTimes[props.semester] || [];

  return blockedTimesForSemester.some(blocker => {
    return blocker.day === props.day &&
      blocker.start === props.eventData.start &&
      blocker.end === props.eventData.end;
  });
});

async function blockSectionToggle() {
  await store.setLockedSectionStatus(props.eventData.course, props.eventData.activity, !sectionLocked.value);
  store.saveStateHistory();
}

async function blockTimeToggle() {
  await store.setLockedTimeStatus(props.semester, props.day, props.eventData.start, props.eventData.end, !timeBlocked.value);
  store.saveStateHistory();
}

function parseTime(seconds) {
  const totalMins = Math.floor(seconds / 60);
  const hours = Math.floor(totalMins / 60);
  let mins = ':' + String(totalMins % 60).padStart(2, '0');

  if (mins === ':00') {
    mins = '';
  }

  const extension = hours < 12 ? 'AM' : 'PM';

  return `${hours % 12 === 0 ? 12 : hours % 12}${mins} ${extension}`;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');
* {
  font-family: 'Montserrat', sans-serif;
}
.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.center {
  text-align: center;
}
.noScrollbar::-webkit-scrollbar {
  display: none;
}
.noScrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.event {
  color: white;
  cursor: pointer;
}
</style>
