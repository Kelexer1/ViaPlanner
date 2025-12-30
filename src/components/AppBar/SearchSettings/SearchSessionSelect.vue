<template>
    <div>
        <h2
            class="font-bold text-lg"
        >
            Select Sessions
        </h2>
        <div
            v-for="sessionGroup of sessionGroups"
            :key="sessionGroup.group"
        >
            <div
                class="gap-2 flex items-center"
            >
                <RadioButton
                    @change="handleSessionGroupChangeRequest(sessionGroup)"
                    :inputId="sessionGroup.group"
                    :value="sessionGroup.group"
                    name="sessionGroup"
                    :modelValue="selectedSessionGroup"
                />
                <label :for="sessionGroup.group">{{ sessionGroup.label }}</label>
            </div>
            <div
                v-for="subsession of sessionGroup.subsessions"
                :key="subsession.value"
                class="pl-4 gap-2 flex items-center"
            >
                <Checkbox
                    v-model="selectedSubsessions"
                    :inputId="subsession.value"
                    :value="subsession.value"
                    name="subsession"
                    :disabled="sessionGroup.group !== selectedSessionGroup"
                />
                <label :for="subsession.value">{{ subsession.label }}</label>
            </div>
        </div>
    </div>
    <ChangeSessionGroup
        v-model:visible="confirmDialogVisible"
        @cancel="cancelChange"
        @continue="confirmChange"
    />
</template>

<script setup>
import { ref, watchEffect, watch } from 'vue';
import { useTimetableStore } from '../../../store/timetable';
import ChangeSessionGroup from '../../Popup/ChangeSessionGroup.vue';

const store = useTimetableStore();

const selectedSessionGroup = ref(store.selectedSessionGroup);
const selectedSubsessions = ref(Array.isArray(store.selectedSubsessions) ? [...store.selectedSubsessions] : []);

const sessionGroups = ref([]);
const confirmDialogVisible = ref(false);
const pendingSessionGroup = ref(null);

function handleSessionGroupChangeRequest(sessionGroup) {
    pendingSessionGroup.value = sessionGroup;
    confirmDialogVisible.value = true;
}

function cancelChange() {
    confirmDialogVisible.value = false;
    pendingSessionGroup.value = null;
}

function confirmChange() {
    if (pendingSessionGroup.value) {
        selectedSessionGroup.value = pendingSessionGroup.value.group;
        store.selectedSessionGroup = pendingSessionGroup.value.group;

        if (pendingSessionGroup.value.subsessions) {
            selectedSubsessions.value = pendingSessionGroup.value.subsessions.map(subsession => subsession.value);
        }
    }

    confirmDialogVisible.value = false;
    pendingSessionGroup.value = null;
    store.resetTimetable();
}

watch(() => store.selectedSessionGroup, (val) => {
    if (val !== selectedSessionGroup.value) {
        selectedSessionGroup.value = val;
    }
});

watch(selectedSubsessions, (val) => {
    if (JSON.stringify(val) !== JSON.stringify(store.selectedSubsessions)) {
        store.selectedSubsessions = val;
    }
});

watch(() => store.selectedSubsessions, (val) => {
    if (JSON.stringify(val) !== JSON.stringify(selectedSubsessions.value)) {
        selectedSubsessions.value = [...val || []];
    }
});

watchEffect(async () => {
    sessionGroups.value = await store.getSessions();
});
</script>