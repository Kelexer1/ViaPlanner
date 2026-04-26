<template>
  <div>
    <SelectButton
      v-model="selectedSession"
      :options="sessions"
      :allowEmpty="false"
      :pt:root:class="'shadow-md'"
      :size="isSmallDevice ? 'small' : 'large'"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../store/timetable';
import { useWindowSize } from '../../composables/useWindowSize';

const { isSmallDevice } = useWindowSize();
const store = useTimetableStore();

const sessions = ref([
  'F', 'S'
]);

const selectedSession = ref(store.selectedSession || 'F');

watch(selectedSession, (val) => {
  if (val !== store.selectedSession) {
    store.selectedSession = val;
  }
});

watch(() => store.selectedSession, (val) => {
  if (val !== selectedSession.value) {
    selectedSession.value = val;
  }
});
</script>

<style>
span[data-p~="checked"] {
  background-color: var(--color-active) !important;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>
