<template>
    <div>
        <Button
            label="Build Timetable"
            icon="pi pi-calendar"
            iconPos="left"
            @click="buildTimetable()"
        />
    </div>
</template>

<script setup>
function buildTimetable() {
    alert('doing absolutely nothing of value as of the current time');
}
</script>