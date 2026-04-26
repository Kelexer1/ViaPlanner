import { computed, ref } from 'vue';

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0);
const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0);

function updateWindowSize() {
  if (typeof window === 'undefined') {
    return;
  }

  width.value = window.innerWidth;
  height.value = window.innerHeight;
}

if (typeof window !== 'undefined') {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
}

export function useWindowSize(breakpoint = 640) {
  const isSmallDevice = computed(() => width.value <= breakpoint);

  return {
    width,
    height,
    isSmallDevice
  };
}