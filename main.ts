const { Plugin, WorkspaceLeaf, ViewState, Setting, PluginSettingTab } = require("obsidian");

// Import styles.css (handled by build process)
require("./styles.css");

module.exports = class CustomSlidesPlugin extends Plugin {
  async onload() {
    try {
      await this.loadSettings();
      this.applyDynamicStyles();
      this.setupModeObserver();
      this.addSettingsTab();
    } catch (e) {
      // Logging removed
    }
  }

  async loadSettings() {
    this.settings = {
      hideNavigateLeft: true,
      hideNavigateRight: true,
      hideNavigateUp: true,
      hideNavigateDown: true,
      hideCloseBtn: true,
      progressHeight: 10,
      leftAlignBullets: false,
    };
    const savedSettings = await this.loadData();
    Object.assign(this.settings, savedSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyDynamicStyles(); // Reapply dynamic styles after saving
  }

  applyDynamicStyles() {
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

  setupModeObserver() {
    let previousMode = null;
    let isInSlidesMode = false;

    const observer = new MutationObserver((mutations, obs) => {
      try {
        const reveal = document.querySelector(".reveal");

        if (reveal && !isInSlidesMode) {
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf) {
            previousMode = activeLeaf.getViewState().mode;
            this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
            activeLeaf.setViewState({
              type: "markdown",
              state: { mode: "preview" },
            });
            isInSlidesMode = true;
          }
        } else if (!reveal && isInSlidesMode) {
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf) {
            this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
            activeLeaf.setViewState({
              type: "markdown",
              state: { mode: previousMode || "source" },
            }).then(() => {
              isInSlidesMode = false;
            });
          }
        }
      } catch (e) {
        // Logging removed
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.register(() => observer.disconnect());

    // Fallback timer to check for exit
    this.registerInterval(window.setInterval(() => {
      if (isInSlidesMode && !document.querySelector(".reveal")) {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf) {
          this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
          activeLeaf.setViewState({
            type: "markdown",
            state: { mode: previousMode || "source" },
          }).then(() => {
            isInSlidesMode = false;
          });
        }
      }
    }, 1000));
  }

  addSettingsTab() {
    this.addSettingTab(new CustomSlidesSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup handled by registered observer and interval
  }
};

class CustomSlidesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Hide left navigation arrow")
      .setDesc("Toggle visibility of the left navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateLeft)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateLeft = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide right navigation arrow")
      .setDesc("Toggle visibility of the right navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateRight)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateRight = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide up navigation arrow")
      .setDesc("Toggle visibility of the up navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateUp)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateUp = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide down navigation arrow")
      .setDesc("Toggle visibility of the down navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateDown)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateDown = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide close button")
      .setDesc("Toggle visibility of the close button.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideCloseBtn)
        .onChange(async (value) => {
          this.plugin.settings.hideCloseBtn = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Left-align lists")
      .setDesc("Toggle to left-align bulleted and numbered lists in presentation mode.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.leftAlignBullets)
        .onChange(async (value) => {
          this.plugin.settings.leftAlignBullets = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Progress bar height")
      .setDesc("Set the height of the progress bar in pixels.")
      .addText(text => text
        .setPlaceholder("Enter height in pixels")
        .setValue(this.plugin.settings.progressHeight.toString())
        .onChange(async (value) => {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue >= 0) {
            this.plugin.settings.progressHeight = numValue;
            await this.plugin.saveSettings();
          }
        }));
  }
};