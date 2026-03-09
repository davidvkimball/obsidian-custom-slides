import { Plugin } from "obsidian";
import { CustomSlidesSettings, DEFAULT_SETTINGS, getPlatformDefaults } from "./settings";
import { CustomSlidesSettingTab } from "./ui/settings-tab";
import { ModeObserver } from "./utils/mode-observer";
import { SlideManipulator } from "./utils/slide-manipulator";

export default class CustomSlidesPlugin extends Plugin {
  settings!: CustomSlidesSettings;
  private modeObserver!: ModeObserver;
  private slideManipulator!: SlideManipulator;
  private footerEl: HTMLElement | null = null;
  private slideNumberEl: HTMLElement | null = null;
  private _footerVisibilityHandler: (() => void) | null = null;
  private _slideNumberHandler: (() => void) | null = null;

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
    // Apply platform-aware defaults for first-time users (when no saved data exists)
    const platformDefaults = data === null ? getPlatformDefaults() : {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, platformDefaults, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.applyDynamicStyles(); // Reapply dynamic styles after saving
    this.createSlideNumber();
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

    // Apply transition - remove any existing transition class first
    const transitionClasses = [
      "slides-transition-none", "slides-transition-fade", "slides-transition-slide-horizontal", "slides-transition-slide-vertical"
    ];
    transitionClasses.forEach(cls => body.classList.remove(cls));
    // Always apply transition class
    body.classList.add(`slides-transition-${this.settings.transition}`);

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

  private createFooter(): void {
    if (!this.settings.footerText.trim()) {
      this.footerEl = null;
      return;
    }
    const reveal = document.querySelector(".reveal");
    if (!reveal) return;

    const footer = document.createElement("div");
    footer.className = "custom-slides-footer";
    footer.textContent = this.settings.footerText;
    reveal.appendChild(footer);
    this.footerEl = footer;

    this._footerVisibilityHandler = () => this.updateFooterVisibility();
    reveal.addEventListener("slidechanged", this._footerVisibilityHandler);
    reveal.addEventListener("ready", this._footerVisibilityHandler);
    this.updateFooterVisibility();
  }

  private updateFooterVisibility(): void {
    if (!this.footerEl) return;
    const slidesContainer = document.querySelector(".reveal .slides");
    if (!slidesContainer) return;

    // Use leaf slides to correctly handle vertical stacks
    const leafSlides = Array.from(slidesContainer.querySelectorAll("section")).filter(s => s.querySelectorAll("section").length === 0);
    const currentSlide = leafSlides.find(s => s.classList.contains("present"));
    this.footerEl.style.display = (currentSlide === leafSlides[0]) ? "none" : "";
  }

  private destroyFooter(): void {
    if (this.footerEl) {
      this.footerEl.remove();
      this.footerEl = null;
    }
    if (this._footerVisibilityHandler) {
      const reveal = document.querySelector(".reveal");
      if (reveal) {
        reveal.removeEventListener("slidechanged", this._footerVisibilityHandler);
        reveal.removeEventListener("ready", this._footerVisibilityHandler);
      }
      this._footerVisibilityHandler = null;
    }
  }

  private createSlideNumber(): void {
    this.destroySlideNumber();
    if (!this.settings.showSlideNumbers) return;

    const reveal = document.querySelector(".reveal");
    if (!reveal) return;

    const numEl = document.createElement("div");
    numEl.className = "custom-slide-number";
    numEl.classList.add(`slide-number-${this.settings.slideNumberPosition}`);
    reveal.appendChild(numEl);
    this.slideNumberEl = numEl;

    this._slideNumberHandler = () => this.updateSlideNumberVisibility();
    reveal.addEventListener("slidechanged", this._slideNumberHandler);
    reveal.addEventListener("ready", this._slideNumberHandler);
    this.updateSlideNumberVisibility();
  }

  private updateSlideNumberVisibility(): void {
    if (!this.slideNumberEl) return;
    const slidesContainer = document.querySelector(".reveal .slides");
    if (!slidesContainer) return;

    const leafSlides = Array.from(slidesContainer.querySelectorAll("section")).filter(s => s.querySelectorAll("section").length === 0);
    const currentSlide = leafSlides.find(s => s.classList.contains("present"));

    if (!currentSlide || currentSlide === leafSlides[0]) {
      this.slideNumberEl.style.display = "none";
    } else {
      const index = leafSlides.indexOf(currentSlide);
      this.slideNumberEl.style.display = "";
      this.slideNumberEl.textContent = String(index);
    }
  }

  private destroySlideNumber(): void {
    if (this.slideNumberEl) {
      this.slideNumberEl.remove();
      this.slideNumberEl = null;
    }
    if (this._slideNumberHandler) {
      const reveal = document.querySelector(".reveal");
      if (reveal) {
        reveal.removeEventListener("slidechanged", this._slideNumberHandler);
        reveal.removeEventListener("ready", this._slideNumberHandler);
      }
      this._slideNumberHandler = null;
    }
    // Cleanup any lingering ones from previous methods
    document.querySelectorAll(".custom-slide-number").forEach(el => el.remove());
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
    this.createFooter();
    this.createSlideNumber();
  }

  public onExitSlidesMode(): void {
    this.slideManipulator.destroy();
    window.removeEventListener("keydown", this.handleWASD, true);
    this.destroyFooter();
    this.destroySlideNumber();
  }

  private handleWASD = (e: KeyboardEvent): void => {
    if (!this.settings.enableWASD) return;

    const key = e.key.toLowerCase();
    let arrowKey = "";
    let isJump = false;

    switch (key) {
      case "w": arrowKey = "ArrowUp"; break;
      case "a": arrowKey = "ArrowLeft"; break;
      case "s": arrowKey = "ArrowDown"; break;
      case "d": arrowKey = "ArrowRight"; break;
      case "q": isJump = true; break; // Jump to first slide
      case "e": isJump = true; break; // Jump to last slide
      default: return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (isJump) {
      const jumpKey = key === "q" ? "Home" : "End";
      const event = new KeyboardEvent("keydown", {
        key: jumpKey,
        code: jumpKey,
        keyCode: jumpKey === "Home" ? 36 : 35,
        which: jumpKey === "Home" ? 36 : 35,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      return;
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
    document.dispatchEvent(event);
  };

  onunload(): void {
    this.destroySlideNumber();
    this.destroyFooter();
    const body = document.body;

    // Remove all modifier classes
    body.classList.remove(
      "slides-theme-black", "slides-theme-white", "slides-theme-league",
      "slides-theme-beige", "slides-theme-night", "slides-theme-serif",
      "slides-theme-simple", "slides-theme-solarized", "slides-theme-moon",
      "slides-theme-dracula", "slides-theme-sky", "slides-theme-blood",
      "slides-transition-none", "slides-transition-fade", "slides-transition-slide-horizontal", "slides-transition-slide-vertical",
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
