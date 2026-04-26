<template>
  <div
    class="h-full cursor-pointer select-none"
    @click="toggleHourLock()"
  >
    <h2 class="mr-[10px] text-[12px] md:text-[16px] font-semibold">{{ time }}</h2>
    <div
      v-if="last && locked"
      class="mt-2 flex flex-row items-center justify-center"
      v-tooltip.right="tooltip(lockTooltipText)"
    >
      <Button
        @click.stop="toggleHourLock()"
        icon="pi pi-lock"
        rounded
        text
        iconClass="text-text-primary"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTimetableStore } from '../../store/timetable';
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

const store = useTimetableStore();
const { tooltip } = useResponsiveTooltip();

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const props = defineProps({
  time: {
    type: String,
    required: true
  },
  last: {
    type: Boolean,
    required: true
  },
  semester: {
    type: String,
    required: true
  }
})

const intTime = computed(() => {
  const timeSplit = props.time.split(' ');
  const hour = parseInt(timeSplit[0]);
  return hour + ((timeSplit[1] === 'PM' && hour !== 12) ? 12 : 0);
});

const locked = computed(() => {
  const blockedTimesForSemester = store.blockedTimes[props.semester] || [];

  return days.every((day) => (
    blockedTimesForSemester.some((blocker) => (
      blocker.day === day &&
      blocker.start === intTime.value * 3600 &&
      blocker.end === (intTime.value * 3600) + 3600
    ))
  ));
});

const lockTooltipText = computed(() => {
  return locked.value ? 'Unblock All Times' : 'Block All Times';
});

async function toggleHourLock() {
  await store.setLockedHourStatus(intTime.value, !locked.value);
  store.saveStateHistory();
}
</script>
