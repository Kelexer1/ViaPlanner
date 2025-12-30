<template>
  <div
    class="flex flex-row items-center justify-center"
  >
    <div
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
      class="flex flex-row justify-center items-center mt-4 mx-0 relative w-full"
    >
      <h3 class="day-label mb-0 mx-0 font-bold">{{ weekday }}</h3>
      <div
        v-if="hovered || locked"
        class="absolute -bottom-6"
        v-tooltip.bottom="{
          value: toolTipText
        }"
      >
        <Button
          v-if="locked"
          @click="unlockDay"
          icon="pi pi-lock"
          rounded
          text
          iconClass="text-text-primary"
        />
        <Button
          v-else
          @click="lockDay"
          icon="pi pi-lock-open"
          rounded
          text
          iconClass="text-text-primary"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

const hovered = ref(false);

const props = defineProps({
  weekday: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  }
});

const locked = ref(false);

const toolTipText = computed(() => {
  return locked ? 'Block All Times' : 'Unblock All Times';
});

function lockDay() {
  store.setLockedDayStatus(props.weekday, true);
  store.saveStateHistory();
  locked.value = true;
}

function unlockDay() {
  store.setLockedDayStatus(props.weekday, false);
  store.saveStateHistory();
  locked.value = false;
}
</script>

<style scoped>
.day-label {
  text-align: center;
}
</style>
