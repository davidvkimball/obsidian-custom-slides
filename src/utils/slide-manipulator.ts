import CustomSlidesPlugin from "../main";

export class SlideManipulator {
  private plugin: CustomSlidesPlugin;
  private revealContainer: HTMLElement | null = null;
  private slidesElement: HTMLElement | null = null;
  
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(plugin: CustomSlidesPlugin) {
    this.plugin = plugin;
  }

  setup(): void {
    // We'll call this whenever slides mode is entered
    this.attachListeners();
  }

  private attachListeners(): void {
    const reveal = document.querySelector(".reveal") as HTMLElement;
    if (!reveal) return;

    this.revealContainer = reveal;
    // We'll dynamically find the current slide element instead of locking to .slides
    this.refreshSlidesElement();

    // Wheel event for zooming
    this.revealContainer.addEventListener("wheel", this.handleWheel, { passive: false });
    
    // Mouse events for panning
    this.revealContainer.addEventListener("mousedown", this.handleMouseDown);
    this.revealContainer.addEventListener("contextmenu", this.handleContextMenu);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);

    // Reset on slide change
    this.revealContainer.addEventListener("slidechanged", this.handleSlideChanged);
    
    // Also handle 'ready' event when reveal.js has finished initializing
    this.revealContainer.addEventListener("ready", this.handleSlideChanged);
    
    // Initial refresh in case it's already ready
    this.refreshSlidesElement();
  }

  private refreshSlidesElement(): void {
    if (!this.revealContainer) return;
    // Target only the currently active slide
    // Reveal.js might not have added .present immediately on the first slide
    // So we'll try to find the current indices and target the matching section
    this.slidesElement = this.revealContainer.querySelector(".slides > section.present") as HTMLElement;
    
    // If not found, try the first section as a fallback for the very first launch
    if (!this.slidesElement) {
      this.slidesElement = this.revealContainer.querySelector(".slides > section") as HTMLElement;
    }
    
    // Handle nested vertical slides
    const verticalSlide = this.slidesElement?.querySelector("section.present") as HTMLElement;
    if (verticalSlide) {
      this.slidesElement = verticalSlide;
    }
  }

  private handleSlideChanged = (): void => {
    // 1. Reset the previous slide's transform so it doesn't stay messed up
    this.reset();
    
    // 2. Refresh the pointer to the new current slide
    this.refreshSlidesElement();
  };

  destroy(): void {
    if (this.revealContainer) {
      this.revealContainer.removeEventListener("wheel", this.handleWheel);
      this.revealContainer.removeEventListener("mousedown", this.handleMouseDown);
      this.revealContainer.removeEventListener("contextmenu", this.handleContextMenu);
      this.revealContainer.removeEventListener("slidechanged", this.handleSlideChanged);
      this.revealContainer.removeEventListener("ready", this.reset);
    }
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    
    this.reset();
    this.revealContainer = null;
    this.slidesElement = null;
  }

  private handleContextMenu = (e: MouseEvent): void => {
    if (!this.plugin.settings.enablePan && !this.plugin.settings.enableZoom) return;
    
    // Right click to reset
    e.preventDefault();
    this.reset();
  };

  private handleWheel = (e: WheelEvent): void => {
    if (!this.plugin.settings.enableZoom || !this.slidesElement) return;

    e.preventDefault();

    const delta = -e.deltaY;
    const zoomFactor = Math.pow(1.1, delta / 100);
    const newScale = Math.min(Math.max(0.1, this.scale * zoomFactor), 10);

    if (newScale !== this.scale) {
      // Zoom to cursor logic:
      // We want to keep the point under the cursor fixed in viewport coordinates.
      
      const rect = this.slidesElement.getBoundingClientRect();
      
      // Calculate cursor position relative to the CENTER of the slides element
      // because CSS 'scale' and 'translate' independent properties use center origin by default.
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseFromCenterX = e.clientX - centerX;
      const mouseFromCenterY = e.clientY - centerY;

      // contentPosRelative = screenPosRelative / currentScale
      const contentX = mouseFromCenterX / this.scale;
      const contentY = mouseFromCenterY / this.scale;

      const oldScale = this.scale;
      this.scale = newScale;

      // Update translation to keep the content position fixed
      this.translateX += contentX * (oldScale - newScale);
      this.translateY += contentY * (oldScale - newScale);
      
      this.applyTransform();
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    // Only handle left click (0) for panning
    if (!this.plugin.settings.enablePan || e.button !== 0) return;

    this.isPanning = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    document.body.classList.add("is-panning");
    
    // Prevent default to avoid text selection or drag-and-drop ghost images
    e.preventDefault();
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isPanning || !this.slidesElement) return;

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.translateX += deltaX;
    this.translateY += deltaY;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.applyTransform();
  };

  private handleMouseUp = (): void => {
    this.isPanning = false;
    document.body.classList.remove("is-panning");
  };

  private applyTransform(): void {
    if (!this.slidesElement) return;
    
    // We must ensure the transform-origin is set to the center (0,0 of the coordinate space)
    // to make our translation and scaling math consistent.
    // Reveal.js slides usually have their origin in the center by default, 
    // but we'll be explicit.
    // eslint-disable-next-line obsidianmd/no-static-styles-assignment
    this.slidesElement.style.transformOrigin = "center center";

    // Use independent CSS properties to avoid overwriting Reveal.js's transform
    // Supported in modern browsers (Electron in Obsidian)
    // translate is applied before scale in the spec
    // eslint-disable-next-line obsidianmd/no-static-styles-assignment
    (this.slidesElement.style as any).translate = `${this.translateX}px ${this.translateY}px`;
    // eslint-disable-next-line obsidianmd/no-static-styles-assignment
    (this.slidesElement.style as any).scale = `${this.scale}`;
  }

  public reset = (): void => {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
    if (this.slidesElement) {
      // Clear our custom properties only, leaving Reveal.js's transform intact
      // eslint-disable-next-line obsidianmd/no-static-styles-assignment
      (this.slidesElement.style as any).translate = "";
      // eslint-disable-next-line obsidianmd/no-static-styles-assignment
      (this.slidesElement.style as any).scale = "";
      // eslint-disable-next-line obsidianmd/no-static-styles-assignment
      this.slidesElement.style.transformOrigin = "";
    }
    document.body.classList.remove("is-panning");
  };
}
