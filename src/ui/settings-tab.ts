import { App, PluginSettingTab, Setting } from "obsidian";
import { CustomSlidesPlugin } from "../main";

export class CustomSlidesSettingTab extends PluginSettingTab {
  plugin: CustomSlidesPlugin;

  constructor(app: App, plugin: CustomSlidesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
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

    new Setting(containerEl)
      .setName("Use Obsidian font settings")
      .setDesc("Use the same font as your Obsidian text settings in slides.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.respectObsidianSettings)
        .onChange(async (value) => {
          this.plugin.settings.respectObsidianSettings = value;
          await this.plugin.saveSettings();
        }));
  }
}
