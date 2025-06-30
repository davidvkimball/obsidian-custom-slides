const { Plugin, WorkspaceLeaf, ViewState, Setting, PluginSettingTab } = require("obsidian");

module.exports = class CustomSlidesPlugin extends Plugin {
  async onload() {
    try {
      await this.loadSettings();
      this.addStyle();
      this.setupModeObserver();
      this.addSettingsTab();
    } catch (e) {
      console.error("Plugin load error:", e);
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
      customCSS: "",
      leftAlignBullets: false,
    };
    const savedSettings = await this.loadData();
    Object.assign(this.settings, savedSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.addStyle(); // Reapply styles after saving
  }

  addStyle() {
    // Remove existing style element to prevent duplication
    const existingStyle = document.querySelector("style[data-custom-slides]");
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.setAttribute("data-custom-slides", "true"); // Add identifier for easy removal

    let cssContent = "";

    // Apply display rules for navigation and close button
    if (this.settings.hideNavigateLeft) {
      cssContent += ".reveal .controls .navigate-left { display: none !important; }\n";
    } else {
      cssContent += ".reveal .controls .navigate-left { display: block !important; }\n";
    }
    if (this.settings.hideNavigateRight) {
      cssContent += ".reveal .controls .navigate-right { display: none !important; }\n";
    } else {
      cssContent += ".reveal .controls .navigate-right { display: block !important; }\n";
    }
    if (this.settings.hideNavigateUp) {
      cssContent += ".reveal .controls .navigate-up { display: none !important; }\n";
    } else {
      cssContent += ".reveal .controls .navigate-up { display: block !important; }\n";
    }
    if (this.settings.hideNavigateDown) {
      cssContent += ".reveal .controls .navigate-down { display: none !important; }\n";
    } else {
      cssContent += ".reveal .controls .navigate-down { display: block !important; }\n";
    }
    if (this.settings.hideCloseBtn) {
      cssContent += ".slides-close-btn { display: none !important; }\n";
    } else {
      cssContent += ".slides-close-btn { display: block !important; }\n";
    }

    // Apply progress height
    cssContent += `.reveal .progress { height: ${this.settings.progressHeight}px !important; }\n`;

    // Apply left-align for bullets if enabled
    if (this.settings.leftAlignBullets) {
      cssContent += ".reveal ol, .reveal dl, .reveal ul { display: block; text-align: left; margin: 0 0 0 1em; }\n";
    }

    // Append custom CSS
    cssContent += this.settings.customCSS;

    style.textContent = cssContent;
    document.head.appendChild(style);
  }

  setupModeObserver() {
    let previousMode = null;
    let isInSlidesMode = false;

    const observer = new MutationObserver((mutations, obs) => {
      try {
        const reveal = document.querySelector(".reveal");
        console.log("Mode check:", { reveal: !!reveal, isInSlidesMode });

        if (reveal && !isInSlidesMode) {
          console.log("Slides mode detected, switching to reading mode");
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf) {
            previousMode = activeLeaf.getViewState().mode;
          }
          this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
          this.app.workspace.activeLeaf.setViewState({
            type: "markdown",
            state: { mode: "preview" },
          });
          isInSlidesMode = true;
        } else if (!reveal && isInSlidesMode) {
          console.log("Exiting Slides mode detected, restoring previous mode:", previousMode);
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf) {
            this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
            activeLeaf.setViewState({
              type: "markdown",
              state: { mode: previousMode || "source" },
            }).then(() => {
              console.log("Mode restoration attempted");
              isInSlidesMode = false;
            }).catch(e => console.error("Mode restoration error:", e));
          }
        }
      } catch (e) {
        console.error("Mode observer error:", e);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Mode observer started");

    // Fallback timer to check for exit
    const checkExitInterval = setInterval(() => {
      if (isInSlidesMode && !document.querySelector(".reveal")) {
        console.log("Fallback: Exiting Slides mode detected, restoring previous mode:", previousMode);
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf) {
          this.app.workspace.setActiveLeaf(activeLeaf, { active: true });
          activeLeaf.setViewState({
            type: "markdown",
            state: { mode: previousMode || "source" },
          }).then(() => {
            console.log("Fallback mode restoration attempted");
            isInSlidesMode = false;
          }).catch(e => console.error("Fallback restoration error:", e));
        }
      }
    }, 1000); // Check every 1 second

    // Cleanup interval on unload
    this.register(() => clearInterval(checkExitInterval));
  }

  addSettingsTab() {
    this.addSettingTab(new CustomSlidesSettingTab(this.app, this));
  }

  onunload() {
    // Clean up if needed
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

    containerEl.createEl("h2", { text: "Custom Slides Settings" });

    new Setting(containerEl)
      .setName("Hide Left Navigation Arrow")
      .setDesc("Toggle visibility of the left navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateLeft)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateLeft = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide Right Navigation Arrow")
      .setDesc("Toggle visibility of the right navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateRight)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateRight = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide Up Navigation Arrow")
      .setDesc("Toggle visibility of the up navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateUp)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateUp = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide Down Navigation Arrow")
      .setDesc("Toggle visibility of the down navigation arrow.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideNavigateDown)
        .onChange(async (value) => {
          this.plugin.settings.hideNavigateDown = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide Close Button")
      .setDesc("Toggle visibility of the close button.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideCloseBtn)
        .onChange(async (value) => {
          this.plugin.settings.hideCloseBtn = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Left-Align Lists")
      .setDesc("Toggle to left-align bulleted and numbered lists in presentation mode.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.leftAlignBullets)
        .onChange(async (value) => {
          this.plugin.settings.leftAlignBullets = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Progress Bar Height")
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

    new Setting(containerEl)
      .setName("Custom CSS")
      .setDesc("Enter custom CSS to override default styles.")
      .addTextArea(text => text
        .setPlaceholder("e.g., .reveal { background: black; }")
        .setValue(this.plugin.settings.customCSS)
        .onChange(async (value) => {
          this.plugin.settings.customCSS = value;
          await this.plugin.saveSettings();
        }));
  }
}