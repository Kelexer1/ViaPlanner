<template>
  <div>
    <HelpDial
      class="absolute bottom-0 right-0"
    />
    <div class="overflow-y-auto max-h-[85vh] overflow-x-hidden">
      <Timetable
        :timetable="store.timetables[store.selectedSession]"
        :semester="store.selectedSession"
        :id="store.selectedSession === 'F' ? 'exportFirstMe' : 'exportSecondMe'"
      />
    </div>
  </div>
</template>

<script setup>
import { useTimetableStore } from '../store/timetable';
import HelpDial from '../components/FloatingButtons/HelpDial.vue';
import Timetable from '../components/Timetable/Timetable.vue';

const store = useTimetableStore();
</script>