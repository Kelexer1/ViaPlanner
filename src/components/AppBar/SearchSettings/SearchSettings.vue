<template>
    <div>
        <Button
            icon="pi pi-search"
            @click="toggleSearchPanel"
            rounded
            v-tooltip.bottom="{
                value: 'Change Search Settings'
            }"
            :pt:icon:class="'text-white'"
        />
        <Popover
            ref="popover"
        >
            <SearchDivisionSelect/>
            <Divider/>
            <SearchSessionSelect/>
        </Popover>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import SearchDivisionSelect from './SearchDivisionSelect.vue';
import SearchSessionSelect from './SearchSessionSelect.vue';

const popover = ref(null)

function toggleSearchPanel(event) {
    popover.value.toggle(event);
}
</script>