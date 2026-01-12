import { MarkdownView, Plugin } from "obsidian";
import CustomSlidesPlugin from "../main";

export class ModeObserver {
  private plugin: CustomSlidesPlugin;
  private previousMode: string | null = null;
  private isInSlidesMode = false;
  private observer: MutationObserver | null = null;

  constructor(plugin: CustomSlidesPlugin) {
    this.plugin = plugin;
  }

  setup(): void {
    this.observer = new MutationObserver((mutations, obs) => {
      this.checkSlidesMode();
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
    this.plugin.register(() => this.observer?.disconnect());

    // Initial check in case slides are already open
    this.checkSlidesMode();

    // Fallback timer to check for exit
    this.plugin.registerInterval(window.setInterval(() => {
      this.checkSlidesMode();
    }, 1000));
  }

  private checkSlidesMode(): void {
    try {
      const reveal = document.querySelector(".reveal");

      if (reveal && !this.isInSlidesMode) {
        // Find the specific window (document) where the .reveal element exists
        const revealDocument = reveal.ownerDocument;
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        
        if (activeView && activeView.containerEl.ownerDocument === revealDocument) {
          const leaf = activeView.leaf;
          const viewState = leaf.getViewState();
          this.previousMode = viewState.state?.mode as string | null ?? null;
          
          // Ensure we are operating on the correct window's workspace
          this.plugin.app.workspace.setActiveLeaf(leaf, { focus: true });
          
          void leaf.setViewState({
            type: "markdown",
            state: { mode: "preview" },
          });
          this.isInSlidesMode = true;
          this.plugin.onEnterSlidesMode();
        }
      } else if (!reveal && this.isInSlidesMode) {
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          const leaf = activeView.leaf;
          this.plugin.app.workspace.setActiveLeaf(leaf);
          void leaf.setViewState({
            type: "markdown",
            state: { mode: this.previousMode || "source" },
          }).then(() => {
            this.isInSlidesMode = false;
            this.plugin.onExitSlidesMode();
          });
        }
      }
    } catch {
      // Silently handle errors
    }
  }
}
