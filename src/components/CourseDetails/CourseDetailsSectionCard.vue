<template>
    <div class="bg-coursecard-background rounded-md p-3">
        <div class="flex flex-row justify-between">
            <div class="flex flex-row gap-x-5">
                <RadioButton
                    v-model="sectionType.field"
                    :inputId="section.name"
                    :value="section.name"
                />
                <h2 class="text-md font-bold">
                    <span
                        v-if="sectionConflicts.length === 0"
                    >
                        {{ section.name }}
                    </span>
                    <span
                        v-else
                        class="text-yellow-500"
                        v-tooltip.bottom="{
                            value: `Conflicts with ${sectionConflicts.join(', ')}`
                        }"
                    >
                        {{ section.name }}
                    </span>
                    <span> ({{ getSectionDeliveryType(section.meetingTimes) }}) </span>
                    <span
                        v-if="section.openLimitInd === 'C'"
                        v-tooltip.bottom="{
                            value: 'You may not be able to enrol in this section on Acorn at this time',
                        }"
                        class="text-yellow-500"
                    >
                        (Unavailable)
                    </span>
                </h2>
            </div>
            <a
                v-if="courseData.campus === 'University of Toronto at Mississauga'"
                :href="`https://metis.utm.utoronto.ca/CourseInfo/syllabus_display.php?course=${courseData.code}/${courseData.sectionCode}/${section.name}/${section.deliveryModes[0].session}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-text-secondary">
                <u>View Syllabus</u>
            </a>
        </div>
        <div class="flex flex-row">
            <div class="w-1/2 p-4 bg-timetablesettings-background rounded-md ml-0 mr-3 mt-2">
                <CourseTimetable
                    :dateTimes="parseMeetingTimes(section.meetingTimes)"
                />
            </div>
            <div class="w-1/2">
                <!-- Instructors -->
                <p>
                    <span class="font-medium">Instructors: </span>
                    <span v-if="section.instructors && section.instructors.length">
                        {{ section.instructors.map(instructor => `${instructor.firstName} ${instructor.lastName}`).join(', ') }}
                    </span>
                    <span v-else>To be assigned</span>
                </p>
                <!-- Availability -->
                <p>
                    <span class="font-medium">Availability: </span>
                    <span :class="getAvailabilityHighlight((section.maxEnrolment - section.currentEnrolment) / section.maxEnrolment)">{{ section.maxEnrolment - section.currentEnrolment }} / {{ section.maxEnrolment }}</span>
                </p>
                <!-- Waitlist -->
                <p v-if="section.currentWaitlist">
                    <span class="font-medium">Waitlist: </span>
                    <span
                        :class="getWaitlistHighlight(section.currentWaitlist / section.maxEnrolment)"
                        v-tooltip.right="{
                            value: 'You are likely to get past the waitlist if your position is within 10% of the class size',
                        }"
                    >
                        {{ section.currentWaitlist }}
                    </span>
                </p>
                <!-- Enrolment Indicators -->
                <div class="flex flex-col">
                    <div
                        v-if="section.enrolmentInd"
                        class="flex flex-row items-center gap-x-3"
                    >
                        <p><span class="font-medium">Enrolment Controls: </span>{{ section.enrolmentInd }}</p>
                        <EnrolmentLegendPopup
                            v-if="divisionalData && divisionalEnrolmentIndicator && divisionalEnrolmentIndicator.codes"
                            :enrolmentIndicators="divisionalEnrolmentIndicator.codes"
                            :division="`${courseData.faculty.name} (${courseData.faculty.code})`"
                            :highlights="[section.enrolmentInd]"
                        />
                    </div>
                    <div>
                        <ul class="list-disc pl-2">
                            <li
                                v-for="control in section.enrolmentControls"
                            >
                                {{ control }}
                            </li>
                        </ul>
                    </div>
                </div>
                <br>
                <!-- Notes -->
                <p v-if="section.notes && section.notes.length" class="ml-0">
                    <span class="font-medium">Notes: </span>
                    <ul v-for="note in section.notes" :key="note.name" class="list-disc pl-2">
                        <li>{{ note.content.replace(/<[^>]*>/g, '') }}</li>
                    </ul>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTimetableStore } from '../../store/timetable';
import EnrolmentLegendPopup from './EnrolmentLegendPopup.vue';
import CourseTimetable from './CourseTimetable.vue';

const store = useTimetableStore();

const props = defineProps({
    sectionType: {
        type: Object,
        required: true
    },
    section: {
        type: Object,
        required: true
    },
    courseData: {
        type: Object,
        required: true
    },
    divisionalData: {
        type: Object,
        required: true
    }
});

const sectionConflicts = computed(() => {
    const conflicts = [];

    for (const session of props.courseData.sessions) {
        conflicts.push(...conflictsInSession(session))
    }

    return conflicts;
});

function conflictsInSession(sessionCode) {
    const conflicts = [];
    const currentMeetingTimes = Object.values(props.section.meetingTimes);

    const session = store.subsessionCodeToSession(sessionCode) // F or S
    const selectedSessionTimetable = store.timetables[session];
    if (!selectedSessionTimetable) {
        return conflicts;
    }

    for (const meetingTime of currentMeetingTimes) {
        if (meetingTime.sessionCode !== sessionCode) {
            continue;
        }

        const dayName = parseDayFull(meetingTime.day);
        const dayEvents = selectedSessionTimetable[dayName];

        if (!dayEvents || dayEvents.length === 0) {
            continue;
        }

        const currentStart = parseInt(meetingTime.start);
        const currentEnd = parseInt(meetingTime.end);

        for (const event of dayEvents) {
            if (event.course === props.courseData.code && event.activity.substring(0, 3) === props.sectionType.key) {
                continue;
            }

            const eventStart = parseInt(event.start);
            const eventEnd = parseInt(event.end);

            if (currentStart < eventEnd && currentEnd > eventStart) {
                if (!conflicts.includes(`${event.course} ${event.activity}`)) {
                    conflicts.push(`${event.course} ${event.activity}`)
                }
            }
        }
    }

    return conflicts;
}

const divisionalEnrolmentIndicator = computed(() => {
    return props.divisionalData.divisionalEnrolmentIndicators.data.data.find(indicator => indicator.division === props.courseData.faculty.code);
});

function getSectionDeliveryType(timeslots) {
    const regularSlots = timeslots.filter(timeslot => timeslot.building.buildingCode !== 'ZZ');

    var online = 0;
    var inPer = 0;

    for (const timeslot of regularSlots) {
        if (timeslot.building.buildingCode.length) {
            inPer++;
        } else {
            online++;
        }
    }

    if (online === regularSlots.length) {
        return 'Online';
    } else if (online) {
        return 'Hybrid';
    }

    return 'In Person';
}

function getAvailabilityHighlight(ratio) {
    if (ratio >= 0.5) {
        return 'highlightGreen';
    } else if (ratio > 0) {
        return 'highlightYellow';
    } else {
        return 'highlightRed';
    }
}

function getWaitlistHighlight(ratio) {
    if (ratio > 0.2) {
        return 'highlightRed';
    } else if (ratio > 0.1) {
        return 'highlightYellow';
    } else {
        return 'highlightGreen';
    }
}

function parseMeetingTimes(meetingTimes) {
    let result = {}

    for (const meetingTime of Object.values(meetingTimes)) {
        if (!Object.keys(result).includes(meetingTime.sessionCode)) {
            result[meetingTime.sessionCode] = [];
        }

        const formattedMeetingTime = {
            time: `${parseDay(meetingTime.day)} ${store.parseTime(meetingTime.start)} - ${store.parseTime(meetingTime.end)}`,
            location: meetingTime.building.buildingCode ? meetingTime.building.buildingCode : 'Online',
            locationURL: meetingTime.building.buildingUrl
        };

        result[meetingTime.sessionCode].push(formattedMeetingTime);
    }

    let formattedResult = {
        first: null,
        second: null
    };

    for (const session of Object.keys(result)) {
        for (let i = 0; i < result[session].length; i++) {
            if (result[session][i].location === 'ZZ') {
                result[session].push(result[session].splice(i, 1)[0]);
            }
        }

        if (['9', '5F', '5'].includes(session.substring(4))) {
            formattedResult.first = result[session];
        } else {
            formattedResult.second = result[session];
        }
    }

    return formattedResult;
}

function parseDay(dayInt) {
    switch (dayInt) {
    case 1:
        return 'Mon';
    case 2:
        return 'Tue';
    case 3:
        return 'Wed';
    case 4:
        return 'Thu';
    case 5:
        return 'Fri';
    case 6:
        return 'Sat';
    default:
        return 'Sun';
    }
}

function parseDayFull(dayInt) {
    switch (dayInt) {
    case 1:
        return 'Monday';
    case 2:
        return 'Tuesday';
    case 3:
        return 'Wednesday';
    case 4:
        return 'Thursday';
    case 5:
        return 'Friday';
    case 6:
        return 'Saturday';
    default:
        return 'Sunday';
    }
}
</script>

<style scoped>
.highlightRed {
    padding: 0 0.3rem;
    border-radius: 4px;
    border: 1px solid #ff4242;
    background-color: #f66;
}

.highlightYellow {
    padding: 0 0.3rem;
    border-radius: 4px;
    border: 1px solid #fddc20;
    background-color: #fde143;
}

.highlightGreen {
    padding: 0 0.3rem;
    border-radius: 4px;
    border: 1px solid #8ae736;
    background-color: #9deb56;
}
</style>