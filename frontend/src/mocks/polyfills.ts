/**
 * Polyfills for browser APIs required by pdfjs-dist and other dependencies
 * This file must be loaded before any other imports
 */

// Mock DOMMatrix for pdfjs-dist
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    m: number[];

    constructor() {
      this.m = [1, 0, 0, 1, 0, 0];
    }

    translate() {
      return this;
    }

    scale() {
      return this;
    }

    transform() {
      return this;
    }
  } as any;
}

// Mock Path2D for canvas operations
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {
    constructor() {}

    addPath() {}
    arc() {}
    arcTo() {}
    bezierCurveTo() {}
    closePath() {}
    ellipse() {}
    lineTo() {}
    moveTo() {}
    quadraticCurveTo() {}
    rect() {}
  } as any;
}

// Mock OffscreenCanvas if needed
if (typeof global.OffscreenCanvas === 'undefined') {
  global.OffscreenCanvas = class OffscreenCanvas {
    constructor() {}

    getContext() {
      return null;
    }

    convertToBlob() {
      return Promise.resolve(new Blob());
    }
  } as any;
}
