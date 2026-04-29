<template>
  <div v-tooltip.bottom="tooltip(warningText || 'This section is not open for enrolment at the moment')">
    <i class="pi pi-exclamation-circle" />
  </div>
</template>

<script setup lang="ts">
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

const props = defineProps({
  warningText: {
    type: String,
    required: false
  }
});

const { tooltip } = useResponsiveTooltip();
</script>