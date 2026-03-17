<template>
    <div class="flex flex-col items-start justify-between">
        <div class="flex flex-row items-start justify-between">
            <TimeSettingSelect v-model:output="start" label="Pref. Min Start" defaultValue="9am"/>
            <TimeSettingSelect v-model:output="maxEnd" label="Pref. Max End" defaultValue="3pm"/>
        </div>
        <div class="flex flex-row items-start justify-between">
            <MaxDayLengthInput/>
            <MinDayLengthInput/>            
        </div>
    </div>

</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';
import TimeSettingSelect from './TimeSettingSelect.vue';
import MaxDayLengthInput from './MaxDayLengthInput.vue';
import MinDayLengthInput from './MinDayLengthInput.vue';

const store = useTimetableStore();

const start = ref(store.prefferedStart || 9);
const maxEnd = ref(store.prefferedMaxEnd || 15);

watch(start, (val) => {
    if (val !== store.start) {
        store.prefferedStart = val;
    }
});

watch(() => store.start, (val) => {
    if (val !== start.value) {
        start.value = val;
    }
});

watch(maxEnd, (val) => {
    if (val !== store.maxEnd) {
        store.prefferedMaxEnd = val;
    }
});

watch(() => store.maxEnd, (val) => {
    if (val !== maxEnd.value) {
        maxEnd.value = val;
    }
});
</script>