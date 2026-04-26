import { defineStore } from 'pinia';
import axios from 'axios';

import genColor from 'color-generator';
import { getViaBuilderManager } from '../builder/builder';

const darkSaturation = 0.4;
const darkLightness = 0.3;
const lightSaturation = 0.8;
const lightLightness = 0.85;
const FETCH_CACHE_EXPIRY = 3 * 60 * 1000; // Expire in 3 mins (in ms)

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// For timetable builder, blocked timeslots are treated as a course with 1 section
const blockedTimesCourseCodePlaceholder = "BLOCKERS";

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
    maxDayLength: 6,
    minDayLength: 2,
    maxGap: 2,
    maxHours: 3,
    onlinePreference: 'Neutral',
    includeUnavailable: true,
    avoidRushHour: false,
    parameterProfile: 'Neutral',
    currentlyBuildingTimetable: false,


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
    blockedTimesPlaceholderCourse: {
        "code": blockedTimesCourseCodePlaceholder,
        "campus": "",
        "type": "",
        "sections": [{
            "name": "",
            "meetingTimes": []
        }]
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
    //     <courseCode>: [<activityCode>]  The locked activity codes for each course
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

    async setLockedHourStatus(hour, lock) {
        const start = hour * 3600; // Convert to seconds
        const end = start + 3600; // Blocker lasts 1 hour

        for (let day = 0; day < days.length; day++) {
            this.setBlockedTime(this.selectedSession, day, start, end, lock);
        }

        const manager = await getViaBuilderManager();
        manager.removeCourse(blockedTimesCourseCodePlaceholder, "");
        manager.addCourse(this.blockedTimesPlaceholderCourse);
        this.generateTimetable();
    },

    async setLockedDayStatus(day, lock) {
        let dayNum = days.indexOf(day);
        for (let hour = 8; hour <= 22; hour++) {
            const start = hour * 3600; // Convert to seconds
            const end = start + 3600; // Blocker lasts 1 hour

            this.setBlockedTime(this.selectedSession, dayNum, start, end, lock);
        }

        const manager = await getViaBuilderManager();
        manager.removeCourse(blockedTimesCourseCodePlaceholder, "");
        manager.addCourse(this.blockedTimesPlaceholderCourse);
        this.generateTimetable();
    },

    async setLockedTimeStatus(semester, day, start, end, lock) {
        let dayNum = days.indexOf(day);
        this.setBlockedTime(semester, dayNum, start, end, lock);

        const manager = await getViaBuilderManager();
        manager.removeCourse(blockedTimesCourseCodePlaceholder, "");
        manager.addCourse(this.blockedTimesPlaceholderCourse);
    },

    setBlockedTime(semester, day, start, end, block) {
        if (block) {
            // Add a new blocker if none already exist
            if (!this.blockedTimes[semester].some((blocker) => (
                blocker.day === days[day] &&
                blocker.start === start &&
                blocker.end === end
            ))) {
                this.blockedTimes[semester].push({
                    "day": days[day],
                    start,
                    end
                });
            }
            if (!this.blockedTimesPlaceholderCourse.sections[0].meetingTimes.some(blocker => (
                blocker.day === day &&
                blocker.start === start &&
                blocker.end === end
            ))) {
                this.blockedTimesPlaceholderCourse.sections[0].meetingTimes.push({
                    start,
                    end,
                    day,
                    "online": false,
                    "zz": true,
                    "semester": this.getSemesterIndex(semester)
                });
            }
        } else {
            this.blockedTimes[semester] = this.blockedTimes[semester].filter(blocker => !(
                blocker.day === days[day] && blocker.start === start && blocker.end === end
            ));
            this.blockedTimesPlaceholderCourse.sections[0].meetingTimes = 
                this.blockedTimesPlaceholderCourse.sections[0].meetingTimes.filter(blocker => !(
                    blocker.day === day && blocker.start === start && blocker.end === end
                ));
        }
    },

    syncBlockedTimesPlaceholderCourse() {
        const meetingTimes = [];

        for (const [semester, blockers] of Object.entries(this.blockedTimes)) {
            const semesterIndex = this.getSemesterIndex(semester);

            for (const blocker of blockers) {
                const dayIndex = typeof blocker.day === 'number' ? blocker.day : days.indexOf(blocker.day);
                if (dayIndex < 0) continue;

                meetingTimes.push({
                    start: blocker.start,
                    end: blocker.end,
                    day: dayIndex,
                    online: false,
                    zz: false,
                    semester: semesterIndex
                });
            }
        }

        this.blockedTimesPlaceholderCourse = {
            ...this.blockedTimesPlaceholderCourse,
            sections: [{
                ...this.blockedTimesPlaceholderCourse.sections[0],
                meetingTimes
            }]
        };
    },

    async loadBlockedTimesToBuilder() {
        this.syncBlockedTimesPlaceholderCourse();

        const manager = await getViaBuilderManager();
        manager.removeCourse(blockedTimesCourseCodePlaceholder, "");
        manager.addCourse(this.blockedTimesPlaceholderCourse);
    },

    async setLockedSectionStatus(course, activity, lock) {
        const sessionData = this.lockedSections[this.selectedSession];
        const courseData = this.selectedCourses[this.selectedSession][course];
        const lockedActivities = Array.isArray(sessionData[course]) ? sessionData[course] : [];
        const activityType = activity.slice(0, 3).toUpperCase();

        if (lock) {
            const nextLockedActivities = [
                ...lockedActivities.filter((lockedActivity) => lockedActivity.slice(0, 3).toUpperCase() !== activityType),
                activity
            ];

            if (JSON.stringify(nextLockedActivities) !== JSON.stringify(lockedActivities)) {
                this.lockedSections[this.selectedSession] = {
                    ...sessionData,
                    [course]: nextLockedActivities
                };
            }
        } else {
            const updatedActivities = lockedActivities.filter((lockedActivity) => lockedActivity !== activity);
            const nextLockedSections = {
                ...sessionData
            };

            if (updatedActivities.length === 0) {
                delete nextLockedSections[course];
            } else {
                nextLockedSections[course] = updatedActivities;
            }

            this.lockedSections[this.selectedSession] = {
                ...nextLockedSections
            };
        }

        const manager = await getViaBuilderManager();
        manager.removeCourse(course, activityType); // LEC TUT or PRA
        await this.addCourseToBuilder(courseData.courseData);
    },

    async addCourse(course, lec, tut, pra, courseData, shouldGenerate = true) {
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

        await this.addCourseToBuilder(courseData);
        if (shouldGenerate) {
            this.generateTimetable();
        }
    },

    async addCourseToBuilder(courseData) {
        const manager = await getViaBuilderManager();

        const lockedSectionsByType = {
            LEC: null,
            TUT: null,
            PRA: null
        };

        for (const session of ['F', 'S']) {
            const sessionLockedSections = this.lockedSections[session][courseData.code] || [];

            for (const lockedSection of sessionLockedSections) {
                const type = lockedSection.slice(0, 3).toUpperCase();
                if (!lockedSectionsByType[type]) {
                    lockedSectionsByType[type] = lockedSection;
                }
            }
        }

        // LEC, TUT, PRA
        const lecturesJSON = {};
        const tutorialsJSON = {};
        const practicalsJSON = {};

        for (const courseJSON of [lecturesJSON, tutorialsJSON, practicalsJSON]) {
            courseJSON["code"] = courseData["code"];
            courseJSON["campus"] = courseData["campus"];
            courseJSON["sections"] = [];
        }

        const sessionsToSemester = {};
        const match = this.selectedSessionGroup?.match(/-(\d+)-(\d+)/);
        if (match) {
            sessionsToSemester[match[1]] = 0;
            sessionsToSemester[match[2]] = 1;
        } else {
            courseData.sessions.forEach((sessionCode, index) => {
                sessionsToSemester[sessionCode] = index;
            });
        }

        for (const sectionData of courseData["sections"]) {
            const sectionJSON = {};

            sectionJSON["name"] = sectionData["name"];
            sectionJSON["meetingTimes"] = [];

            let hasMeetingTime = false;
            const meetingTimes = Array.isArray(sectionData["meetingTimes"]) ? sectionData["meetingTimes"] : Object.values(sectionData["meetingTimes"] || {});
            for (const meetingTimeData of meetingTimes) {
                const buildingCode = meetingTimeData["building"]["buildingCode"];
                const meetingTimeJSON = {};
                meetingTimeJSON["start"] = meetingTimeData["start"];
                meetingTimeJSON["end"] = meetingTimeData["end"];
                meetingTimeJSON["day"] = meetingTimeData["day"] - 1;
                meetingTimeJSON["online"] = (buildingCode === "");
                meetingTimeJSON["zz"] = (buildingCode === "ZZ");
                meetingTimeJSON["semester"] = sessionsToSemester[meetingTimeData["sessionCode"]];
                sectionJSON["meetingTimes"].push(meetingTimeJSON);
                hasMeetingTime = true;
            }

            if (!hasMeetingTime) continue;

            const sectionName = String(sectionData["name"] || '').toUpperCase();
            if (sectionName.startsWith('LEC')) {
                if (lockedSectionsByType.LEC && sectionName !== String(lockedSectionsByType.LEC).toUpperCase()) continue;
                lecturesJSON["sections"].push(sectionJSON);
            } else if (sectionName.startsWith('TUT')) {
                if (lockedSectionsByType.TUT && sectionName !== String(lockedSectionsByType.TUT).toUpperCase()) continue;
                tutorialsJSON["sections"].push(sectionJSON);
            } else if (sectionName.startsWith('PRA')) {
                if (lockedSectionsByType.PRA && sectionName !== String(lockedSectionsByType.PRA).toUpperCase()) continue;
                practicalsJSON["sections"].push(sectionJSON);
            }
        }

        manager.removeCourse(lecturesJSON["code"], "LEC");
        if (lecturesJSON["sections"].length > 0) {
            lecturesJSON["type"] = "LEC";

            manager.addCourse(lecturesJSON);
        }

        manager.removeCourse(tutorialsJSON["code"], "TUT");
        if (tutorialsJSON["sections"].length > 0) {
            tutorialsJSON["type"] = "TUT";
            manager.addCourse(tutorialsJSON);
        }

        manager.removeCourse(practicalsJSON["code"], "PRA");
        if (practicalsJSON["sections"].length > 0) {
            practicalsJSON["type"] = "PRA";
            manager.addCourse(practicalsJSON);
        }
    },

    async removeCourse(course) {
        for (const session of ['F', 'S']) {
            // Remove course from selectedCourses
            delete this.selectedCourses[session][course];

            // Remove course from lockedSections
            delete this.lockedSections[session][course];

            // Remove course from timetable
            for (const day of Object.keys(this.timetables[session])) {
                this.timetables[session][day] = this.timetables[session][day]
                    .filter(event => {
                        return event.course !== course;
                    });
            }
        }

        const manager = await getViaBuilderManager();

        for (const type of ["LEC", "TUT", "PRA"]) manager.removeCourse(course, type);

        this.removeUnusedCards();
        this.generateTimetable();
    },

    async generateTimetable() {
        if (this.currentlyBuildingTimetable) return;
        this.currentlyBuildingTimetable = true;
        const manager = await getViaBuilderManager();
        const timetable = manager.build();
        this.applyBuiltTimetable(timetable);
        this.currentlyBuildingTimetable = false;
    },

    applyBuiltTimetable(timetable) {
        const hasBuildFailure = timetable.some((entry) => {
            return entry["code"] !== blockedTimesCourseCodePlaceholder && entry["section"] === '';
        });

        if (hasBuildFailure) {
            this.noTimetablePopup = true;
            return;
        }

        this.noTimetablePopup = false;

        const normalizedTimetable = this.normalizeBuiltTimetable(timetable);

        for (const session of Object.keys(normalizedTimetable)) {
            for (const course of normalizedTimetable[session]) {
                if (course["code"] === blockedTimesCourseCodePlaceholder) continue;
                const courseData = this.selectedCourses[session][course["code"]];
                if (!courseData) continue;
                switch (course["type"]) {
                case "LEC":
                    courseData["lec"] = course["section"];
                    break;
                case "TUT":
                    courseData["tut"] = course["section"];
                    break;
                case "PRA":
                    courseData["pra"] = course["section"];
                    break;
                default:
                    continue;
                }

                this.timetableModifyActivity(courseData["courseData"], course["section"]);
            }
        }
    },

    normalizeBuiltTimetable(timetable) {
        const normalized = { F: [], S: [] };

        for (const entry of timetable) {
            if (!entry || entry["code"] === blockedTimesCourseCodePlaceholder) {
                continue;
            }

            const candidateSessions = ["F", "S"].filter((session) => {
                return !!this.selectedCourses[session][entry["code"]];
            });

            if (candidateSessions.length === 1) {
                normalized[candidateSessions[0]].push(entry);
                continue;
            }

            if (candidateSessions.length > 1) {
                const matchedSessions = candidateSessions.filter((session) => {
                    const selectedCourse = this.selectedCourses[session][entry["code"]];
                    const sectionData = selectedCourse?.courseData?.sections?.find((section) => section.name === entry["section"]);
                    if (!sectionData) return false;

                    const meetingTimes = Array.isArray(sectionData.meetingTimes)
                        ? sectionData.meetingTimes
                        : Object.values(sectionData.meetingTimes || {});

                    return meetingTimes.some((meetingTime) => this.subsessionCodeToSession(meetingTime.sessionCode) === session);
                });

                for (const session of (matchedSessions.length > 0 ? matchedSessions : candidateSessions)) {
                    normalized[session].push(entry);
                }
            }
        }

        return normalized;
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

        const lastHistory = this.history[this.historyIndex];
        if (JSON.stringify(newHistory) === JSON.stringify(lastHistory)) return;

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
            console.log(`No card for ${course} was found`);
        }
    },

    async getDivisionalLegends() {
        if (!this.divisionalLegends || this.divisionalLegends.expiry < Date.now()) {
            try {
                const newDivisionalLegends = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/divisionalLegends`);
                this.divisionalLegends = {
                    expiry: Date.now() + FETCH_CACHE_EXPIRY, // Expires in 3 minutes
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
                    expiry: Date.now() + FETCH_CACHE_EXPIRY, // Expires in 3 minutes
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
                    expiry: Date.now() + FETCH_CACHE_EXPIRY, // Expires in 3 minutes
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
                    expiry: Date.now() + FETCH_CACHE_EXPIRY, // Expires in 3 minutes
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

                if (!this.timetables[session][day].some((timeslot) => (
                    timeslot.course === courseData.code &&
                    timeslot.activity === activityName &&
                    timeslot.start === meetingTime.start &&
                    timeslot.end === meetingTime.end
                ))) {
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
            this.timetables[this.selectedSession][day] = this.timetables[this.selectedSession][day].filter((event) => (
                event.activity !== activityName
            ));
        }
    },

    async timetableModifyActivity(courseData, newActivityName, lockAndGenerate = false) {
        const activityMatch = newActivityName.match(/^[^\d]+/);
        const activityType = activityMatch ? activityMatch[0] : null;

        if (!activityType) {
            return;
        }

        const courseExists = ['F', 'S'].some((session) => Object.prototype.hasOwnProperty.call(this.selectedCourses[session], courseData.code));
        if (!courseExists) await this.addCourse(courseData.code, null, null, null, courseData, false);

        for (const session of ['F', 'S']) {
            const selectedCourse = this.selectedCourses[session][courseData.code];
            if (!selectedCourse) continue;

            if (activityType === 'LEC') selectedCourse.lec = newActivityName;
            else if (activityType === 'TUT') selectedCourse.tut = newActivityName;
            else if (activityType === 'PRA') selectedCourse.pra = newActivityName;
        }

        // Remove current activity type from timetable
        for (const session of ['F', 'S']) {
            if (!this.selectedCourses[session][courseData.code]) continue;

            for (const day of days) {
                this.timetables[session][day] = this.timetables[session][day].filter((event) => {
                    // Skip non-matching courses early
                    if (event.course !== courseData.code) return true;

                    // Check if the activity type matches
                    const eventMatch = event.activity.match(/^[^\d]+/);

                    // Exclude if the types match
                    if (eventMatch) return eventMatch[0] !== activityType

                    return true;
                });
            }
        }

        // Add new activity
        this.timetableRegisterActivity(courseData, newActivityName);

        if (lockAndGenerate) {
            await this.setLockedSectionStatus(courseData.code, newActivityName, true);
            await this.generateTimetable();
        }
    },

    subsessionCodeToSession(subsessionCode) {
        if (!this.sessions || !this.sessions.data) {
            return undefined;
        }

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

    getSemesterIndex(semester) {
        return semester === "F" ? 0 : 1;
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
    },

    async updatePreferences() {
        const manager = await getViaBuilderManager();
        manager.setPreferences({
            "MAX_GAP": this.maxGap,
            "MAX_DAY_LENGTH": this.maxDayLength,
            "MIN_DAY_LENGTH": this.minDayLength,
            "MAX_CONTINUOUS_CLASSES": this.maxHours,
            "PREFFERED_MIN_START": this.prefferedStart * 3600,
            "PREFFERED_MAX_END": this.prefferedMaxEnd * 3600,
            "GUARANTEE_CROSS_CAMPUS_GAP": true,
            "AVOID_RUSH_HOURS": this.avoidRushHour,
            "ONLINE_PREFERENCE": this.onlinePreference === "Avoid" ? 0 : this.onlinePreference === "Prefer" ? 1 : 2
        })
    }
},
persist: {
    key: 'timetable',
    storage: localStorage,
    serializer: {
        serialize: (state) => {
            const {
                cards,
                history,
                historyIndex,
                currentlyBuildingTimetable,
                ...rest
            } = state;
            return JSON.stringify(rest);
        },
        deserialize: (value) => JSON.parse(value)
    }
}
});