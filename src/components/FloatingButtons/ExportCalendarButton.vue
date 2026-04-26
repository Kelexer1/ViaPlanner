<template>
  <div>
    <Button
      @click="exportTimetables()"
      rounded
      icon="pi pi-download"
      v-tooltip.left="tooltip('Export Timetables')"
    />

    <div
      v-if="exportSemester"
      aria-hidden="true"
      class="export-template-stage"
    >
      <ExportTimetableTemplate
        :semester="exportSemester"
        :timetable="store.timetables[exportSemester]"
        :title="exportTitle"
      />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import html2canvas from 'html2canvas';
import { useTimetableStore } from '../../store/timetable';
import ExportTimetableTemplate from './ExportTimetableTemplate.vue';
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

const store = useTimetableStore();
const { tooltip } = useResponsiveTooltip();
const exportSemester = ref(null);
const exportTitle = ref('');

function getSemesterTitle(sessions, semester) {
  const sessionGroup = sessions.find((group) => group.group === store.selectedSessionGroup);

  if (!sessionGroup) {
    return "";
  }

  const sessionKey = ` (${semester})`;
  const subsession = sessionGroup.subsessions.find((entry) => entry.label.includes(sessionKey));

  return subsession ? subsession.label.replace(sessionKey, '') : getFallbackTitle(semester);
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

async function captureSemester(semester, title) {
  store.selectedSession = semester;
  exportSemester.value = semester;
  exportTitle.value = title;

  await nextTick();
  await new Promise(resolve => requestAnimationFrame(resolve));
  await nextTick();

  const elementId = `exportTemplate-${semester}`;
  const timetableElement = document.getElementById(elementId);

  if (!timetableElement) {
    return;
  }

  const canvas = await html2canvas(timetableElement, {
    backgroundColor: '#ffffff',
    useCORS: true,
    scale: 2
  });

  downloadCanvas(canvas, `ViaPlanner-${semester}.png`);
}

async function exportTimetables() {
  // Export all semesters that have at least one selected course.
  const originalSession = store.selectedSession;
  const semestersToExport = ['F', 'S'].filter((semester) => Object.keys(store.selectedCourses[semester] || {}).length > 0);

  if (!semestersToExport.length) {
    return;
  }

  try {
    const sessions = await store.getSessions();

    for (const semester of semestersToExport) {
      const semesterTitle = getSemesterTitle(sessions, semester);
      await captureSemester(semester, semesterTitle);
    }
  } finally {
    exportSemester.value = null;
    exportTitle.value = '';
    store.selectedSession = originalSession;
  }
}
</script>

<style scoped>
.export-template-stage {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>