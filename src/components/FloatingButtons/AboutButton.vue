<template>
  <div>
    <Button
      @click="$router.push('/about')"
      icon="pi pi-info"
      rounded
      v-tooltip.left="tooltip('About Us')"
      :pt:root:class="'bg-blue-500 border-blue-500'"
      class="shadow-md"
    />
  </div>
</template>

<script setup>
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

const { tooltip } = useResponsiveTooltip();
</script>
