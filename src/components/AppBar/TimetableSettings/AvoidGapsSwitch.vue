<template>
    <div class="m-2">
        <label for="avoidGapsSwitch" class="block mb-0 text-sm font-bold">Avoid Gaps</label>
        <ToggleSwitch
            v-model="avoidGaps"
            :pt:slider:class="'AvoidGapsSwitchSlider'"
            :pt:input:id="'avoidGapsSwitch'"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';

const store = useTimetableStore();

const avoidGaps = ref(store.avoidGaps ?? true);

watch(avoidGaps, (val) => {
    if (val !== store.avoidGaps) {
        store.avoidGaps = val;
    }
});

watch(() => store.avoidGaps, (val) => {
    if (val !== avoidGaps.value) {
        avoidGaps.value = val;
    }
});
</script>

<style>
.AvoidGapsSwitchSlider[data-p="checked"] {
    background-color: var(--color-active) !important;
}
</style>