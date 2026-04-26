import { useWindowSize } from './useWindowSize';

export function useResponsiveTooltip() {
  const { isSmallDevice } = useWindowSize();

  function tooltip(value, options = {}) {
    return {
      ...options,
      value,
      disabled: isSmallDevice.value
    };
  }

  return {
    tooltip
  };
}