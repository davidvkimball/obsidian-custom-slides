import { Plugin } from "obsidian";
import { CustomSlidesSettings, DEFAULT_SETTINGS } from "./settings";
import { CustomSlidesSettingTab } from "./ui/settings-tab";
import { ModeObserver } from "./utils/mode-observer";

export default class CustomSlidesPlugin extends Plugin {
  settings: CustomSlidesSettings;
  private modeObserver: ModeObserver;

  async onload(): Promise<void> {
    try {
      await this.loadSettings();
      this.applyDynamicStyles();
      this.setupModeObserver();
      this.addSettingsTab();
    } catch {
      // Silently handle errors
    }
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<CustomSlidesSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.applyDynamicStyles(); // Reapply dynamic styles after saving
  }

  private applyDynamicStyles(): void {
    const body = document.body;
    // Toggle modifier classes based on settings
    body.classList.toggle("hide-navigate-left", this.settings.hideNavigateLeft);
    body.classList.toggle("hide-navigate-right", this.settings.hideNavigateRight);
    body.classList.toggle("hide-navigate-up", this.settings.hideNavigateUp);
    body.classList.toggle("hide-navigate-down", this.settings.hideNavigateDown);
    body.classList.toggle("hide-close-btn", this.settings.hideCloseBtn);
    body.classList.toggle("left-align-bullets", this.settings.leftAlignBullets);

    // Set dynamic custom property for progress height
    body.style.setProperty("--progress-height", `${this.settings.progressHeight}px`);

    // Apply font settings
    this.applyFontStyles();
  }

  private applyFontStyles(): void {
    const body = document.body;
    
    if (this.settings.respectObsidianSettings) {
      // Apply Obsidian's font settings directly to reveal.js slides
      // Using setProperty for CSS custom properties (dynamic values)
      // eslint-disable-next-line obsidianmd/no-static-styles-assignment
      body.style.setProperty("--slides-font-interface", "var(--font-interface)");
      // eslint-disable-next-line obsidianmd/no-static-styles-assignment
      body.style.setProperty("--slides-font-text", "var(--font-text)");
    } else {
      // Reset to default (reveal.js defaults)
      body.style.removeProperty("--slides-font-interface");
      body.style.removeProperty("--slides-font-text");
    }
  }

  private setupModeObserver(): void {
    this.modeObserver = new ModeObserver(this);
    this.modeObserver.setup();
  }

  private addSettingsTab(): void {
    this.addSettingTab(new CustomSlidesSettingTab(this.app, this));
  }

  onunload(): void {
    // Cleanup handled by registered observer and interval
  }
}
