<template>
    <div>
        <Drawer
          v-model:visible="visible"
          header="Timetable Generation Settings"
          :dismissable="true"
          position="right"
          :pt:root:class="'w-[26rem]'"
          :pt:header:class="'text-text-secondary'"
        >
          <div class="w-full flex justify-center">
            <BuildTimetableButton/>
          </div>
          <TextDivider text="Time Settings"/>
          <PrefferedTimeSettingsGroup />
          <TextDivider text="Gap Settings"/>
          <PrefferedGapSettingsGroup />
          <TextDivider text="Misc. Settings"/>
          <MiscSettingsGroup />
        </Drawer>
        <Button
          icon="pi pi-cog"
          rounded
          v-tooltip.bottom="{
            value: 'Timetable Settings'
          }"
          @click="visible = true"
          :pt:icon:class="'text-white'"
        />
    </div>
</template>

<script setup>
import TextDivider from '../../Misc/TextDivider.vue';

import BuildTimetableButton from './BuildTimetableButton.vue';
import PrefferedTimeSettingsGroup from './PrefferedTimeSettingsGroup.vue';
import PrefferedGapSettingsGroup from './PrefferedGapSettingsGroup.vue';
import MiscSettingsGroup from './MiscSettingsGroup.vue';

import { ref } from 'vue';

const visible = ref(false);
</script>