import { App, PluginSettingTab , SettingGroup} from "obsidian";
import CustomSlidesPlugin from "../main";

import { SlideNumberPosition, TransitionType } from "../settings";

export class CustomSlidesSettingTab extends PluginSettingTab {
  plugin: CustomSlidesPlugin;
  public icon = 'lucide-monitor-cog';

  constructor(app: App, plugin: CustomSlidesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // 1.13.0+: framework calls this and skips display().
  // Pre-1.13.0: this method is not invoked; display() below runs as before.
  // See https://docs.obsidian.md/plugins/guides/migrate-declarative-settings
  getSettingDefinitions() {
    return [
      {
        name: "Theme",
        desc: "Choose a reveal.js theme for your presentations.",
        control: {
          type: "dropdown" as const,
          key: "theme",
          options: {
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
            "blood": "Blood",
          },
        },
      },
      {
        name: "Transition effect",
        desc: "Choose a transition effect between slides.",
        control: {
          type: "dropdown" as const,
          key: "transition",
          options: {
            "slide-horizontal": "Slide horizontal (default)",
            "slide-vertical": "Slide vertical",
            "fade": "Fade",
            "none": "None (instant)",
          },
        },
      },
      {
        name: "Use WASD for navigation",
        desc: "Use the WASD keys to navigate slides. Q jumps to the first slide and E to the last.",
        control: { type: "toggle" as const, key: "enableWASD" },
      },
      {
        name: "Hide left navigation arrow",
        desc: "Toggle visibility of the left navigation arrow.",
        control: { type: "toggle" as const, key: "hideNavigateLeft" },
      },
      {
        name: "Hide right navigation arrow",
        desc: "Toggle visibility of the right navigation arrow.",
        control: { type: "toggle" as const, key: "hideNavigateRight" },
      },
      {
        name: "Hide up navigation arrow",
        desc: "Toggle visibility of the up navigation arrow.",
        control: { type: "toggle" as const, key: "hideNavigateUp" },
      },
      {
        name: "Hide down navigation arrow",
        desc: "Toggle visibility of the down navigation arrow.",
        control: { type: "toggle" as const, key: "hideNavigateDown" },
      },
      {
        name: "Hide close button",
        desc: "Toggle visibility of the close button.",
        control: { type: "toggle" as const, key: "hideCloseBtn" },
      },
      {
        name: "Left-align lists",
        desc: "Toggle to left-align bulleted and numbered lists in presentation mode.",
        control: { type: "toggle" as const, key: "leftAlignBullets" },
      },
      {
        name: "Progress bar height",
        desc: "Set the height of the progress bar in pixels.",
        control: { type: "number" as const, key: "progressHeight", placeholder: "Enter height in pixels", min: 0 },
      },
      {
        name: "Use Obsidian font settings",
        desc: "Use the same font as your Obsidian text settings in slides.",
        control: { type: "toggle" as const, key: "respectObsidianSettings" },
      },
      {
        name: "Enable pan",
        desc: "Allow clicking and dragging to move slides around.",
        control: { type: "toggle" as const, key: "enablePan" },
      },
      {
        name: "Enable zoom",
        desc: "Allow using the mouse wheel to zoom in and out of slides.",
        control: { type: "toggle" as const, key: "enableZoom" },
      },
      {
        name: "Footer text",
        desc: "Text displayed at the bottom of every slide except the title slide. Leave empty for no footer.",
        control: { type: "text" as const, key: "footerText", placeholder: "Confidential" },
      },
      {
        name: "Show slide numbers",
        desc: "Display a slide number on each slide, excluding the title slide.",
        control: { type: "toggle" as const, key: "showSlideNumbers" },
      },
      {
        name: "Slide number position",
        desc: "Choose where the slide number appears.",
        // Show only when slide numbers are enabled. The framework refreshes
        // predicates automatically after each control change.
        visible: () => this.plugin.settings.showSlideNumbers,
        control: {
          type: "dropdown" as const,
          key: "slideNumberPosition",
          options: {
            "bottom-left": "Bottom left",
            "bottom-right": "Bottom right",
          },
        },
      },
      {
        name: "Auto-fit slides",
        desc: "Automatically shrink overflowing slide content to fit the viewport.",
        control: { type: "toggle" as const, key: "enableAutoFit" },
      },
    ];
  }

  // Override the framework's default setControlValue (which only calls saveData)
  // so that every change runs the plugin's saveSettings() - which also reapplies
  // dynamic styles and refreshes the slide number element. Without this override,
  // those side effects would not run on setting change on Obsidian 1.13.0+.
  // (On older versions this method is unused; display() already calls
  // saveSettings() in its onChange handlers.)
  async setControlValue(key: string, value: unknown): Promise<void> {
    (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
    await this.plugin.saveSettings();
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // First group (no heading) - all settings related to customizing slides presentation
    const generalGroup = new SettingGroup(containerEl);

    generalGroup.addSetting(setting => {
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
          .onChange(async value => {
            this.plugin.settings.theme = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Transition effect")
        .setDesc("Choose a transition effect between slides.")
        .addDropdown(dropdown => dropdown
          .addOptions({
            "slide-horizontal": "Slide horizontal (default)",
            "slide-vertical": "Slide vertical",
            "fade": "Fade",
            "none": "None (instant)"
          })
          .setValue(this.plugin.settings.transition)
          .onChange(async value => {
            this.plugin.settings.transition = value as TransitionType;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Use WASD for navigation")
        .setDesc("Use the WASD keys to navigate slides. Q jumps to the first slide and E to the last.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableWASD)
          .onChange(async value => {
            this.plugin.settings.enableWASD = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Hide left navigation arrow")
        .setDesc("Toggle visibility of the left navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateLeft)
          .onChange(async value => {
            this.plugin.settings.hideNavigateLeft = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Hide right navigation arrow")
        .setDesc("Toggle visibility of the right navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateRight)
          .onChange(async value => {
            this.plugin.settings.hideNavigateRight = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Hide up navigation arrow")
        .setDesc("Toggle visibility of the up navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateUp)
          .onChange(async value => {
            this.plugin.settings.hideNavigateUp = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Hide down navigation arrow")
        .setDesc("Toggle visibility of the down navigation arrow.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideNavigateDown)
          .onChange(async value => {
            this.plugin.settings.hideNavigateDown = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Hide close button")
        .setDesc("Toggle visibility of the close button.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.hideCloseBtn)
          .onChange(async value => {
            this.plugin.settings.hideCloseBtn = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Left-align lists")
        .setDesc("Toggle to left-align bulleted and numbered lists in presentation mode.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.leftAlignBullets)
          .onChange(async value => {
            this.plugin.settings.leftAlignBullets = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Progress bar height")
        .setDesc("Set the height of the progress bar in pixels.")
        .addText(text => text
          .setPlaceholder("Enter height in pixels")
          .setValue(this.plugin.settings.progressHeight.toString())
          .onChange(async value => {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
              this.plugin.settings.progressHeight = numValue;
              await this.plugin.saveSettings();
            }
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Use Obsidian font settings")
        .setDesc("Use the same font as your Obsidian text settings in slides.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.respectObsidianSettings)
          .onChange(async value => {
            this.plugin.settings.respectObsidianSettings = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Enable pan")
        .setDesc("Allow clicking and dragging to move slides around.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enablePan)
          .onChange(async value => {
            this.plugin.settings.enablePan = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting(setting => {
      setting
        .setName("Enable zoom")
        .setDesc("Allow using the mouse wheel to zoom in and out of slides.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableZoom)
          .onChange(async value => {
            this.plugin.settings.enableZoom = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Footer text")
        .setDesc("Text displayed at the bottom of every slide except the title slide. Leave empty for no footer.")
        .addText((text) => text
          .setPlaceholder("Confidential")
          .setValue(this.plugin.settings.footerText)
          .onChange(async (value) => {
            this.plugin.settings.footerText = value;
            await this.plugin.saveSettings();
          }));
    });

    generalGroup.addSetting((setting) => {
      setting
        .setName("Show slide numbers")
        .setDesc("Display a slide number on each slide, excluding the title slide.")
        .addToggle((toggle) => toggle
          .setValue(this.plugin.settings.showSlideNumbers)
          .onChange(async (value) => {
            this.plugin.settings.showSlideNumbers = value;
            await this.plugin.saveSettings();
            this.display();
          }));
    });

    if (this.plugin.settings.showSlideNumbers) {
      generalGroup.addSetting((setting) => {
        setting
          .setName("Slide number position")
          .setDesc("Choose where the slide number appears.")
          .addDropdown((dropdown) => dropdown
            .addOptions({
              "bottom-left": "Bottom left",
              "bottom-right": "Bottom right"
            })
            .setValue(this.plugin.settings.slideNumberPosition)
            .onChange(async (value) => {
              this.plugin.settings.slideNumberPosition = value as SlideNumberPosition;
              await this.plugin.saveSettings();
            }));
      });
    }

    generalGroup.addSetting((setting) => {
      setting
        .setName("Auto-fit slides")
        .setDesc("Automatically shrink overflowing slide content to fit the viewport.")
        .addToggle((toggle) => toggle
          .setValue(this.plugin.settings.enableAutoFit)
          .onChange(async (value) => {
            this.plugin.settings.enableAutoFit = value;
            await this.plugin.saveSettings();
          }));
    });
  }
}
