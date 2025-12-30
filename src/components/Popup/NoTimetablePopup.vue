<template>
  <div>
    <Dialog
      v-model:visible="visible"
      modal
      :style="{ 'max-width': '290px' }"
      :showHeader="false"
    >
      <h2 class="text-lg font-bold my-2">Warning</h2>
      <p>
        We are unable to generate one or more timetables based on your current course selection. There will likely be one or more conflicts in the resulting timetable.
      </p>
      <div class="flex justify-between mt-6">
        <Button
          @Click="visible = false"
          label="Abort"
        />
        <Button
          @click="visible = false"
          label="Proceed"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>
