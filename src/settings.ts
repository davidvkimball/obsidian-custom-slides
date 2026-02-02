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
};
