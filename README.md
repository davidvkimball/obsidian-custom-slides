# Custom Slides for Obsidian

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22custom-slides%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&style=plastic) ![last release version](https://img.shields.io/github/v/release/davidvkimball/obsidian-custom-slides?label=Latest%20Release&style=plastic)

This plugin allows you to customize the Slides [Obsidian](https://obsidian.md) core plugin (intended for use on the desktop app only). 

![obsidian-custom-slides-plugin-demo](https://github.com/user-attachments/assets/7298ce1a-e354-4976-a4c5-61faa5d80f4e)

> [!NOTE]
> You must have the Slides core plugin enabled for this plugin to work.

## Features

- **Customizable Navigation Controls**: Toggle the visibility of left, right, up, and down navigation arrows to remove visual clutter from your presentations.
- **Progress Bar Customization**: Adjust the height of the progress bar to suit your aesthetic preferences, with a default of 10 pixels (up from the default 3 pixels).
- **Left-Align Lists**: Enable left-aligned bulleted and numbered lists in presentation mode for a cleaner, more readable layout, with a 1em left margin for proper spacing.
- **Immediate Keyboard Input**: Automatically switches to reading mode when entering Slides mode so spacebar and arrows work without having to click your presentation, and restores your previous mode (e.g., edit or source) when exiting.
- **Custom Font Support**: Use the text font settings specified in your Obsidian settings.

## Installation

1. Clone or download this plugin into your Obsidian vault’s `.obsidian/plugins/` directory.
2. Ensure the `manifest.json` and `main.js` files are placed in the `custom-slides` folder.
3. Open Obsidian, go to **Settings > Community Plugins**, and enable the "Custom Slides" plugin.
4. Click the settings icon to configure the plugin options.

## Usage

1. **Enable the Plugin**: Activate it in the Community Plugins settings.
2. **Configure Settings**: Use the settings tab to toggle navigation arrow visibility, set the progress bar height, and enable left-aligned lists.
3. **Start a Presentation**: Open a note with Slides-compatible Markdown (e.g., using `---` for slides) and use the "Slides: Start Presentation" command from the Command Palette.
4. **Using Keys for Navigation**: You can use the spacebar and arrow keys to go between slides as normal and the ESC key will exit your presentation.

## Contributing

Feel free to submit issues or pull requests on the Git repository where you manage this plugin. Contributions to enhance functionality or fix bugs are welcome!
