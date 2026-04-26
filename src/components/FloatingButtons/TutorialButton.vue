<template>
  <div>
    <Button
      @click="setTutorial"
      icon="pi pi-question"
      rounded
      v-tooltip.left="tooltip('View the tutorial')"
      :pt:root:class="'bg-green-400 border-green-400'"
      class="shadow-md"
    />
  </div>
</template>

<script setup>
import { useTimetableStore } from '../../store/timetable';
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

const store = useTimetableStore();
const { tooltip } = useResponsiveTooltip();

function setTutorial() {
  store.tutorialPopup = true;
}
</script>
