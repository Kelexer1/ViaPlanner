<template>
  <div
    v-tooltip.bottom="{
      value: warningText || 'This section is not open for enrolment at the moment'
    }"
  >
    <i class="pi pi-exclamation-circle"/>
  </div>
</template>

<script setup>
const props = defineProps({
  warningText: {
    type: String,
    required: false
  }
});
</script>