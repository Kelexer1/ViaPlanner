<template>
    <div class="m-2 w-20">
        <label for="preferDayOffSwitch" class="block mb-0 text-sm font-bold">Prefer Day Off</label>
        <ToggleSwitch
            v-model="preferDayOff"
            :pt:slider:class="'PreferDayOffSwitchSlider'"
            :pt:input:id="'preferDayOffSwitch'"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';

const store = useTimetableStore();

const preferDayOff = ref(store.preferDayOff ?? false);

watch(preferDayOff, (val) => {
    if (val !== store.preferDayOff) {
        store.preferDayOff = val;
    }
});

watch(() => store.preferDayOff, (val) => {
    if (val !== preferDayOff.value) {
        preferDayOff.value = val;
    }
});
</script>

<style>
.PreferDayOffSwitchSlider[data-p="checked"] {
    background-color: var(--color-active) !important;
}
</style>