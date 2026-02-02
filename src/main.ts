import { Plugin } from "obsidian";
import { CustomSlidesSettings, DEFAULT_SETTINGS } from "./settings";
import { CustomSlidesSettingTab } from "./ui/settings-tab";
import { ModeObserver } from "./utils/mode-observer";
import { SlideManipulator } from "./utils/slide-manipulator";

export default class CustomSlidesPlugin extends Plugin {
  settings!: CustomSlidesSettings;
  private modeObserver!: ModeObserver;
  private slideManipulator!: SlideManipulator;

  async onload(): Promise<void> {
    try {
      await this.loadSettings();

      this.slideManipulator = new SlideManipulator(this);

      // Ensure styles are applied after the layout is ready
      this.app.workspace.onLayoutReady(() => {
        this.applyDynamicStyles();
      });

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

    // Apply theme - remove any existing theme class first
    const themeClasses = [
      "slides-theme-black", "slides-theme-white", "slides-theme-league",
      "slides-theme-beige", "slides-theme-night", "slides-theme-serif",
      "slides-theme-simple", "slides-theme-solarized", "slides-theme-moon",
      "slides-theme-dracula", "slides-theme-sky", "slides-theme-blood"
    ];
    themeClasses.forEach(cls => body.classList.remove(cls));
    // Only apply theme class if not using default (let Obsidian handle it)
    if (this.settings.theme !== "default") {
      body.classList.add(`slides-theme-${this.settings.theme}`);
    }

    // Toggle modifier classes based on settings
    body.classList.toggle("hide-navigate-left", this.settings.hideNavigateLeft);
    body.classList.toggle("hide-navigate-right", this.settings.hideNavigateRight);
    body.classList.toggle("hide-navigate-up", this.settings.hideNavigateUp);
    body.classList.toggle("hide-navigate-down", this.settings.hideNavigateDown);
    body.classList.toggle("hide-close-btn", this.settings.hideCloseBtn);
    body.classList.toggle("left-align-bullets", this.settings.leftAlignBullets);
    body.classList.toggle("enable-pan", this.settings.enablePan);
    body.classList.toggle("enable-zoom", this.settings.enableZoom);

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

  public onEnterSlidesMode(): void {
    this.slideManipulator.setup();
    if (this.settings.enableWASD) {
      window.addEventListener("keydown", this.handleWASD, true);
    }
  }

  public onExitSlidesMode(): void {
    this.slideManipulator.destroy();
    window.removeEventListener("keydown", this.handleWASD, true);
  }

  private handleWASD = (e: KeyboardEvent): void => {
    if (!this.settings.enableWASD) return;

    const key = e.key.toLowerCase();
    let arrowKey = "";

    switch (key) {
      case "w": arrowKey = "ArrowUp"; break;
      case "a": arrowKey = "ArrowLeft"; break;
      case "s": arrowKey = "ArrowDown"; break;
      case "d": arrowKey = "ArrowRight"; break;
      default: return;
    }

    // Dispatch a new KeyboardEvent that looks like the arrow key
    const event = new KeyboardEvent("keydown", {
      key: arrowKey,
      code: arrowKey,
      keyCode: arrowKey === "ArrowLeft" ? 37 : arrowKey === "ArrowUp" ? 38 : arrowKey === "ArrowRight" ? 39 : 40,
      which: arrowKey === "ArrowLeft" ? 37 : arrowKey === "ArrowUp" ? 38 : arrowKey === "ArrowRight" ? 39 : 40,
      bubbles: true,
      cancelable: true
    });

    // We stop propagation of the original WASD key and dispatch the arrow key instead
    e.stopPropagation();
    e.preventDefault();
    document.dispatchEvent(event);
  };

  onunload(): void {
    const body = document.body;

    // Remove all modifier classes
    body.classList.remove(
      "slides-theme-black", "slides-theme-white", "slides-theme-league",
      "slides-theme-beige", "slides-theme-night", "slides-theme-serif",
      "slides-theme-simple", "slides-theme-solarized", "slides-theme-moon",
      "slides-theme-dracula", "slides-theme-sky", "slides-theme-blood",
      "hide-navigate-left",
      "hide-navigate-right",
      "hide-navigate-up",
      "hide-navigate-down",
      "hide-close-btn",
      "left-align-bullets",
      "enable-pan",
      "enable-zoom",
      "is-panning"
    );

    // Remove CSS custom properties
    body.style.removeProperty("--progress-height");
    body.style.removeProperty("--slides-font-interface");
    body.style.removeProperty("--slides-font-text");
  }
}
