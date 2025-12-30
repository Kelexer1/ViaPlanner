<template>
  <div>
    <Button
      @click="setTutorial"
      icon="pi pi-question"
      rounded
      v-tooltip.left="{
        value: 'View the tutorial',
      }"
      :pt:root:class="'bg-green-400 border-green-400'"
      class="shadow-md"
    />
  </div>
</template>

<script setup>
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();

function setTutorial() {
  store.tutorialPopup = true;
}
</script>
