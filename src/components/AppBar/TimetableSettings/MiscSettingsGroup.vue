<template>
    <div class="flex flex-row flex-wrap items-center justify-between">
        <OnlinePreferenceSelect/>
        <PreferDayOffSwitch/>
        <IncludeUnavailableSwitch/>
    </div>
</template>

<script setup>
import OnlinePreferenceSelect from './OnlinePreferenceSelect.vue';
import PreferDayOffSwitch from './PreferDayOffSwitch.vue';
import IncludeUnavailableSwitch from './IncludeUnavailableSwitch.vue';
</script>