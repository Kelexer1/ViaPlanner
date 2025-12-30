<template>
    <div>
        <CourseDetailsPopup
            v-for="card of visibleCards"
            :key="card.course"
            v-bind="card.props"
            @close="store.setDetailCardVisibility(card.course, false)"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTimetableStore } from '../../store/timetable';

import CourseDetailsPopup from './CourseDetailsPopup.vue';

const store = useTimetableStore();

const visibleCards = computed(() => {
    return store.cards.filter(card => card && card.visible);
})
</script>