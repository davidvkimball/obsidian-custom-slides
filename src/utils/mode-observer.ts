import { Plugin } from "obsidian";

export class ModeObserver {
  private plugin: Plugin;
  private previousMode: string | null = null;
  private isInSlidesMode = false;
  private observer: MutationObserver | null = null;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  setup(): void {
    this.observer = new MutationObserver((mutations, obs) => {
      try {
        const reveal = document.querySelector(".reveal");

        if (reveal && !this.isInSlidesMode) {
          const activeLeaf = this.plugin.app.workspace.activeLeaf;
          if (activeLeaf) {
            this.previousMode = activeLeaf.getViewState().mode;
            this.plugin.app.workspace.setActiveLeaf(activeLeaf, { active: true });
            activeLeaf.setViewState({
              type: "markdown",
              state: { mode: "preview" },
            });
            this.isInSlidesMode = true;
          }
        } else if (!reveal && this.isInSlidesMode) {
          const activeLeaf = this.plugin.app.workspace.activeLeaf;
          if (activeLeaf) {
            this.plugin.app.workspace.setActiveLeaf(activeLeaf, { active: true });
            activeLeaf.setViewState({
              type: "markdown",
              state: { mode: this.previousMode || "source" },
            }).then(() => {
              this.isInSlidesMode = false;
            });
          }
        }
      } catch (e) {
        // Silently handle errors
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
    this.plugin.register(() => this.observer?.disconnect());

    // Fallback timer to check for exit
    this.plugin.registerInterval(window.setInterval(() => {
      if (this.isInSlidesMode && !document.querySelector(".reveal")) {
        const activeLeaf = this.plugin.app.workspace.activeLeaf;
        if (activeLeaf) {
          this.plugin.app.workspace.setActiveLeaf(activeLeaf, { active: true });
          activeLeaf.setViewState({
            type: "markdown",
            state: { mode: this.previousMode || "source" },
          }).then(() => {
            this.isInSlidesMode = false;
          });
        }
      }
    }, 1000));
  }
}
