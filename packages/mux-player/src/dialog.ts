/* Inspired by HTMLDialogElement &
   https://github.com/GoogleChrome/dialog-polyfill/blob/master/index.js */

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      padding: var(--media-dialog-backdrop-padding, 0);
      background: var(--media-dialog-backdrop-background,
        linear-gradient(to bottom, rgba(20, 20, 30, 0.7) 50%, rgba(20, 20, 30, 0.9))
      );
      color: #fff;
      line-height: 18px;
      font-family: Arial, sans-serif;
    }

    :host(:not([open])) {
      display: none;
    }

    ::slotted(:focus) {
      outline: none;
    }

    /*
      Only show outline when keyboard focusing.
      https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
    */
    :host-context([media-keyboard-control]) ::slotted(:focus) {
      box-shadow: 0 0 0 2px rgba(27, 127, 204, 0.9);
    }

    .dialog {
      position: relative;
      box-sizing: border-box;
      background: var(--media-dialog-background, none);
      padding: var(--media-dialog-padding, 10px);
      max-width: min(320px, 100%);
      max-height: 100%;
      overflow: auto;
    }
  </style>

  <div class="dialog">
    <slot></slot>
  </div>
`;

class MediaDialog extends HTMLElement {
  _previouslyFocusedElement?: Element | null;

  get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }

  show() {
    this.setAttribute("open", "");
    focus(this);
  }

  close() {
    this.removeAttribute("open");
    restoreFocus(this);
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "dialog");
    }

    if (this.hasAttribute("open")) {
      focus(this);
    }
  }
}

function focus(el: MediaDialog) {
  // Find element with `autofocus` attribute, or fall back to the first form/tabindex control.
  let target: Element | null | undefined = el.querySelector(
    "[autofocus]:not([disabled])"
  );
  if (!target && (el as HTMLElement).tabIndex >= 0) {
    target = el;
  }
  if (!target) {
    target = findFocusableElementWithin(el);
  }

  el._previouslyFocusedElement = document.activeElement;
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  if (target instanceof HTMLElement) {
    target.focus();
  }
}

function findFocusableElementWithin(
  hostElement: Element | ShadowRoot | null | undefined
): Element | null | undefined {
  // Note that this is 'any focusable area'. This list is probably not exhaustive, but the
  // alternative involves stepping through and trying to focus everything.
  const opts = ["button", "input", "keygen", "select", "textarea"];
  const query = opts.map(function (el) {
    return el + ":not([disabled])";
  });
  // TODO(samthor): tabindex values that are not numeric are not focusable.
  query.push('[tabindex]:not([disabled]):not([tabindex=""])'); // tabindex != "", not disabled
  let target = hostElement?.querySelector(query.join(", "));

  if (!target && "attachShadow" in Element.prototype) {
    // If we haven't found a focusable target, see if the host element contains an element
    // which has a shadowRoot.
    // Recursively search for the first focusable item in shadow roots.
    const elems = hostElement?.querySelectorAll("*") || [];
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].tagName && elems[i].shadowRoot) {
        target = findFocusableElementWithin(elems[i].shadowRoot);
        if (target) {
          break;
        }
      }
    }
  }
  return target;
}

function restoreFocus(el: MediaDialog) {
  if (el._previouslyFocusedElement instanceof HTMLElement) {
    el._previouslyFocusedElement.focus();
  }
}

if (!globalThis.customElements.get("media-dialog")) {
  globalThis.customElements.define("media-dialog", MediaDialog);
  (globalThis as any).MediaDialog = MediaDialog;
}

export default MediaDialog;