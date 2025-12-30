<template>
  <div>
    <div class="course-info-card">
      <div
        class="course-card-header pb-4 flex flex-row"
        :style="{ 'background-color' : course.color }"
      >
        <p>{{ course.courseCode }} {{ course.name }}</p>
        <Button
          icon="pi pi-pen-to-square"
          rounded
          text
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

const props = defineProps({
  course: {
    type: Object,
    default: () => {}
  }
});

const meetingSections = computed(() => {
  const sections = [];
  for (const day in timetable) {
    const dayEvents = timetable[day];
    for (const event of dayEvents) {
      if (event.code === course.courseCode) {
        const instructor = event.instructors.length === 0 ? 'TBA' : event.instructors[0];
        sections.push({
          sectionCode: event.sectionCode,
          day,
          start: event.start,
          end: event.end,
          location: event.location,
          instructorName: instructor
        });
      }
    }

    return sections;
  }
});


function getFormattedTime(start, end) {
  let startHour = (start / 3600) % 12;
  if (startHour === 0) {
    startHour = 12;
  }
  const startPeriod = start / 3600 < 12 ? 'AM' : 'PM';
  const startHalf = Number.isInteger(startHour) ? '00' : '30';

  let endHour = (end / 3600) % 12;
  if (endHour === 0) {
    endHour = 12;
  }
  const endPeriod = end / 3600 < 12 ? 'AM' : 'PM';
  const endHalf = Number.isInteger(endHour) ? '00' : '30';

  return `${startHour - startHalf / 6 / 10}:${startHalf} ${startPeriod} - ${endHour - endHalf / 6 / 10}:${endHalf} ${endPeriod}`;
}

function getProperDayName(day) {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');
* {
  font-family: 'Montserrat', sans-serif;
}

.course-info-card {
  position: relative;
  box-shadow: 0 20px 50px #e5e5e5e5;
  border-radius: 12px;
}

.course-card-header {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  height: 56px;
  color: white;
  font-size: 20px;
}

.course-info-header {
  background: white;
  border-bottom: 1px solid black;
  padding-left: 15px;
}

.sections-info {
  padding-left: 15px;
  background: white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.edit-button {
  position: absolute;
  top: 90px;
  right: 10px;
}
</style>
