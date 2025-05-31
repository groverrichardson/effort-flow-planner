// src/vitest.setup.ts

// Augment Text interface for TypeScript to recognize polyfilled methods
declare global {
  interface Text {
    getBoundingClientRect?(): DOMRect;
    getClientRects?(): DOMRectList;
  }
}

// Polyfill for Element.prototype and document.createRange based on community solutions
// for ProseMirror/Tiptap testing in JSDOM.

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Ensure Element.prototype has getClientRects and getBoundingClientRect
  // This is a more general approach than HTMLElement.prototype
  if (typeof Element !== 'undefined' && Element.prototype) {
    if (!Element.prototype.getBoundingClientRect) {
      Element.prototype.getBoundingClientRect = function(): DOMRect {
        // console.log('Polyfill: Element.prototype.getBoundingClientRect applied');
        return {
          x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
          toJSON: () => ({}),
        } as DOMRect;
      };
    }

    if (!Element.prototype.getClientRects) {
      Element.prototype.getClientRects = function(): DOMRectList {
        // console.log('Polyfill: Element.prototype.getClientRects applied');
        const rect = this.getBoundingClientRect(); // Use the potentially polyfilled GBCR
        const list: any = [rect];
        list.item = (index: number) => (index === 0 ? rect : null);
        list.length = 1;
        if (typeof Symbol !== 'undefined' && Symbol.iterator) {
          list[Symbol.iterator] = function*() {
            if (list.length > 0) yield rect;
          };
        }
        return list as DOMRectList;
      };
    }
    console.log('Ensured Element.prototype.getBoundingClientRect and getClientRects.');
  }

  // Ensure Text.prototype has getClientRects and getBoundingClientRect
  if (typeof Text !== 'undefined' && Text.prototype) {
    if (!Text.prototype.getBoundingClientRect) {
      Text.prototype.getBoundingClientRect = function(): DOMRect {
        // console.log('Polyfill: Text.prototype.getBoundingClientRect applied');
        const range = document.createRange();
        range.selectNode(this); // 'this' is the Text node
        return range.getBoundingClientRect(); // Relies on Range polyfill
      };
    }

    if (!Text.prototype.getClientRects) {
      Text.prototype.getClientRects = function(): DOMRectList {
        // console.log('Polyfill: Text.prototype.getClientRects applied');
        const range = document.createRange();
        range.selectNode(this); // 'this' is the Text node
        return range.getClientRects(); // Relies on Range polyfill
      };
    }
    console.log('Ensured Text.prototype.getBoundingClientRect and getClientRects.');
  }

  // Polyfill for Range objects created by document.createRange
  if (typeof document.createRange === 'function') {
    const originalCreateRange = document.createRange.bind(document);

    document.createRange = (): Range => {
      const range = originalCreateRange();

      if (typeof range.getBoundingClientRect !== 'function') {
        // console.log('Polyfill: Attaching getBoundingClientRect to Range instance');
        range.getBoundingClientRect = (): DOMRect => ({
          x: 0, y: 0, bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0,
          toJSON: () => ({}),
        } as DOMRect);
      }

      if (typeof range.getClientRects !== 'function') {
        // console.log('Polyfill: Attaching getClientRects to Range instance');
        range.getClientRects = (): DOMRectList => {
          const rect = range.getBoundingClientRect(); // Use its own GBCR
          const list: any = [rect];
          list.item = (index: number) => (index === 0 ? rect : null);
          list.length = 1;
          if (typeof Symbol !== 'undefined' && Symbol.iterator) {
            list[Symbol.iterator] = function*() {
              if (list.length > 0) yield rect;
            };
          }
          return list as DOMRectList;
        };
      }
      return range;
    };
    console.log('Ensured Range objects from document.createRange() have necessary methods.');
  }

  // Mock for document.elementFromPoint
  if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = vi.fn(() => null); // Or return a mock element if needed
    console.log('Ensured document.elementFromPoint is mocked.');
  }
} else {
  console.warn('JSDOM polyfills for ProseMirror/Tiptap could not be applied: window or document not found.');
}

console.log('Custom Vitest setup for JSDOM (ProseMirror getClientRects focus) loaded - v5.');
