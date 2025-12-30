<template>
    <div class="m-2">
        <label class="block mb-0 text-sm font-bold">
            {{ label }}
            <Select
                v-model="internalValue"
                :options="times"
                optionLabel="display"
                optionValue="numerical"
                filter
                :pt:root:class="'border-transparent hover:border-active w-30 font-normal !shadow-md'"
                :pt:overlay:class="'border-none'"
                :pt:option:class="'TimeSettingOption'"
                :pt:pcFilter:root:class="'text-text-primary rounded-sm focus-within:outline-none caret-text-primary pl-3 py-2 bg-content-hover-background'"
            />
        </label>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const times = ref([
    { display: '9 AM' ,  numerical: 9 },
    { display: '10 AM' , numerical: 10 },
    { display: '11 AM' , numerical: 11 },
    { display: '12 PM' , numerical: 12 },
    { display: '1 PM' ,  numerical: 13 },
    { display: '2 PM' ,  numerical: 14 },
    { display: '3 PM' ,  numerical: 15 },
    { display: '4 PM' ,  numerical: 16 },
    { display: '5 PM' ,  numerical: 17 },
    { display: '6 PM' ,  numerical: 18 },
    { display: '7 PM' ,  numerical: 19 },
    { display: '8 PM' ,  numerical: 20 },
    { display: '9 PM' ,  numerical: 21 },
    { display: '10 PM' , numerical: 22 },
]);

const props = defineProps({
    output: {
        type: [Object, Number],
    },
    label: {
        type: String,
        default: 'Enter time'
    },
    defaultValue: {
        type: String,
        default: '9 AM'
    }
});

const emit = defineEmits([
    'update:output'
]);

const internalValue = ref(props.output ?? props.defaultValue);

watch(internalValue, (val) => {
    emit('update:output', val)
});
</script>

<style>
.TimeSettingOption:hover {
    background-color: var(--color-content-hover-background);
}
</style>