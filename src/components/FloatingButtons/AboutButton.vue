<template>
  <div>
    <Button
      @click="$router.push('/about')"
      icon="pi pi-info"
      rounded
      v-tooltip.left="{
        value: 'About Us'
      }"
      :pt:root:class="'bg-blue-500 border-blue-500'"
      class="shadow-md"
    />
  </div>
</template>
