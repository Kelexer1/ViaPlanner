<template>
  <div>
    <TutorialPopup/>
    <!-- todo exporting progress spinner -->
    <div class="flex flex-row h-[75px] items-center bg-main-accent">
      <img
        src="../assets/VIA-Logo-White.png"
        class="max-w-[130px] h-[60px] m-2 mr-0"
      >
      <Button
        icon="pi pi-replay"
        rounded
        @click="store.undo()"
        class="m-2 ml-4"
        v-tooltip.bottom="{
          value: 'Undo'
        }"
        :pt:icon:class="'text-white'"
      />
      <Button
        icon="pi pi-refresh"
        rounded
        @click="store.redo()"
        class="m-2 mr-4"
        v-tooltip.bottom="{
          value: 'Redo'
        }"
        :pt:icon:class="'text-white'"
      />
      <CourseSearchBar
        class="mr-2"
      />
      <div
        class="flex flex-row gap-2"
      >
        <ChangeTheme/>
        <SearchSettings/>
        <TimetableSettingsMenu/>
        <SessionSelect/>
        <BuildTimetableButton/>
      </div>
    </div>
    <div class="flex flex-row w-full">
      <div class="w-full">
        <router-view/>
        <div class="w-full flex flex-row items-center justify-center footer"><p class="my-3 font-medium">Copyright © 2026 VIAplanner</p></div>
      </div>
      <div class="w-[25%]">
        <SideBar/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTimetableStore } from '../store/timetable';
import TutorialPopup from '../components/Popup/TutorialPopup.vue';
import CourseSearchBar from '../components/AppBar/CourseSearchBar.vue';
import SessionSelect from '../components/AppBar/SessionSelect.vue';
import ChangeTheme from '../components/AppBar/ChangeTheme.vue';
import TimetableSettingsMenu from '../components/AppBar/TimetableSettings/TimetableSettingsMenu.vue';
import SideBar from '../components/SidePanel/SideBar.vue';
import SearchSettings from '../components/AppBar/SearchSettings/SearchSettings.vue';
import BuildTimetableButton from '../components/AppBar/BuildTimetableButton.vue';

const store = useTimetableStore();
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');
.footer {
  font-family: 'Montserrat', sans-serif;
}
</style>