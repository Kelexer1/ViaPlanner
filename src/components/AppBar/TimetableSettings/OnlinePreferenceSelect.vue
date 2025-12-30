<template>
    <div class="m-2">
        <label for="onlinePreferenceSetting" class="block mb-0 text-sm font-bold">Online Preference</label>
        <SelectButton
            v-model="onlinePreference"
            :options="options"
            :allowEmpty="false"
            :pt:root:class="'shadow-md'"
            :pt:pcToggleButton:root:id="'onlinePreferenceSetting'"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';

const store = useTimetableStore();

const onlinePreference = ref(store.onlinePreference ?? 'Neutral');

const options = ref([
    'Avoid',
    'Neutral',
    'Prefer'
]);

watch(onlinePreference, (val) => {
    if (val !== store.onlinePreference) {
        store.onlinePreference = val;
    }
});

watch(() => store.onlinePreference, (val) => {
    if (val !== onlinePreference.value) {
        onlinePreference.value = val;
    }
});
</script>