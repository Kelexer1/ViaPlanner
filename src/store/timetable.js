import { defineStore } from 'pinia';
import axios from 'axios';

import genColor from 'color-generator';
import { generateTimetables } from '../timetable-planner/index2';

const darkSaturation = 0.4;
const darkLightness = 0.3;
const lightSaturation = 0.8;
const lightLightness = 0.85;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const useTimetableStore = defineStore('timetable', {

state: () => ({
    // Debug
    clearStorage: '3',


    // Site Settings
    darkMode: false,


    // Search Settings
    divisions: null,
    sessions: null,

    selectedDivisions: [],
    selectedSessionGroup: null,
    selectedSubsessions: [],


    // Session Data
    selectedSession: 'F',


    // Divisional Data (Legends etc.)
    divisionalLegends: null,
    divisionalEnrolmentIndicators: null,


    // Timetable Generation Settings
    prefferedStart: 9,
    prefferedMaxEnd: 15,
    avoidGaps: true,
    maxHours: 3,
    onlinePreference: 'Neutral',
    preferDayOff: false,
    includeUnavailable: true,


    // Detail Cards
    cards: [],


    // Timetable Data

    // [{
    //     day: Number,     The day the blocked time is on (1 = Monday, 2 = Tuesday ... 7 = Sunday)
    //     start: Number,   The start time in seconds after midnight
    //     end: Number      The end time in seconds after midnight
    // }]
    blockedTimes: {
        'F': [],
        'S': []
    },

    // {
    //     <courseCode>: {          The course code (ex. 'CSC108H5')
    //         lec: String,         The LEC number (null if none)
    //         tut: String,         The TUT number (null if none)
    //         pra: String          The PRA number (null if none)
    //         color: String,       The color associated with the course (hex format)
    //         courseData: Object   The JSON object containing all course data for the course (ex. meeting times, instructors, current enrolment, etc.)
    //     }
    // }
    selectedCourses: {
        'F': {},
        'S': {}
    },

    // <Day>: [{                The day of the week (ex. 'Monday')
    //     course: String,      The course code (ex. 'CSC108H5')
    //     activity: String,    The activity code (ex. 'LEC0101')
    //     day: Number,         The day the activity is on (1 = Monday, 2 = Tuesday ... 7 = Sunday)
    //     start: Number,       The start time in seconds after midnight
    //     end: Number          The end time in seconds after midnight
    // }]
    timetables: {
        'F': {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        },
        'S': {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        }
    },

    // {
    //     <courseCode>-<activity>: [{     The course code and activity (ex. 'CSC108H5-LEC0101')
    //         day: Number,     The day the locked section event is on (Monday = 1, Tuesday = 2 ... 7 = Sunday)
    //         start: Number,   The start time in seconds after midnight
    //         end: Number      The end time in seconds after midnight
    //     }]
    // }
    lockedSections: {
        'F': {},
        'S': {}
    },


    // Misc
    exportOverlay: false,
    aboutOverlay: false,
    conflictPopup: false,
    noTimetablePopup: false,
    sessionChangeWarning: false,
    tutorialPopup: !localStorage.visited,
    shareLinkPopup: false,

    shareLink: '',
    searchBarSuggestions: [],


    // History (Undo, Redo)
    history: [],
    historyIndex: 0
}),

// GETTERS
getters: {

},

// ACTIONS
actions: {
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.regenerateColors();

        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    setLockedHourStatus(hour, lock) {
        const start = hour * 3600; // Convert to seconds
        const end = start + 3600; // Blocker lasts 1 hour

        for (let day = 0; day < days.length; day++) {
            if (lock) {
                // Add a new blocker if none already exist
                if (!this.blockedTimes[this.selectedSession].some((blocker) => {
                    blocker.day === days[day] &&
                    blocker.start === start &&
                    blocker.end === end
                })) {
                    this.blockedTimes[this.selectedSession].push({
                        day: days[day],
                        start,
                        end
                    });
                }
            } else {
                this.blockedTimes[this.selectedSession] = this.blockedTimes[this.selectedSession].filter((blocker) => !(
                    blocker.day === days[day] &&
                    blocker.start === start &&
                    blocker.end === end
                ));
            }
        }
    },

    setLockedDayStatus(day, lock) {
        for (let hour = 8; hour <= 22; hour++) {
            const start = hour * 3600; // Convert to seconds
            const end = start + 3600; // Blocker lasts 1 hour

            if (lock) {
                // Add a new blocker if none already exist
                if (!this.blockedTimes[this.selectedSession].some((blocker) => {
                    blocker.day === day &&
                    blocker.start === start &&
                    blocker.end === end
                })) {
                    this.blockedTimes[this.selectedSession].push({
                        day,
                        start,
                        end
                    });
                }
            } else {
                this.blockedTimes[this.selectedSession] = this.blockedTimes[this.selectedSession].filter((blocker) => !(
                    blocker.day === day &&
                    blocker.start === start &&
                    blocker.end === end
                ));
            }
        }
    },

    setLockSection(course, activity, lock) {
        const key = `${course}-${activity}`;
        const sessionData = this.lockedSections[this.selectedSession];

        if (lock) {
            // Since this method can only really be called when the course is selected, we can just assume
            // that it exists in the selected courses dict
            const foundActivity = this.selectedCourses[this.selectedSession][course]
                .courseData.sections
                .find(section => section.name === activity);

            // Push the new blockers created from the activities course data
            this.lockedSections[this.selectedSession] = {
                ...sessionData,
                [key]: foundActivity.meetingTimes.map(({ day, start, end }) => ({ day, start, end }))
            };
        } else {
            const { [key]: _, ...rest } = sessionData;
            this.lockedSections[this.selectedSession] = rest;
        }
    },

    setBlockedTime(semester, day, start, end, block) {
        if (block) {
            this.blockedTimes[semester].push({
                day,
                start,
                end
            });
        } else {
            this.blockedTimes[semester] = this.blockedTimes[semester].filter(blocker => {
                return !(
                    blocker.day === day &&
                    blocker.start === start &&
                    blocker.end === end
                );
            });
        }
    },

    addCourse(course, lec, tut, pra, courseData) {
        for (const sessionCode of courseData.sessions) {
            const session = this.subsessionCodeToSession(sessionCode);
            this.selectedCourses[session][course] = {
                lec,
                tut,
                pra,
                color: genColor(this.darkMode ? darkSaturation : lightSaturation, this.darkMode ? darkLightness : lightLightness).hexString(),
                courseData
            }
        }

        // This is called by watchers in CourseDetailsPopup.vue, I'm too lazy to try to make it work here
        // if (lec) this.timetableRegisterActivity(courseData, lec);
        // if (tut) this.timetableRegisterActivity(courseData, tut);
        // if (pra) this.timetableRegisterActivity(courseData, pra);
    },

    removeCourse(course) {
        for (const session of ['F', 'S']) {
            // Remove course from selectedCourses
            delete this.selectedCourses[session][course];

            // Remove course from lockedSections
            const lockedSectionsKeys = Object.keys(this.lockedSections[session]).filter(blocker => {
                return blocker.split('-')[0] === course;
            });

            lockedSectionsKeys.forEach(key => {
                delete this.lockedSections[session][key];
            });

            // Remove course from timetable
            for (const day of Object.keys(this.timetables[session])) {
                this.timetables[session][day] = this.timetables[session][day]
                    .filter(event => {
                        return event.course !== course;
                    });
            }
        }

        this.removeUnusedCards();
    },

    regenerateColors() {
        for (const semester of Object.keys(this.selectedCourses)) {
            Object.values(this.selectedCourses[semester]).forEach(course => {
                course.color = genColor(this.darkMode ? darkSaturation : lightSaturation, this.darkMode ? darkLightness : lightLightness);
            });
        }
    },

    validateTimetables(timetables) {
        if (!timetables) {
            this.noTimetablePopup = true;
        } else {
            this.timetables['F'] = timetables['F'];
            this.timetables['S'] = timetables['S'];
        }
    },

    saveStateHistory() {
        const MAX_HISTORY = 25;

        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        const newHistory = {
            blockedTimes: JSON.parse(JSON.stringify(this.blockedTimes)),
            selectedCourses: JSON.parse(JSON.stringify(this.selectedCourses)),
            timetables: JSON.parse(JSON.stringify(this.timetables)),
            lockedSections: JSON.parse(JSON.stringify(this.lockedSections))
        };

        this.history.push(newHistory);
        this.historyIndex++;

        if (this.history.length > MAX_HISTORY) {
            this.history.shift();
            this.historyIndex--;
        }
    },

    initializeHistory() {
        this.history = [{
            blockedTimes: JSON.parse(JSON.stringify(this.blockedTimes)),
            selectedCourses: JSON.parse(JSON.stringify(this.selectedCourses)),
            timetables: JSON.parse(JSON.stringify(this.timetables)),
            lockedSections: JSON.parse(JSON.stringify(this.lockedSections))
        }];
        this.historyIndex = 0;
    },

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
        }
    },

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
        }
    },

    loadState(newState) {
        this.blockedTimes = newState.blockedTimes;
        this.selectedCourses = newState.selectedCourses;
        this.timetables = newState.timetables;
        this.lockedSections = newState.lockedSections;
    },

    registerDetailCard(course, sectionCode, props) {
        if (!this.cards.find(card => card.course === `${course} ${sectionCode}`)) {
            this.cards.push({ course: `${course} ${sectionCode}`, visible: false, props });
        }
    },

    removeDetailsCard(course) {
        this.cards = this.cards.filter(card => card.course !== course);
    },

    removeUnusedCards() {
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const cardCode = card.course.split(' ');

            // Delete if the card isnt being used by the search bar or any of the selected course menus
            if (!(this.searchBarSuggestions.includes(card.course) ||
                Object.keys(this.selectedCourses['F']).some(courseCode => this.selectedCourses['F'][courseCode].courseData.code === cardCode[0]) ||
                Object.keys(this.selectedCourses['S']).some(courseCode => this.selectedCourses['S'][courseCode].courseData.sectionCode === cardCode[1]))
            ) {
                this.cards.splice(i, 1); // Delete the card from the list
            }
        }
    },

    setDetailCardVisibility(course, visible) {
        const card = this.cards.find(card => card.course === course);
        if (card) {
            card.visible = visible;
        } else {
            console.log(`No card for ${course} ${sectionCode} was found`);
        }
    },

    async getDivisionalLegends() {
        if (!this.divisionalLegends || this.divisionalLegends.expiry < Date.now()) {
            try {
                const newDivisionalLegends = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/divisionalLegends`);
                this.divisionalLegends = {
                    expiry: Date.now() + (1 * 3600000), // Expires in 1 day
                    data: newDivisionalLegends
                };
            } catch (error) {
                console.error('Failed to retrieve divisional legends:', error.message);
                return null;
            }
        }

        return this.divisionalLegends.data;
    },

    async getDivisionalEnrolmentIndicators() {
        if (!this.divisionalEnrolmentIndicators || this.divisionalEnrolmentIndicators.expiry < Date.now()) {
            try {
                const newDivisionalEnrolmentIndicators = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/divisionalEnrolmentIndicators`);
                this.divisionalEnrolmentIndicators = {
                    expiry: Date.now() + (1 * 3600000), // Expires in 1 day
                    data: newDivisionalEnrolmentIndicators
                };
            } catch (error) {
                console.error('Failed to retrieve divisional enrolment indicators:', error.message);
                return null;
            }
        }

        return this.divisionalEnrolmentIndicators.data;
    },

    async getDivisions() {
        if (!this.divisions || this.divisions.expiry < Date.now()) {
            try {
                const newDivisions = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/referenceData`);
                this.divisions = {
                    expiry: Date.now() + (1 * 3600000), // Expires in 1 day
                    data: newDivisions.data.divisions,
                };
            } catch (error) {
                console.error('Failed to retrieve divisions:', error.message);
                return null;
            }
        }

        return this.divisions.data;
    },

    async getSessions() {
        if (!this.sessions || this.sessions.expiry < Date.now()) {
            try {
                const newSessions = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/referenceData`);
                this.sessions = {
                    expiry: Date.now() + (1 * 3600000), // Expires in 1 day
                    data: newSessions.data.sessions
                };
            } catch (error) {
                console.error('Failed to retrieve sessions:', error.message);
                return null;
            }
        }

        return this.sessions.data;
    },

    timetableRegisterActivity(courseData, activityName) {
        const activity = courseData.sections.find((section) => section.name === activityName);
        let session = '';

        if (activity) {
            for (const meetingTime of activity.meetingTimes) {
                const day = days[meetingTime.day - 1];
                session = this.subsessionCodeToSession(meetingTime.sessionCode);

                if (!this.timetables[session][day].some((timeslot) => {
                    timeslot.course === courseData.code &&
                    timeslot.activity === activityName &&
                    timeslot.start === meetingTime.start &&
                    timeslot.end === meetingTime.end
                })) {
                    this.timetables[session][day].push({
                        course: courseData.code,
                        activity: activityName,
                        start: meetingTime.start,
                        end: meetingTime.end
                    });
                }
            }

            this.selectedSession = session;
        }
    },

    timetableRemoveActivity(activityName) {
        for (const day of days) {
            this.timetables[this.selectedSession][day] = this.timetables[this.selectedSession][day].filter((event) => {
                event.activity !== activityName
            });
        }
    },

    timetableModifyActivity(courseData, newActivityName) {
        if (!Object.keys(this.selectedCourses[this.selectedSession]).includes(courseData.code)) {
            this.addCourse(courseData.code, null, null, null, courseData);
        }

        const activityMatch = newActivityName.match(/^[^\d]+/);
        const activityType = activityMatch ? activityMatch[0] : null;

        // Remove current activity type from timetable
        if (activityType) {
            for (const day of days) {
                this.timetables[this.selectedSession][day] = this.timetables[this.selectedSession][day].filter((event) => {
                    // Skip non-matching courses early
                    if (event.course !== courseData.code) {
                        return true;
                    }

                    // Check if the activity type matches
                    const eventMatch = event.activity.match(/^[^\d]+/);

                    if (eventMatch) {
                        // Exclude if the types match
                        return eventMatch[0] !== activityType
                    }

                    return true;
                });
            }
        }

        // Add new activity
        this.timetableRegisterActivity(courseData, newActivityName);
    },

    subsessionCodeToSession(subsessionCode) {
        // 20259 -> F
        for (const sessionGroup of this.sessions.data) {
            for (const subsession of sessionGroup.subsessions) {
                if (subsession.value === subsessionCode) {
                    const match = subsession.label.match(/\((.)\)/);

                    if (match) {
                        return match[1];
                    }
                }
            }
        }
    },

    parseTime(seconds) {
        const totalMins = Math.floor(seconds / 60);
        const hours = Math.floor(totalMins / 60);
        const mins = String(totalMins % 60).padStart(2, '0');

        const extension = hours < 12 ? 'AM' : 'PM';

        return `${hours % 12 === 0 ? 12 : hours % 12}:${mins} ${extension}`;
    },

    resetTimetable() {
        this.selectedCourses = {
            'F': {},
            'S': {}
        };

        this.timetables = {
            'F': {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            },
            'S': {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            }
        };

        this.lockedSections = {
            'F': {},
            'S': {}
        };
    }
},
persist: {
    key: 'timetable',
    storage: localStorage,
    serializer: {
        serialize: (state) => {
            const { cards, ...rest } = state;
            return JSON.stringify(rest);
        },
        deserialize: (value) => JSON.parse(value)
    }
}
});