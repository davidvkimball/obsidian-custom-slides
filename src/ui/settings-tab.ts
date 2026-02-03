import { App, PluginSettingTab } from "obsidian";
import CustomSlidesPlugin from "../main";
import { createSettingsGroup } from "../utils/settings-compat";
import { TransitionType } from "../settings";

export class CustomSlidesSettingTab extends PluginSettingTab {
  plugin: CustomSlidesPlugin;
  public icon = 'lucide-monitor-cog';

  constructor(app: App, plugin: CustomSlidesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // First group (no heading) - all settings related to customizing slides presentation
    const generalGroup = createSettingsGroup(containerEl, undefined, 'custom-slides');

    generalGroup.addSetting((setting) => {
      setting
        .setName("Theme")
        .setDesc("Choose a reveal.js theme for your presentations.")
        .addDropdown(dropdown => dropdown
          .addOptions({
            "default": "Default (match Obsidian)",
            "black": "Black",
            "white": "White",
            "league": "League",
            "beige": "Beige",
            "night": "Night",
            "serif": "Serif",
            "simple": "Simple",
            "solarized": "Solarized",
            "moon": "Moon",
            "dracula": "Dracula",
            "sky": "Sky",
            "blood": "Blood"
          })
          .setValue(this.plugin.settings.theme)
          .onChange(async (value) => {
            this.plugin.settings.theme = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Transition effect")
        .setDesc("Choose a transition effect between slides.")
        .addDropdown(dropdown => dropdown
          .addOptions({
            "none": "None (instant)",
            "fade": "Fade",
            "slide-horizontal": "Slide horizontal",
            "slide-vertical": "Slide vertical"
          })
          .setValue(this.plugin.settings.transition)
          .onChange(async (value) => {
            this.plugin.settings.transition = value as TransitionType;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Use WASD for navigation")
        .setDesc("Use W, A, S, D keys to navigate slides. Q jumps to first slide, E to last.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableWASD)
          .onChange(async (value) => {
            this.plugin.settings.enableWASD = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Hide left navigation arrow")
        .setDesc("Toggle visibility of the left navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateLeft)
          .onChange(async (value) => {
            this.plugin.settings.hideNavigateLeft = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Hide right navigation arrow")
        .setDesc("Toggle visibility of the right navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateRight)
          .onChange(async (value) => {
            this.plugin.settings.hideNavigateRight = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Hide up navigation arrow")
        .setDesc("Toggle visibility of the up navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateUp)
          .onChange(async (value) => {
            this.plugin.settings.hideNavigateUp = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Hide down navigation arrow")
        .setDesc("Toggle visibility of the down navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateDown)
          .onChange(async (value) => {
            this.plugin.settings.hideNavigateDown = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Hide close button")
        .setDesc("Toggle visibility of the close button.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideCloseBtn)
          .onChange(async (value) => {
            this.plugin.settings.hideCloseBtn = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Left-align lists")
        .setDesc("Toggle to left-align bulleted and numbered lists in presentation mode.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.leftAlignBullets)
          .onChange(async (value) => {
            this.plugin.settings.leftAlignBullets = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
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
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Use Obsidian font settings")
        .setDesc("Use the same font as your Obsidian text settings in slides.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.respectObsidianSettings)
          .onChange(async (value) => {
            this.plugin.settings.respectObsidianSettings = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Enable pan")
        .setDesc("Allow clicking and dragging to move slides around.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enablePan)
          .onChange(async (value) => {
            this.plugin.settings.enablePan = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Enable zoom")
        .setDesc("Allow using the mouse wheel to zoom in and out of slides.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableZoom)
          .onChange(async (value) => {
            this.plugin.settings.enableZoom = value;
            await this.plugin.saveSettings();
          }));
    });
  }
}
