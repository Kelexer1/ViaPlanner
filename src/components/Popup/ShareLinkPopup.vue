<template>
  <div>
    <Dialog
      v-model:visible="visible"
      modal
      :style="{ 'max-width': '690px' }"
      header="Info"
    >
      <p>You can share this link with others. It will be saved for 90 days.</p>
      <div class="flex flex-row justify-between mt-6">
        <InputText
          type="text"
          readonly
          :value="'test'"
        />
        <Button
          icon="pi pi-clipboard"
          label="Copy"
          rounded
          @click="copyText()"
        />
        <Toast />
      </div>

    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast'

const visible = ref(false);
const toast = useToast();

function copyText() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Copied link to clipboard',
    life: 2000
  })
}
</script>