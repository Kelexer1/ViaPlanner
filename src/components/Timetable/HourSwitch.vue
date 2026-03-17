<template>
  <div
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    class="h-full"
  >
    <h2 class="hourLabel font-semibold">{{ time }}</h2>
    <div
      v-if="last && (hovered || locked)"
      class="mt-2 flex flex-row items-center justify-center"
      v-tooltip.right="{
        'value': 'Block All Times'
      }"
    >
      <Button
        v-if="locked"
        @click="unlockHour()"
        icon="pi pi-lock"
        rounded
        text
        iconClass="text-text-primary"
      />
      <Button
        v-else
        @click="lockHour()"
        icon="pi pi-lock-open"
        rounded
        text
        iconClass="text-text-primary"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

const hovered = ref(false);

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

const locked = ref(false);

async function lockHour() {
  await store.setLockedHourStatus(intTime.value, true);
  store.saveStateHistory();
  locked.value = true;
}

async function unlockHour() {
  await store.setLockedHourStatus(intTime.value, false);
  store.saveStateHistory();
  locked.value = false;
}
</script>

<style scoped>
.hourLabel {
  margin-right: 10px;
  font-size: 16px;
}
</style>
