<template>
    <div>
        <Dialog
            v-model:visible="visible"
            :style="{width: '70vw'}"
            :draggable="false"
            @update:visible="handleVisibleUpdate"
        >
            <!-- Header -->
            <template #header>
                <div class="flex flex-row justify-between w-full items-center">
                    <h2 class="text-2xl font-bold">{{ `${courseData.code} ${courseData.sectionCode} - ${courseData.name}` }}</h2>
                    <Button
                        @click="addCourse()"
                        icon="pi pi-plus"
                        label="Quick Add Course"
                        class="mr-3"
                        :pt:icon:class="'text-white'"
                        :pt:label:class="'text-white'"
                    />
                </div>
            </template>
            <!-- Icon Bar -->
            <div class="flex flex-row gap-x-3">
                <!-- Campus-->
                <span class="flex items-center gap-2">
                    <i class="pi pi-home"></i>
                    <span>{{ courseData.campus }}</span>
                </span>
                <!-- Session -->
                <span class="flex items-center gap-2">
                    <i class="pi pi-clock"></i>
                    <span>{{ parseSession(courseData.sessions) }}</span>
                </span>
                <!-- Distribution Requirement -->
                <span class="flex items-center gap-2">
                    <i class="pi pi-graduation-cap"></i>
                    <span>{{ courseData.maxCredit }} Credits ({{ parseDistributionRequirements(courseData.breadths) }})</span>
                </span>
                <!-- View Legend Button -->
                <DivisionalLegend
                    v-if="divisionalData && divisionalLegend.content"
                    :division="`${courseData.faculty.name} (${courseData.faculty.code})`"
                    :content="divisionalLegend.content"
                />
            </div >
            <!-- Info Blocks -->
            <div class="flex flex-row mt-3 w-full">
                <div class="w-[60%] pr-8">
                    <h3 class="text-md font-bold">Description</h3>
                    <!-- Description -->
                    <p>{{ courseData.cmCourseInfo.description }}</p>
                    <h3 class="text-md font-bold mt-3">Department Info</h3>
                    <!-- Department -->
                    <p><span class="font-medium">Department: </span>{{ courseData.department.name }}</p>
                    <!-- Faculty -->
                    <p><span class="font-medium">Faculty: </span>{{ courseData.faculty.name }}</p>
                </div>
                <div class="flex flex-col w-[40%]">
                    <h3 class="text-md font-bold">Requisite Info</h3>
                    <p v-if="courseData.cmCourseInfo.prerequisitesText"><span class="font-medium">Prerequisites: </span>{{ courseData.cmCourseInfo.prerequisitesText }}</p> <!-- Prerequisites -->
                    <p v-if="courseData.cmCourseInfo.exclusionsText"><span class="font-medium">Exclusions: </span>{{ courseData.cmCourseInfo.exclusionsText }}</p> <!-- Exclusions -->
                    <p v-if="courseData.cmCourseInfo.corequisitesText"><span class="font-medium">Corequisites: </span>{{ courseData.cmCourseInfo.corequisitesText }}</p> <!-- Corequisites -->
                    <p v-if="courseData.cmCourseInfo.recommendedPreparation"><span class="font-medium">Recommended Preparation: </span>{{ courseData.cmCourseInfo.recommendedPreparation }}</p> <!-- Recommended Prep -->
                </div>
            </div>
            <!-- Section List -->
            <Accordion
                :value="['0']"
                :multiple="true"
            >
                <template v-for="type in sectionTypes" :key="type.key">
                    <AccordionPanel
                        v-if="courseData.sections.some(section => section.type === type.label)"
                        :value="type.key"
                    >
                        <AccordionHeader>
                            <h2 class="text-lg font-bold">{{ type.label }}s</h2>
                        </AccordionHeader>
                        <AccordionContent
                            v-for="section in courseData.sections.filter(section => section.type === type.label).sort((s1, s2) => parseInt(s1.name.match(/\d+(?!\d)/)) - parseInt(s2.name.match(/\d+(?!\d)/)))"
                            :key="section.name"
                        >
                            <CourseDetailsSectionCard
                                :sectionType="type"
                                :section="section"
                                :courseData="courseData"
                                :divisionalData="divisionalData"
                            />
                        </AccordionContent>
                    </AccordionPanel>
                </template>
            </Accordion>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTimetableStore } from '../../store/timetable';
import DivisionalLegend from './DivisionalLegend.vue';
import CourseDetailsSectionCard from './CourseDetailsSectionCard.vue';

const store = useTimetableStore();

const visible = ref(true);

const selectedLec = ref(null);
const selectedTut = ref(null);
const selectedPra = ref(null);

watch(selectedLec, (val) => { if (val) store.timetableModifyActivity(props.courseData, val); store.saveStateHistory(); });
watch(selectedTut, (val) => { if (val) store.timetableModifyActivity(props.courseData, val); store.saveStateHistory(); });
watch(selectedPra, (val) => { if (val) store.timetableModifyActivity(props.courseData, val); store.saveStateHistory(); });

const sectionTypes = [
    { key: 'LEC', label: 'Lecture', field: selectedLec },
    { key: 'TUT', label: 'Tutorial', field: selectedTut },
    { key: 'PRA', label: 'Practical', field: selectedPra }
];

const props = defineProps({
    courseData: {
        type: Object,
        required: true
    },
    divisionalData: {
        type: Object,
        required: false
    }
});

const divisionalLegend = computed(() => {
    return props.divisionalData.divisionalLegends.data.data.find(legend => legend.division === props.courseData.faculty.code);
});

async function addCourse() {
    // Remove any old references to prevent duplicates
    await store.removeCourse(props.courseData.code);

    // todo make this choose very basic 'good' spots with some bad algorithm for speed
    const lecs = props.courseData.sections.filter((section) => section.type === 'Lecture');
    const tuts = props.courseData.sections.filter((section) => section.type === 'Tutorial');
    const pras = props.courseData.sections.filter((section) => section.type === 'Practical');

    const lec = lecs.length > 0 ? lecs[0].name : null;
    const tut = tuts.length > 0 ? tuts[0].name : null;
    const pra = pras.length > 0 ? pras[0].name : null;

    selectedLec.value = lec;
    selectedTut.value = tut;
    selectedPra.value = pra;

    await store.addCourse(props.courseData.code, lec, tut, pra, props.courseData);
    store.saveStateHistory();
}

function parseSession(sessions) {
    return sessions.map(session => {
        if (session.length < 5) {
            return 'INVALID_DATE';
        }

        const year = session.substring(0, 4);
        const month = session.substring(4, 5);

        const sessionName = session.length === 6 ? (session.substring(6) === 'F' ? 'Summer First Subsession' : 'Summer Second Subsession') : (month === '9' ? 'Fall' : 'Winter');

        return `${year} ${sessionName}`;
    }).join(' - ');
}

function parseDistributionRequirements(distributionRequirements) {
    return distributionRequirements.map(distribution => {
        return distribution.breadthTypes && distribution.breadthTypes.length ? distribution.breadthTypes[0].type : '';
    })
    .filter(requirement => requirement)
    .join(', ')
}

const handleVisibleUpdate = (value) => {
    if (!value) {
        store.setDetailCardVisibility(`${props.courseData.code} ${props.courseData.sectionCode}`, false);
    }
}
</script>