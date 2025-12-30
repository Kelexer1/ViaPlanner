<template>
  <div>
    <Button
      @click="store.toggleDarkMode()"
      :icon="themeIcon"
      rounded
      v-tooltip.bottom="{
        value: 'Toggle Theme',
      }"
      :pt:icon:class="'text-white'"
    />
  </div>
</template>

<script setup>
import { useTimetableStore } from '../../store/timetable';
import { computed } from 'vue';

const store = useTimetableStore();

const themeIcon = computed(() => {
  return store.darkMode ? 'pi pi-moon' : 'pi pi-sun';
});
</script>