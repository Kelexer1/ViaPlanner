<template>
  <div>
    <Button
      @click="toggleHelpDial"
      rounded
      icon="pi pi-bars"
      :pt:icon:class="'text-white'"
      class="m-4"
    />
    <Popover
      ref="popover"
      :pt:root:style="{ 'background-color': 'transparent', 'box-shadow': 'none', 'border': 'none', 'margin-bottom': '0' }"
      :pt:root:class="'helpDialRoot'"
      :pt:content:class="'p-0'"
    >
      <div>
        <TutorialButton
          class="py-1"
        />
        <AboutButton
          class="py-1"
        />
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AboutButton from './AboutButton.vue';
import TutorialButton from './TutorialButton.vue';

const popover = ref(null);

function toggleHelpDial(event) {
  popover.value.toggle(event);
}
</script>

<style>
.helpDialRoot::before {
  content: none !important;
}

.helpDialRoot::after {
  content: none !important;
}
</style>