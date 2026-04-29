import { useWindowSize } from './useWindowSize';

type TooltipOptions = Record<string, unknown>;

type TooltipBinding = TooltipOptions & {
  value: string;
  disabled: boolean;
};

export function useResponsiveTooltip() {
  const { isSmallDevice } = useWindowSize();

  function tooltip(value: string, options: TooltipOptions = {}): TooltipBinding {
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