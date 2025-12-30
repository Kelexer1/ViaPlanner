<template>
    <div>
        <Dialog
            v-model:visible="visible"
            modal
            :style="{ 'max-width': '290px' }"
            :showHeader="false"
        >
            <h2 class="text-lg font-bold my-2">Warning</h2>
            <p>
                Changing session groups will delete your current timetable and selected courses. Do you want to continue?
            </p>
            <div class="flex justify-between mt-6">
                <Button
                    @click="handleCancel"
                    label="Cancel"
                />
                <Button
                    @click="handleContinue"
                    label="Continue"
                />
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const visible = ref(false);

const emit = defineEmits(['update:visible', 'cancel', 'continue']);

watch(() => props.visible, (val) => {
    visible.value = val;
});

watch(visible, (val) => {
    emit('update:visible', val);
});

const handleCancel = () => {
    visible.value = false;
    emit('cancel');
}

const handleContinue = () => {
    visible.value = false;
    emit('continue');
}
</script>