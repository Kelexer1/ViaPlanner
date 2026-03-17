<template>
    <div>
        <Button
            label="Build Timetable"
            icon="pi pi-calendar"
            iconPos="left"
            @click="() => store.generateTimetable()"
        />
    </div>
</template>

<script setup>
import { useTimetableStore } from '../../store/timetable';

const store = useTimetableStore();
</script>