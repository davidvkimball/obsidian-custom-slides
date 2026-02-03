import { Platform } from "obsidian";

export type TransitionType = "none" | "fade" | "slide-horizontal" | "slide-vertical";

export interface CustomSlidesSettings {
  theme: string;
  hideNavigateLeft: boolean;
  hideNavigateRight: boolean;
  hideNavigateUp: boolean;
  hideNavigateDown: boolean;
  hideCloseBtn: boolean;
  progressHeight: number;
  leftAlignBullets: boolean;
  respectObsidianSettings: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  enableWASD: boolean;
  transition: TransitionType;
}

export const DEFAULT_SETTINGS: CustomSlidesSettings = {
  theme: "default",
  hideNavigateLeft: true,
  hideNavigateRight: true,
  hideNavigateUp: true,
  hideNavigateDown: true,
  hideCloseBtn: true,
  progressHeight: 10,
  leftAlignBullets: false,
  respectObsidianSettings: true,
  enablePan: true,
  enableZoom: true,
  enableWASD: false,
  transition: "none",
};

/**
 * Returns platform-aware default settings.
 * On mobile, navigation arrows are shown by default for touch navigation.
 */
export function getPlatformDefaults(): Partial<CustomSlidesSettings> {
  if (Platform.isMobile) {
    return {
      hideNavigateLeft: false,
      hideNavigateRight: false,
      hideNavigateUp: false,
      hideNavigateDown: false,
      hideCloseBtn: false,
    };
  }
  return {};
}
