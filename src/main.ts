import { Plugin } from "obsidian";
import { CustomSlidesSettings, DEFAULT_SETTINGS } from "./settings";
import { CustomSlidesSettingTab } from "./ui/settings-tab";
import { ModeObserver } from "./utils/mode-observer";

// Import styles.css (handled by build process)
import "../styles.css";

export default class CustomSlidesPlugin extends Plugin {
  settings: CustomSlidesSettings;
  private modeObserver: ModeObserver;

  async onload(): Promise<void> {
    try {
      await this.loadSettings();
      this.applyDynamicStyles();
      this.setupModeObserver();
      this.addSettingsTab();
    } catch (e) {
      // Silently handle errors
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
