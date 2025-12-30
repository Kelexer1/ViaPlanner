<template>
    <div class="m-2 w-35">
        <label for="includeUnavailableSwitch" class="block mb-0 text-sm font-bold">Include Unavailable Sections</label>
        <ToggleSwitch
            v-model="includeUnavailable"
            :pt:slider:class="'IncludeUnavailableSwitchSlider'"
            :pt:input:id="'includeUnavailableSwitch'"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';

const store = useTimetableStore();

const includeUnavailable = ref(store.includeUnavailable ?? false);

watch(includeUnavailable, (val) => {
    if (val !== store.includeUnavailable) {
        store.includeUnavailable = val;
    }
});

watch(() => store.includeUnavailable, (val) => {
    if (val !== includeUnavailable.value) {
        includeUnavailable.value = val;
    }
});
</script>

<style>
.IncludeUnavailableSwitchSlider[data-p="checked"] {
    background-color: var(--color-active) !important;
}
</style>