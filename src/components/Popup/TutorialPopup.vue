<template>
  <div>
    <Dialog @close="dialogClosed" v-model:visible="visible" modal header="Welcome to VIAplanner!"
      :style="{ 'width': 'auto', 'max-width': 'min(1200px, 100vw)' }">
      <Carousel :value="tutorialSteps" :numVisible="1" :numScroll="1">
        <template #item="slotProps">
          <div>
            <h2 class="text-lg font-bold">{{ slotProps.data.step }}: {{ slotProps.data.title }}</h2>
            <p>{{ slotProps.data.description }}</p>
            <div class="mb-4">
              <img :src="slotProps.data.path" class="object-contain w-full max-h-[60vh] m-4">
            </div>
          </div>
        </template>
      </Carousel>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue';
import { useTimetableStore } from '../../store/timetable';

// @ts-ignore
import genColor from 'color-generator';

import tut1 from '../../assets/tut1.gif';
import tut2 from '../../assets/tut2.gif';
import tut3 from '../../assets/tut3.gif';
import tut4 from '../../assets/tut4.gif';
import tut5 from '../../assets/tut5.gif';
import tut6 from '../../assets/tut6.gif';

const store = useTimetableStore() as any;

const visible: Ref<boolean> = ref(store.tutorialPopup);

watch(() => store.tutorialPopup, (val: boolean) => {
  if (val !== visible.value) visible.value = val;
});

watch(visible, (val: boolean) => {
  if (store.tutorialPopup !== val) store.tutorialPopup = val;
});

const tutorialSteps = [
  {
    step: 'Step 1',
    title: 'Select some courses',
    path: tut1,
    description:
      'Just click on a course and we will generate a timetable',
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
  {
    step: 'Step 2',
    title: 'Adjust your times',
    path: tut2,
    description:
      'Click on the pencil icon or the course to adjust the times',
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
  {
    step: 'Step 3',
    title: 'Select and lock',
    path: tut3,
    description:
      "Block rows and columns and we won't schedule those times",
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
  {
    step: 'Step 4',
    title: 'Switch between semesters',
    path: tut4,
    description:
      'Click on the top right to switch between fall and winter',
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
  {
    step: 'Step 5',
    title: 'Export timetables',
    path: tut5,
    description: 'Export your timetables as png',
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
  {
    step: 'Step 6',
    title: 'Lock Courses',
    path: tut6,
    description: "Lock your courses in place and we won't move it",
    backgroundColor: genColor(0.7, 0.85).hexString(),
  },
]

function dialogClosed() {
  store.tutorialPopup = false;
}
</script>