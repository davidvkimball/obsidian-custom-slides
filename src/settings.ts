export interface CustomSlidesSettings {
  hideNavigateLeft: boolean;
  hideNavigateRight: boolean;
  hideNavigateUp: boolean;
  hideNavigateDown: boolean;
  hideCloseBtn: boolean;
  progressHeight: number;
  leftAlignBullets: boolean;
}

export const DEFAULT_SETTINGS: CustomSlidesSettings = {
  hideNavigateLeft: true,
  hideNavigateRight: true,
  hideNavigateUp: true,
  hideNavigateDown: true,
  hideCloseBtn: true,
  progressHeight: 10,
  leftAlignBullets: false,
};
