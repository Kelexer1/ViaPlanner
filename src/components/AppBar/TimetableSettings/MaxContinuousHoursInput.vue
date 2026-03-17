<template>
    <div class="m-2">
        <label for="maxHoursInput" class="block mb-0 text-sm font-bold">Max Continuous Classes</label>
        <InputNumber
            v-model="maxHours"
            suffix=" Hours"
            :min="1"
            :max="12"
            showButtons
            buttonLayout="stacked"
            inputClass="MaxHoursInput"
            placeholder="3 Hours"
            :pt:pcInputText:root:id="'maxHoursInput'"
        />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';

const store = useTimetableStore();

const maxHours = ref(store.maxHours ?? 3);

watch(maxHours, (val) => {
    if (val !== store.maxHours) {
        store.maxHours = val;
    }
});

watch(() => store.maxHours, (val) => {
    if (val !== maxHours.value) {
        maxHours.value = val;
    }
});
</script>

<style>
.MaxHoursInput {
    color: var(--color-text-primary);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
    width: 11rem;
}
</style>