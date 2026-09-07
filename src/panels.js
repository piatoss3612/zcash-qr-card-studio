import { applyEventTheme, createEventScene, replaceEventCharacter, EVENT_TITLES, eventText, setEventText, numberedCard } from "./event-card.js";
// DOM binding for everything outside the canvas: mode switch, tool rail and drawer,
// asset panels, content fields, selection panel, layer list, export menu and batch dialog.

import {
  BACKGROUNDS,
  CHARACTERS,
  INSTALL_LAYER,
  LOGOS,
  LOGO_PALETTE,
  MODES,
  TEXT_PALETTE,
  FONTS,
  fontWeightFor,
  QR_MODULE_PALETTE,
  templatesForMode,
} from "./catalog.js";
import {
  addLayer,
  applyLayout,
  duplicateLayer,
  makeCharacterLayer,
  makeLogoLayer,
  makeTextLayer,
  removeLayer,
  reorderLayer,
  roleLayer,
  selectLayer,
  selectedLayer,
  setIncludeInstall,
  setLayerOrder,
  setLayerProps,
  setMode,
  setPaymentSummary,
  setQrDesign,
  snapshot,
} from "./scene.js";
import { maskGiftLink, parseBatchLines } from "./qr-content.js";
import { preflight, summarize } from "./preflight.js";
import { designToJson, parseDesign } from "./design-file.js";
import {
  assetsReady,
  drawPrintCanvas,
  exportBatch,
  exportPngBlob,
  renderThumbnail,
  sampleQrCode,
  syncTextLayerHeight,
} from "./render.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const KIND_TAG = {
  background: "BG",
  character: "CAT",
  logo: "LOGO",
  text: "TEXT",
  qr: "QR",
  install: "CARD",
};
const CONTENT_FIELDS = [
  ["field-address", "address"],
  ["field-amount", "amount"],
  ["field-memo", "memo"],
  ["field-label", "label"],
  ["field-message", "message"],
  ["field-url", "url"],
  ["field-gift-link", "giftLink"],
];
const encoder = new TextEncoder();

/** @returns {string|null} the colour a palette id maps to. */
function paletteValue(palette, id, customInput) {
  if (id === "custom") return customInput.value;
  const entry = palette.find((item) => item.id === id);
  return entry ? entry.value : null;
}

/** @returns {string} the palette id matching a colour ('custom' when unlisted). */
function paletteId(palette, value) {
  if (value === null || value === undefined) {
    return palette.some((item) => item.value === null) ? "original" : "custom";
  }
  const hit = palette.find(
    (item) => item.value && item.value.toLowerCase() === String(value).toLowerCase(),
  );
  return hit ? hit.id : "custom";
}

/** @returns {SVGElement} the padlock glyph used in layer rows. */
function lockIcon(locked) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  const body = document.createElementNS(SVG_NS, "path");
  body.setAttribute("d", "M5.5 8.75h9v7.75h-9z");
  const shackle = document.createElementNS(SVG_NS, "path");
  shackle.setAttribute(
    "d",
    locked ? "M7.5 8.75V6.5a2.5 2.5 0 0 1 5 0v2.25" : "M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6",
  );
  svg.append(body, shackle);
  return svg;
}

/**
 * Bind every panel, dialog and menu outside the canvas.
 * @param {any} app  shared application context created in main.js
 * @returns {{ sync: () => void, syncTemplates: () => void, closeMenus: () => boolean, openLayerMenu: (id: string, x: number, y: number) => void }}
 */
export function createPanels(app) {
  const el = {
    body: document.body,
    documentName: document.getElementById("document-name"),
    modeInputs: [...document.querySelectorAll('input[name="mode"]')],
    giftWarning: document.getElementById("gift-warning"),
    undo: document.getElementById("undo-button"),
    redo: document.getElementById("redo-button"),
    status: document.getElementById("render-status"),

    toolTabs: [...document.querySelectorAll(".tool-tab")],
    toolPanels: [...document.querySelectorAll(".tool-panel")],
    drawerCloseButtons: [
      document.getElementById("drawer-close-button"),
      ...document.querySelectorAll("[data-drawer-close]"),
    ].filter(Boolean),
    templateGrid: document.getElementById("template-grid"),
    backgroundInputs: [...document.querySelectorAll('input[name="background"]')],
    characterCards: [...document.querySelectorAll("[data-character-id]")],
    logoCards: [...document.querySelectorAll("[data-logo-id]")],
    addCharacter: document.getElementById("add-character-button"),
    addLogo: document.getElementById("add-logo-button"),
    layoutChoices: document.getElementById("layout-choices"),
    addHeading: document.getElementById("add-heading-button"),
    addBody: document.getElementById("add-body-button"),
    layoutInputs: [...document.querySelectorAll('input[name="layout"]')],
    qrStyleInputs: [...document.querySelectorAll('input[name="qr-style"]')],
    qrShapeInputs: [...document.querySelectorAll('input[name="qr-shape"]')],
    qrColorInputs: [...document.querySelectorAll('input[name="qr-color"]')],
    qrColorCustom: document.getElementById("qr-color-custom"),
    qrEmblemInputs: [...document.querySelectorAll('input[name="qr-emblem"]')],

    modeFieldsets: [...document.querySelectorAll("[data-mode-fields]")],
    includeInstall: document.getElementById("include-install"),
    showSummary: document.getElementById("show-summary"),
    textBoundNote: document.getElementById("text-bound-note"),
    memoCount: document.getElementById("memo-count"),
    contentError: document.getElementById("content-error"),
    contentWarning: document.getElementById("content-warning"),
    valuePreview: document.getElementById("qr-value-preview"),

    selectionBlocks: [...document.querySelectorAll("[data-selection-kind]")],
    selectedLayerName: document.getElementById("selected-layer-name"),
    transformBlock: document.getElementById("transform-block"),
    transformReadout: document.getElementById("transform-readout"),
    transformX: document.getElementById("transform-x"),
    transformY: document.getElementById("transform-y"),
    transformWidth: document.getElementById("transform-width"),
    transformHeight: document.getElementById("transform-height"),
    transformRotation: document.getElementById("transform-rotation"),
    flipButton: document.getElementById("flip-button"),
    lockButton: document.getElementById("lock-button"),
    duplicateButton: document.getElementById("duplicate-button"),
    deleteButton: document.getElementById("delete-button"),
    logoColorInputs: [...document.querySelectorAll('input[name="logo-color"]')],
    logoColorCustom: document.getElementById("logo-color-custom"),
    textContent: document.getElementById("text-content"),
    textFont: document.getElementById("text-font"),
    textSize: document.getElementById("text-size"),
    textWeight: document.getElementById("text-weight"),
    textUppercase: document.getElementById("text-uppercase"),
    textAlignInputs: [...document.querySelectorAll('input[name="text-align"]')],
    textColorInputs: [...document.querySelectorAll('input[name="text-color"]')],
    textColorCustom: document.getElementById("text-color-custom"),

    layerList: document.getElementById("layer-list"),
    contextMenu: document.getElementById("layer-context-menu"),

    fileButton: document.getElementById("file-button"),
    fileMenu: document.getElementById("file-menu"),
    fileInput: document.getElementById("file-input"),
    exportButton: document.getElementById("export-button"),
    exportMenu: document.getElementById("export-menu"),
    preflightSummary: document.getElementById("preflight-summary"),
    preflightSummaryText: document.getElementById("preflight-summary-text"),
    preflightList: document.getElementById("preflight-list"),
    printCanvas: document.getElementById("print-canvas"),
    cardCanvas: document.getElementById("card-canvas"),

    helpButton: document.getElementById("help-button"),
    helpDialog: document.getElementById("help-dialog"),
    batchDialog: document.getElementById("batch-dialog"),
    batchInput: document.getElementById("batch-input"),
    batchHint: document.getElementById("batch-hint"),
    batchCount: document.getElementById("batch-count"),
    batchPreview: document.getElementById("batch-preview"),
    batchErrors: document.getElementById("batch-errors"),
    batchProgress: document.getElementById("batch-progress"),
    batchRun: document.getElementById("batch-run-button"),
    batchCancel: document.getElementById("batch-cancel-button"),
  };
  const disposables = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    disposables.push(() => target.removeEventListener(type, handler, options));
  };
  el.contextMenuActions = [...el.contextMenu.querySelectorAll("[data-layer-action]")];

  const pick = { character: "classic", logo: "vizor" };
  let activePanel = "templates";
  let drawerOpen = true;
  let contextMenuLayerId = null;
  /** @type {object|null} */
  let fieldSnapshot = null;

  const scene = () => app.scene;

  /** Run a mutation as one history entry and re-render. */
  /**
   * Run a mutation as one undo step. Composition edits (layers, assets, layout)
   * mark the scene dirty so a later card-type switch keeps the user's work.
   */
  function edit(mutate, { composition = true } = {}) {
    const before = app.takeSnapshot();
    const result = mutate();
    if (result === false) return;
    app.commit(before);
    if (composition) app.compositionDirty = true;
    app.requestRender();
  }

  // ------------------------------------------------------------ drawer

  function setDrawer(open) {
    drawerOpen = open;
    el.body.dataset.drawer = open ? "open" : "closed";
  }

  function setActivePanel(name) {
    activePanel = name;
    for (const tab of el.toolTabs) {
      tab.setAttribute("aria-pressed", String(tab.dataset.panel === name));
    }
    for (const panel of el.toolPanels) {
      panel.toggleAttribute("hidden", panel.dataset.panel !== name);
    }
  }

  // ---------------------------------------------------------- templates

  /** Rebuild the template cards for the current mode. */
  function syncTemplates() {
    const templates = templatesForMode(scene().mode);
    el.templateGrid.replaceChildren(
      ...templates.map((template) => {
        const card = document.createElement("button");
        card.className = "template-card";
        card.type = "button";
        card.dataset.templateId = template.id;
        card.setAttribute("aria-pressed", String(scene().templateId === template.id));

        const thumb = document.createElement("span");
        thumb.className = "template-card__thumb";
        const preview = createEventScene(template.mode);
        applyEventTheme(preview, template.id);
        thumb.append(
          renderThumbnail(preview, {
            assets: app.assets,
            qrCode: sampleQrCode(),
            installCode: app.installCode,
            width: 180,
          }),
        );

        const label = document.createElement("span");
        label.className = "template-card__label";
        label.textContent = template.label;

        card.append(thumb, label);
        card.addEventListener("click", () => {
          edit(() => applyEventTheme(scene(), template.id), { composition: false });
          app.compositionDirty = false;
        });
        return card;
      }),
    );
  }

  /** Redraw the three arrangement thumbnails from the current composition. */
  function syncLayoutPreviews() {
    if (!app.assetsLoaded) return;
    for (const label of el.layoutChoices.querySelectorAll("label")) {
      const value = label.querySelector("input")?.value;
      const holder = label.querySelector(".layout-thumb");
      if (!value || !holder) continue;
      const preview = snapshot(scene());
      applyLayout(preview, value);
      holder.replaceChildren(
        renderThumbnail(preview, {
          assets: app.assets,
          qrCode: app.qrCode ?? sampleQrCode(),
          installCode: app.installCode,
          width: 84,
        }),
      );
    }
  }

  let layoutPreviewTimer = 0;
  /** Debounced preview refresh, only while the Templates panel is on screen. */
  function scheduleLayoutPreviews() {
    if (!drawerOpen || activePanel !== "templates") return;
    clearTimeout(layoutPreviewTimer);
    layoutPreviewTimer = setTimeout(syncLayoutPreviews, 250);
  }

  // ------------------------------------------------------------- assets

  function applyCharacterCard(assetId) {
    pick.character = assetId;
    edit(() => replaceEventCharacter(scene(), assetId));
    if (selectedLayer(scene())?.locked) app.setStatus("Unlock the character before replacing it", "error");
  }

  function applyLogoCard(assetId) {
    pick.logo = assetId;
    const asset = LOGOS[assetId];
    if (!asset) return;
    const layer = selectedLayer(scene());
    edit(() => {
      if (layer && layer.kind === "logo" && !layer.locked) {
        const changed = layer.assetId !== assetId;
        setLayerProps(scene(), layer.id, {
          assetId,
          label: asset.label,
          color: asset.recolorable ? (layer.color ?? asset.defaultColor ?? null) : null,
          ...(changed ? { width: asset.width, height: asset.height } : {}),
        });
      } else {
        const made = makeLogoLayer(assetId, {}, scene());
        if (!made) return false;
        addLayer(scene(), made);
      }
      return true;
    });
  }

  function addTextLayer(preset) {
    edit(() => {
      const made = makeTextLayer(preset, scene());
      if (!made) return false;
      syncTextLayerHeight(made);
      addLayer(scene(), made);
      return true;
    });
    // Jump straight into the text so the drawer → properties hop is one step.
    requestAnimationFrame(() => {
      el.textContent.focus();
      el.textContent.select();
    });
  }

  // ------------------------------------------------------------ content

  function updateMemoCount() {
    el.memoCount.textContent = String(encoder.encode(scene().content.memo ?? "").length);
  }

  function switchMode(mode) {
    edit(() => {
      const previous = scene().mode;
      const title = eventText(scene(), "event-heading");
      setMode(scene(), mode);
      if (mode === "payment") setPaymentSummary(scene(), true);
      const logo = scene().order.map(id=>scene().layers[id]).find(layer=>layer.kind === "logo");
      if (logo && ["zcash", "vizor"].includes(logo.assetId)) {
        const assetId = mode === "payment" ? "zcash" : "vizor";
        Object.assign(logo, {assetId, label:LOGOS[assetId].label, width:mode === "payment"?70:180, height:mode === "payment"?70:52});
      }
      if (title === EVENT_TITLES[previous]) setEventText(scene(), "event-heading", EVENT_TITLES[mode]);
      const caption = roleLayer(scene(), "caption");
      if (caption) caption.text = mode === "giftcard" ? "2. Scan to claim your gift" : mode === "payment" ? "Scan to pay with Zcash" : "Scan to open the event guide";
      scene().templateId = `${mode}-${scene().layers.background.assetId}`;
      return true;
    }, { composition: false });
    syncTemplates();
  }

  // ---------------------------------------------------------- selection

  function syncSelection() {
    const layer = selectedLayer(scene());
    const kind = layer?.kind ?? "none";
    el.selectedLayerName.textContent = layer?.label ?? "None";
    for (const block of el.selectionBlocks) {
      block.toggleAttribute("hidden", block.dataset.selectionKind !== kind);
    }

    const transformable = layer && kind !== "background";
    el.transformBlock.toggleAttribute("hidden", !transformable);
    if (!transformable) return;

    const locked = Boolean(layer.locked);
    const visual = kind === "character" || kind === "logo";
    const rotatable = visual || kind === "text";
    const setValue = (input, value) => {
      const next = String(value);
      if (document.activeElement !== input && input.value !== next) input.value = next;
    };
    setValue(el.transformX, Math.round(layer.x));
    setValue(el.transformY, Math.round(layer.y));
    setValue(el.transformWidth, Math.round(layer.width));
    setValue(el.transformHeight, Math.round(layer.height ?? 0));
    setValue(el.transformRotation, Math.round((layer.rotation ?? 0) * 10) / 10);
    const rotation = Math.round((layer.rotation ?? 0) * 10) / 10;
    el.transformReadout.textContent =
      `${Math.round(layer.x)}, ${Math.round(layer.y)} · ${Math.round(layer.width)} × ${Math.round(layer.height ?? 0)}`
      + (rotation ? ` · ${rotation}°` : "");
    for (const input of [el.transformX, el.transformY, el.transformWidth]) input.disabled = locked;
    el.transformHeight.disabled = locked || kind === "text";
    el.transformRotation.disabled = locked || !rotatable;

    el.flipButton.disabled = locked || !visual;
    el.lockButton.disabled = kind === "background";
    el.lockButton.setAttribute("aria-pressed", String(locked));
    el.lockButton.title = locked ? "Unlock layer" : "Lock layer";
    el.duplicateButton.disabled = locked || !["character", "logo", "text"].includes(kind);
    el.deleteButton.disabled = locked || !layer.deletable;

    if (kind === "logo") {
      const recolorable = Boolean(LOGOS[layer.assetId]?.recolorable);
      const id = paletteId(LOGO_PALETTE, layer.color);
      for (const input of el.logoColorInputs) {
        input.checked = input.value === id;
        input.disabled = !recolorable || locked;
      }
      el.logoColorCustom.disabled = !recolorable || locked;
      document.getElementById("logo-color-note")?.toggleAttribute("hidden", recolorable);
      if (id === "custom" && layer.color) el.logoColorCustom.value = layer.color;
    }

    if (kind === "text") {
      if (document.activeElement !== el.textContent && el.textContent.value !== layer.text) {
        el.textContent.value = layer.text;
      }
      const bound = Boolean(layer.bound);
      el.textContent.disabled = bound || locked;
      el.textBoundNote.hidden = !bound;
      el.textFont.value = layer.fontFamily;
      setValue(el.textSize, layer.fontSize);
      // Only offer the weights this face ships; a single-weight face disables the control.
      const weights = FONTS[layer.fontFamily]?.weights ?? [500];
      for (const option of el.textWeight.options) option.hidden = !weights.includes(Number(option.value));
      el.textWeight.value = String(fontWeightFor(layer.fontFamily, layer.fontWeight));
      el.textWeight.disabled = weights.length < 2 || locked;
      el.textUppercase.checked = Boolean(layer.uppercase);
      el.textUppercase.disabled = locked;
      for (const input of el.textAlignInputs) input.checked = input.value === layer.align;
      const colorId = paletteId(TEXT_PALETTE, layer.color);
      for (const input of el.textColorInputs) input.checked = input.value === colorId;
      if (colorId === "custom" && layer.color) el.textColorCustom.value = layer.color;
    }
  }

  // --------------------------------------------------------- layer list

  function layerDetail(layer) {
    if (layer.kind === "background") return BACKGROUNDS[layer.assetId]?.label ?? "Background";
    if (layer.kind === "install") return "Install QR";
    if (layer.kind === "text") return `${layer.fontFamily} · ${Math.round(layer.fontSize)}`;
    if (layer.kind === "logo") {
      if (!layer.color) return "Original colour";
      const id = paletteId(LOGO_PALETTE, layer.color);
      return id === "custom"
        ? `Custom ${layer.color}`
        : `${LOGO_PALETTE.find((item) => item.id === id)?.label} logo`;
    }
    return `${Math.round(layer.width)} × ${Math.round(layer.height ?? 0)}`;
  }

  // Drag a layer row to reorder. Background never moves; locked layers stay put.
  let dragLayerId = null;

  function clearDropMarks() {
    for (const row of el.layerList.querySelectorAll(".drop-above, .drop-below")) {
      row.classList.remove("drop-above", "drop-below");
    }
  }

  function attachRowDrag(row, layer) {
    const draggable = layer.kind !== "background" && !layer.locked;
    row.draggable = draggable;
    if (draggable) {
      row.addEventListener("dragstart", (event) => {
        dragLayerId = layer.id;
        row.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", layer.id);
      });
      row.addEventListener("dragend", () => {
        dragLayerId = null;
        row.classList.remove("is-dragging");
        clearDropMarks();
      });
    }
    row.addEventListener("dragover", (event) => {
      if (!dragLayerId || dragLayerId === layer.id || layer.kind === "background") return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const bounds = row.getBoundingClientRect();
      const above = event.clientY < bounds.top + bounds.height / 2;
      clearDropMarks();
      row.classList.add(above ? "drop-above" : "drop-below");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drop-above", "drop-below"));
    row.addEventListener("drop", (event) => {
      if (!dragLayerId || dragLayerId === layer.id || layer.kind === "background") return;
      event.preventDefault();
      const bounds = row.getBoundingClientRect();
      const above = event.clientY < bounds.top + bounds.height / 2;
      // Visual list is top-first; scene order is bottom-first.
      const visual = [...scene().order].reverse().filter((id) => id !== dragLayerId);
      const at = visual.indexOf(layer.id);
      visual.splice(above ? at : at + 1, 0, dragLayerId);
      const moved = dragLayerId;
      clearDropMarks();
      edit(() => {
        const changed = setLayerOrder(scene(), visual.reverse());
        if (changed) selectLayer(scene(), moved);
        return changed;
      });
    });
  }

  function syncLayerList() {
    const current = scene();
    el.layerList.replaceChildren(
      ...[...current.order].reverse().map((layerId) => {
        const layer = current.layers[layerId];
        const row = document.createElement("li");
        row.dataset.layerId = layer.id;
        if (layer.id === current.selectedLayerId) row.className = "is-selected";
        attachRowDrag(row, layer);

        const button = document.createElement("button");
        button.className = "layer-select";
        button.type = "button";
        button.dataset.layerId = layer.id;
        if (layer.id === current.selectedLayerId) button.setAttribute("aria-current", "true");

        const tag = document.createElement("span");
        tag.className = "layer-kind";
        tag.textContent = KIND_TAG[layer.kind] ?? "LAYER";

        const copy = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = layer.label;
        const small = document.createElement("small");
        small.textContent = layerDetail(layer);
        copy.append(strong, small);

        const lock = document.createElement("span");
        lock.className = `layer-lock${layer.locked ? "" : " layer-lock--open"}`;
        lock.setAttribute("aria-label", layer.locked ? "Locked" : "Unlocked");
        lock.append(lockIcon(layer.locked));

        button.append(tag, copy, lock);
        button.addEventListener("click", () => {
          selectLayer(current, layer.id);
          app.requestRender();
        });
        button.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          openLayerMenu(layer.id, event.clientX, event.clientY);
        });
        button.addEventListener("keydown", (event) => {
          if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
          event.preventDefault();
          const bounds = button.getBoundingClientRect();
          openLayerMenu(layer.id, bounds.left + 24, bounds.bottom + 4);
        });

        const trigger = document.createElement("button");
        trigger.className = "layer-menu-trigger";
        trigger.type = "button";
        trigger.setAttribute("aria-label", `Actions for ${layer.label}`);
        trigger.setAttribute("aria-haspopup", "menu");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", "layer-context-menu");
        const dots = document.createElementNS(SVG_NS, "svg");
        dots.setAttribute("viewBox", "0 0 20 20");
        dots.setAttribute("aria-hidden", "true");
        for (const cx of [5, 10, 15]) {
          const dot = document.createElementNS(SVG_NS, "circle");
          dot.setAttribute("cx", String(cx));
          dot.setAttribute("cy", "10");
          dot.setAttribute("r", "1.35");
          dots.append(dot);
        }
        trigger.append(dots);
        trigger.addEventListener("click", () => {
          const bounds = trigger.getBoundingClientRect();
          openLayerMenu(layer.id, bounds.right, bounds.bottom + 4);
        });

        row.append(button, trigger);
        return row;
      }),
    );
  }

  function focusLayerRow(layerId) {
    requestAnimationFrame(() => {
      el.layerList.querySelector(`li[data-layer-id="${layerId}"] .layer-select`)?.focus();
    });
  }

  // -------------------------------------------------------- context menu

  function syncContextMenuActions() {
    const current = scene();
    const layer = current.layers[contextMenuLayerId];
    if (!layer) return;
    const index = current.order.indexOf(layer.id);
    const movable = ["character", "logo", "text"].includes(layer.kind);
    const visual = ["character", "logo"].includes(layer.kind);
    const top = current.order.length - 1;
    const disabled = {
      duplicate: !movable || layer.locked,
      lock: layer.kind === "background",
      "flip-x": !visual || layer.locked,
      front: layer.locked || index === top || index === 0,
      up: layer.locked || index === top || index === 0,
      down: layer.locked || index <= 1,
      back: layer.locked || index <= 1,
      delete: !layer.deletable || layer.locked,
    };
    for (const action of el.contextMenuActions) {
      if (action.dataset.layerAction === "lock") {
        action.textContent = layer.locked ? "Unlock layer" : "Lock layer";
      }
      action.disabled = Boolean(disabled[action.dataset.layerAction]);
      action.setAttribute("aria-disabled", String(action.disabled));
    }
  }

  function closeLayerContextMenu({ restoreFocus = false } = {}) {
    if (el.contextMenu.hidden) return false;
    const returning = contextMenuLayerId;
    el.contextMenu.hidden = true;
    contextMenuLayerId = null;
    for (const trigger of el.layerList.querySelectorAll(".layer-menu-trigger")) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus && returning && scene().layers[returning]) focusLayerRow(returning);
    return true;
  }

  function openLayerMenu(layerId, clientX, clientY) {
    if (!scene().layers[layerId]) return;
    closeLayerContextMenu();
    selectLayer(scene(), layerId);
    app.requestRender();
    contextMenuLayerId = layerId;
    syncContextMenuActions();

    el.contextMenu.style.left = "0px";
    el.contextMenu.style.top = "0px";
    el.contextMenu.hidden = false;
    const bounds = el.contextMenu.getBoundingClientRect();
    const margin = 8;
    el.contextMenu.style.left = `${Math.max(margin, Math.min(clientX, window.innerWidth - bounds.width - margin))}px`;
    el.contextMenu.style.top = `${Math.max(margin, Math.min(clientY, window.innerHeight - bounds.height - margin))}px`;

    requestAnimationFrame(() => {
      (el.contextMenu.querySelector("button:not(:disabled)") ?? el.contextMenu).focus();
    });
  }

  function handleContextMenuKeydown(event) {
    const actions = el.contextMenuActions.filter((action) => !action.disabled);
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeLayerContextMenu({ restoreFocus: true });
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || actions.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const index = actions.indexOf(document.activeElement);
    let next = 0;
    if (event.key === "End") next = actions.length - 1;
    if (event.key === "ArrowDown") next = (index + 1 + actions.length) % actions.length;
    if (event.key === "ArrowUp") next = (index - 1 + actions.length) % actions.length;
    actions[next].focus();
  }

  function runLayerAction(action) {
    const layerId = contextMenuLayerId;
    if (!layerId || !scene().layers[layerId]) return;
    closeLayerContextMenu();
    selectLayer(scene(), layerId);

    edit(() => {
      const layer = scene().layers[layerId];
      if (action === "duplicate") return Boolean(duplicateLayer(scene(), layerId));
      if (action === "lock") {
        if (layer.kind === "background") return false;
        layer.locked = !layer.locked;
        return true;
      }
      if (action === "flip-x") {
        if (layer.locked || !["character", "logo"].includes(layer.kind)) return false;
        layer.flipX = !layer.flipX;
        return true;
      }
      if (["front", "up", "down", "back"].includes(action)) {
        reorderLayer(scene(), layerId, action);
        return true;
      }
      if (action === "delete") return removeLayer(scene(), layerId);
      return false;
    });
    focusLayerRow(scene().selectedLayerId);
  }

  // -------------------------------------------------------- export menu

  function setExportMenu(open) {
    if (open && app.showStep) { app.showStep("review"); return; }
    if (open) syncPreflight();
    el.exportMenu.hidden = !open;
    el.exportButton.setAttribute("aria-expanded", String(open));
  }

  /** Rebuild the preflight list in the export popover from the current scene. */
  function syncPreflight() {
    const checks = preflight(scene(), { qr: app.qr, qrCode: app.qrCode });
    const summary = summarize(checks);
    el.preflightSummary.dataset.level = summary.level;
    el.preflightSummaryText.textContent = summary.text;
    // Passing checks stay collapsed behind the summary; only problems get a row.
    const shown = checks.filter((check) => check.level !== "pass");
    el.preflightList.hidden = shown.length === 0;
    el.preflightList.replaceChildren(
      ...shown.map((check) => {
        const item = document.createElement("li");
        item.className = "preflight__item";
        item.dataset.level = check.level;
        const body = document.createElement(check.layerId ? "button" : "div");
        body.className = "preflight__row";
        if (check.layerId) {
          body.type = "button";
          body.title = "Select this layer";
          body.addEventListener("click", () => {
            setExportMenu(false);
            selectLayer(scene(), check.layerId);
            app.requestRender();
          });
        }
        const title = document.createElement("strong");
        title.textContent = check.title;
        const detail = document.createElement("span");
        detail.textContent = check.detail;
        body.append(title, detail);
        item.append(body);
        return item;
      }),
    );
  }

  function setFileMenu(open) {
    el.fileMenu.hidden = !open;
    el.fileButton.setAttribute("aria-expanded", String(open));
  }

  function closeMenus() {
    const menuClosed = closeLayerContextMenu();
    const exportOpen = !el.exportMenu.hidden;
    if (exportOpen) setExportMenu(false);
    const fileOpen = !el.fileMenu.hidden;
    if (fileOpen) setFileMenu(false);
    return menuClosed || exportOpen || fileOpen;
  }

  // ---------------------------------------------------------- design files

  function saveDesign() {
    const json = designToJson(scene(), { name: el.documentName.value.trim() || "Untitled card" });
    saveBlob(new Blob([json], { type: "application/json" }), `${documentSlug()}.json`);
    app.setStatus("Design saved", "ready");
  }

  function openDesignPicker() {
    el.fileInput.value = "";
    el.fileInput.click();
  }

  /** Replace the current scene with a parsed design as one undo step. */
  function loadDesignText(text) {
    let parsed;
    try {
      parsed = parseDesign(text);
    } catch (error) {
      app.setStatus(error.message, "error");
      return;
    }
    edit(() => {
      Object.assign(scene(), parsed.scene);
      return true;
    });
    el.documentName.value = parsed.name;
    syncTemplates();
    const note = parsed.dropped ? ` · ${parsed.dropped} layer${parsed.dropped === 1 ? "" : "s"} skipped` : "";
    app.setStatus(`Opened ${parsed.name}${note}`, parsed.dropped ? "error" : "ready");
  }

  function newCard() {
    if (app.history.size > 0 && !window.confirm("Start a new card? Unsaved changes will be lost.")) return;
    edit(() => {
      const fresh = createEventScene(scene().mode);
      Object.assign(scene(), fresh);
      return true;
    });
    app.compositionDirty = false;
    el.documentName.value = "Untitled card";
    syncTemplates();
    app.setStatus("New card", "ready");
  }

  /** @returns {string} the document name reduced to a safe file-name stem. */
  function documentSlug() {
    const slug = el.documentName.value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "zcash-qr-card";
  }

  function saveBlob(blob, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function downloadPng() {
    app.setStatus("Rendering PNG…", "busy");
    try {
      const blob = await exportPngBlob(scene(), {
        assets: app.assets,
        qrCode: app.qrCode,
        installCode: app.installCode,
      });
      saveBlob(blob, `${documentSlug()}.png`);
      app.setStatus("PNG saved", "ready");
    } catch (error) {
      app.setStatus(`PNG export failed: ${error.message}`, "error");
    }
  }

  function printCard() {
    drawPrintCanvas(el.printCanvas, el.cardCanvas);
    document.body.classList.add("printing-card");
    window.print();
  }

  let batchFormat = "zip";
  let batchBusy = false;
  let batchImporting = false;
  const batchExclude = document.getElementById("batch-exclude");
  const batchFormats = document.getElementById("batch-formats");
  const batchStatus = document.getElementById("batch-status");
  const batchFailure = document.getElementById("batch-failure");
  const batchImport = document.getElementById("batch-import-button");
  const batchFile = document.getElementById("batch-file");
  listen(el.batchDialog, "cancel", event => { if (batchBusy || batchImporting) event.preventDefault(); });
  listen(el.batchDialog.querySelector("form"), "submit", event => event.preventDefault());

  function clearBatchFailure() {
    batchFailure.hidden = true;
    batchFailure.textContent = "";
  }

  function syncBatch() {
    const { items, errors, duplicates } = parseBatchLines(scene(), el.batchInput.value);
    const issues = [...errors, ...duplicates.map(item => ({line: item.line, message: `Duplicate of line ${item.firstLine}. This would reprint the same gift.`}))].sort((a, b) => a.line - b.line);
    const omitted = issues.length;
    document.getElementById("batch-exclude-row").hidden = omitted === 0 || items.length === 0;
    document.getElementById("batch-exclude-text").textContent = `Skip ${omitted} problem row${omitted === 1 ? "" : "s"} and make ${items.length} valid card${items.length === 1 ? "" : "s"}.`;
    el.batchCount.textContent = items.length + omitted === 0 ? "No cards yet" : `${items.length} ready${errors.length ? ` · ${errors.length} invalid` : ""}${duplicates.length ? ` · ${duplicates.length} duplicate` : ""}`;
    el.batchErrors.replaceChildren(...issues.map(error => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `Edit line ${error.line}: ${error.message}`;
      button.title = "Select this line to fix it";
      button.disabled = batchBusy;
      button.addEventListener("click", () => {
        const lines = el.batchInput.value.split("\n");
        const start = lines.slice(0, error.line - 1).reduce((total, line) => total + line.length + 1, 0);
        el.batchInput.focus();
        el.batchInput.setSelectionRange(start, start + lines[error.line - 1].length);
        const lineHeight = parseFloat(getComputedStyle(el.batchInput).lineHeight);
        el.batchInput.scrollTop = Math.max(0, (error.line - 2) * lineHeight);
      });
      item.append(button);
      return item;
    }));
    const ready = app.assetsLoaded && assetsReady(scene(), app.assets);
    el.batchRun.disabled = batchBusy || batchImporting || items.length === 0 || (omitted > 0 && !batchExclude.checked) || !ready;
    if (!batchBusy) {
      const count = items.length;
      el.batchRun.textContent = batchFormat === "sheet" ? (count ? `Preview ${Math.ceil(count / 2)} A4 sheet${count > 2 ? "s" : ""}` : "Preview A4 sheets") : (count ? `Download ${count} PNG${count === 1 ? "" : "s"} / ZIP` : "Download ZIP");
      batchStatus.textContent = batchImporting ? "Reading your text file…" : !ready ? "Waiting for the design artwork to load…" : !count ? (omitted ? "Fix the highlighted rows to continue." : "Add your list to get started.") : omitted && !batchExclude.checked ? "Fix the problem rows, or choose to skip them." : `Ready to make ${count} card${count === 1 ? "" : "s"} with your current design.`;
    }
    el.batchPreview.replaceChildren(...batchPreviewNodes(items));
    return items;
  }

  function batchPreviewNodes(items) {
    if (items.length === 0) return ["Add valid rows to see your output here."];
    const count = document.createElement("strong");
    count.textContent = `${items.length} card${items.length === 1 ? "" : "s"}`;
    const detail = document.createElement("span");
    if (batchFormat === "sheet") {
      detail.textContent = `${Math.ceil(items.length / 2)} A4 sheet${items.length > 2 ? "s" : ""}. Preview before printing at 100% scale.`;
    } else {
      const name = document.createElement("code");
      name.textContent = `${documentSlug()}-batch.zip`;
      detail.append(name, document.createElement("br"), items.length === 1 ? "card-001.png" : `card-001.png – card-${String(items.length).padStart(3, "0")}.png`);
    }
    const first = document.createElement("span");
    first.className = "batch-first-value";
    const value = items[0].value;
    first.textContent = `First QR: ${scene().mode === "giftcard" ? maskGiftLink(value) : value.length > 96 ? `${value.slice(0, 96)}…` : value}`;
    return [count, detail, first];
  }

  function openBatchDialog(format = "zip") {
    batchFormat = format;
    batchExclude.checked = false;
    for (const input of batchFormats.querySelectorAll("input")) input.checked = input.value === format;
    el.batchHint.textContent = MODES[scene().mode].batchHint;
    el.batchInput.placeholder = MODES[scene().mode].batchPlaceholder ?? "";
    document.getElementById("batch-gift-note").hidden = scene().mode !== "giftcard";
    el.batchProgress.hidden = true;
    clearBatchFailure();
    syncBatch();
    el.batchDialog.showModal();
    el.batchInput.focus();
  }

  function setBatchBusy(busy) {
    batchBusy = busy;
    batchFormats.disabled = busy;
    batchExclude.disabled = busy;
    batchImport.disabled = busy;
    el.batchInput.disabled = busy;
    el.batchCancel.disabled = busy;
    el.batchDialog.setAttribute("aria-busy", String(busy));
    syncBatch();
  }

  async function runBatch() {
    const items = syncBatch();
    if (el.batchRun.disabled) return;
    clearBatchFailure();
    setBatchBusy(true);
    el.batchRun.textContent = "Preparing cards…";
    el.batchProgress.hidden = false;
    el.batchProgress.max = items.length;
    el.batchProgress.value = 0;
    const onProgress = (done, total) => {
      el.batchProgress.value = done;
      batchStatus.textContent = done === total ? "Finishing your output…" : `Preparing card ${done + 1} of ${total}. Keep this window open.`;
      app.setStatus(`Preparing ${done}/${total}…`, "busy");
    };
    onProgress(0, items.length);
    let success = "";
    try {
      if (batchFormat === "sheet") {
        await app.prepareSheets(items, onProgress);
        el.batchDialog.close();
        app.setStatus(`Prepared ${items.length} cards for printing`, "ready");
        return;
      }
      const blob = await exportBatch(snapshot(scene()), items, {
        assets: app.assets,
        installCode: app.installCode,
        setContent: scene().mode === "giftcard" ? (current, item) => numberedCard(current, item.index) : undefined,
        onProgress,
      });
      saveBlob(blob, `${documentSlug()}-batch.zip`);
      success = `ZIP download started · ${items.length} card${items.length === 1 ? "" : "s"}. Your list is kept here for another export.`;
      app.setStatus(`Batch export done · ${items.length} cards`, "ready");
    } catch (error) {
      batchFailure.textContent = "Could not prepare the cards. Your list is unchanged. Check the rows or try a smaller batch, then retry.";
      batchFailure.hidden = false;
      app.setStatus(`Batch export failed: ${error.message}`, "error");
    } finally {
      setBatchBusy(false);
      el.batchProgress.hidden = true;
      if (success) batchStatus.textContent = success;
    }
  }

  // ------------------------------------------------------------- wiring

  for (const input of el.modeInputs) {
    listen(input, "change", () => {
      if (input.checked) switchMode(input.value);
    });
  }

  for (const tab of el.toolTabs) {
    listen(tab, "click", () => {
      setActivePanel(tab.dataset.panel);
      setDrawer(true);
      if (tab.dataset.panel === "templates") {
        syncTemplates();
        syncLayoutPreviews();
      }
    });
  }
  for (const button of el.drawerCloseButtons) {
    listen(button, "click", () => setDrawer(false));
  }

  for (const input of el.backgroundInputs) {
    listen(input, "change", () => {
      if (!input.checked) return;
      edit(() => {
        scene().layers.background.assetId = input.value;
        return true;
      });
    });
  }
  for (const card of el.characterCards) {
    listen(card, "click", () => applyCharacterCard(card.dataset.characterId));
  }
  for (const card of el.logoCards) {
    listen(card, "click", () => applyLogoCard(card.dataset.logoId));
  }
  listen(el.addCharacter, "click", () => {
    edit(() => {
      const made = makeCharacterLayer(pick.character, scene());
      if (!made) return false;
      addLayer(scene(), made);
      return true;
    });
  });
  listen(el.addLogo, "click", () => {
    edit(() => {
      const made = makeLogoLayer(pick.logo, {}, scene());
      if (!made) return false;
      addLayer(scene(), made);
      return true;
    });
  });
  listen(el.addHeading, "click", () => addTextLayer("heading"));
  listen(el.addBody, "click", () => addTextLayer("body"));

  for (const input of el.layoutInputs) {
    listen(input, "change", () => {
      if (input.checked) edit(() => applyLayout(scene(), input.value));
    });
  }
  for (const input of el.qrStyleInputs) {
    listen(input, "change", () => {
      if (!input.checked) return;
      edit(() => {
        scene().qrStyle = input.value;
        return true;
      });
    });
  }
  for (const input of el.qrShapeInputs) {
    listen(input, "change", () => {
      if (input.checked) edit(() => setQrDesign(scene(), { shape: input.value }));
    });
  }
  for (const input of el.qrEmblemInputs) {
    listen(input, "change", () => {
      if (input.checked) edit(() => setQrDesign(scene(), { emblem: input.value }));
    });
  }
  for (const input of el.qrColorInputs) {
    listen(input, "change", () => {
      if (!input.checked) return;
      edit(() => setQrDesign(scene(), { color: paletteValue(QR_MODULE_PALETTE, input.value, el.qrColorCustom) }));
    });
  }
  listen(el.qrColorCustom, "input", () => {
    const custom = el.qrColorInputs.find((input) => input.value === "custom");
    if (custom) custom.checked = true;
    edit(() => setQrDesign(scene(), { color: el.qrColorCustom.value }));
  });

  for (const [id, key] of CONTENT_FIELDS) {
    const field = document.getElementById(id);
    if (!field) continue;
    listen(field, "focus", () => {
      fieldSnapshot = app.takeSnapshot();
    });
    listen(field, "input", () => {
      scene().content[key] = field.value;
      if (key === "memo") updateMemoCount();
      app.requestRender();
    });
    listen(field, "change", () => {
      if (fieldSnapshot) app.commit(fieldSnapshot);
      fieldSnapshot = null;
      app.requestRender();
    });
  }
  listen(el.includeInstall, "change", () => {
    edit(() => setIncludeInstall(scene(), el.includeInstall.checked));
  });
  listen(el.showSummary, "change", () => {
    edit(() => setPaymentSummary(scene(), el.showSummary.checked));
  });

  for (const input of [
    el.transformX,
    el.transformY,
    el.transformWidth,
    el.transformHeight,
    el.transformRotation,
  ]) {
    listen(input, "focus", () => {
      fieldSnapshot = app.takeSnapshot();
    });
    listen(input, "input", () => {
      const layer = selectedLayer(scene());
      const value = Number(input.value);
      if (!layer || layer.locked || !Number.isFinite(value)) return;
      const props = {};
      if (input === el.transformX) props.x = value;
      if (input === el.transformY) props.y = value;
      if (input === el.transformWidth) {
        props.width = value;
        if (layer.kind === "qr") props.height = value;
        else if (layer.kind === "install") {
          props.height = value / (INSTALL_LAYER.block.width / INSTALL_LAYER.block.height);
        }
        else if (layer.kind !== "text" && layer.width) {
          props.height = value * (layer.height / layer.width);
        }
      }
      if (input === el.transformHeight && layer.kind !== "text") {
        props.height = value;
        if (layer.kind === "qr") props.width = value;
        else if (layer.kind === "install") {
          props.width = value * (INSTALL_LAYER.block.width / INSTALL_LAYER.block.height);
        }
        else if (layer.height) props.width = value * (layer.width / layer.height);
      }
      if (input === el.transformRotation) props.rotation = value;
      setLayerProps(scene(), layer.id, props);
      if (layer.kind === "text") syncTextLayerHeight(layer);
      app.requestRender();
    });
    listen(input, "change", () => {
      if (fieldSnapshot) app.commit(fieldSnapshot);
      fieldSnapshot = null;
      app.requestRender();
    });
  }

  listen(el.flipButton, "click", () => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.locked || !["character", "logo"].includes(layer.kind)) return false;
      layer.flipX = !layer.flipX;
      return true;
    });
  });
  listen(el.lockButton, "click", () => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.kind === "background") return false;
      layer.locked = !layer.locked;
      return true;
    });
  });
  listen(el.duplicateButton, "click", () => {
    edit(() => Boolean(duplicateLayer(scene(), scene().selectedLayerId)));
  });
  listen(el.deleteButton, "click", () => {
    edit(() => removeLayer(scene(), scene().selectedLayerId));
  });

  const commitColor = (palette, id, customInput) => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.locked) return false;
      setLayerProps(scene(), layer.id, { color: paletteValue(palette, id, customInput) });
      return true;
    });
  };
  for (const input of el.logoColorInputs) {
    listen(input, "change", () => {
      if (input.checked) commitColor(LOGO_PALETTE, input.value, el.logoColorCustom);
    });
  }
  listen(el.logoColorCustom, "input", () => {
    const custom = el.logoColorInputs.find((input) => input.value === "custom");
    if (custom) custom.checked = true;
    commitColor(LOGO_PALETTE, "custom", el.logoColorCustom);
  });
  for (const input of el.textColorInputs) {
    listen(input, "change", () => {
      if (input.checked) commitColor(TEXT_PALETTE, input.value, el.textColorCustom);
    });
  }
  listen(el.textColorCustom, "input", () => {
    const custom = el.textColorInputs.find((input) => input.value === "custom");
    if (custom) custom.checked = true;
    commitColor(TEXT_PALETTE, "custom", el.textColorCustom);
  });

  listen(el.textContent, "focus", () => {
    fieldSnapshot = app.takeSnapshot();
  });
  listen(el.textContent, "input", () => {
    const layer = selectedLayer(scene());
    if (!layer || layer.kind !== "text") return;
    setLayerProps(scene(), layer.id, { text: el.textContent.value });
    syncTextLayerHeight(layer);
    app.requestRender();
  });
  listen(el.textContent, "change", () => {
    if (fieldSnapshot) app.commit(fieldSnapshot);
    fieldSnapshot = null;
    app.requestRender();
  });

  const commitTextProps = (props) => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.kind !== "text" || layer.locked) return false;
      setLayerProps(scene(), layer.id, props);
      syncTextLayerHeight(layer);
      return true;
    });
  };
  listen(el.textFont, "change", () => {
    const family = el.textFont.value;
    const layer = selectedLayer(scene());
    commitTextProps({
      fontFamily: family,
      fontWeight: fontWeightFor(family, layer?.fontWeight ?? 500),
    });
  });
  listen(el.textUppercase, "change", () => {
    commitTextProps({ uppercase: el.textUppercase.checked });
  });
  listen(el.textSize, "change", () => {
    const size = Number(el.textSize.value);
    if (Number.isFinite(size) && size > 0) commitTextProps({ fontSize: size });
  });
  listen(el.textWeight, "change", () => {
    commitTextProps({ fontWeight: Number(el.textWeight.value) || 500 });
  });
  for (const input of el.textAlignInputs) {
    listen(input, "change", () => {
      if (input.checked) commitTextProps({ align: input.value });
    });
  }

  listen(el.contextMenu, "keydown", handleContextMenuKeydown);
  listen(el.contextMenu, "focusout", () => {
    requestAnimationFrame(() => {
      if (!el.contextMenu.contains(document.activeElement)) closeLayerContextMenu();
    });
  });
  for (const action of el.contextMenuActions) {
    listen(action, "click", () => runLayerAction(action.dataset.layerAction));
  }

  listen(el.status, "click", () => {
    if (el.status.dataset.state !== "error") return;
    const field = el.modeFieldsets
      .find((fieldset) => !fieldset.hidden)
      ?.querySelector("input, textarea");
    field?.focus();
    field?.select?.();
  });

  listen(el.fileButton, "click", () => {
    const open = el.fileMenu.hidden;
    closeMenus();
    setFileMenu(open);
  });
  for (const item of el.fileMenu.querySelectorAll("[data-file-action]")) {
    listen(item, "click", () => {
      setFileMenu(false);
      const action = item.dataset.fileAction;
      if (action === "save") saveDesign();
      if (action === "open") openDesignPicker();
      if (action === "new") newCard();
    });
  }
  listen(el.fileInput, "change", () => {
    const file = el.fileInput.files?.[0];
    if (!file) return;
    file.text().then(loadDesignText, (error) => app.setStatus(`Could not read the file: ${error.message}`, "error"));
  });
  app.saveDesign = saveDesign;
  app.openDesign = openDesignPicker;

  listen(el.exportButton, "click", () => {
    const open = el.exportMenu.hidden;
    closeMenus();
    setExportMenu(open);
  });
  for (const item of el.exportMenu.querySelectorAll("[data-export-action]")) {
    listen(item, "click", () => {
      setExportMenu(false);
      const action = item.dataset.exportAction;
      if (action === "png") downloadPng();
      if (action === "print") printCard();
      if (action === "batch") openBatchDialog();
    });
  }

  listen(el.batchInput, "input", () => { batchExclude.checked = false; clearBatchFailure(); syncBatch(); });
  listen(batchFormats, "change", event => { batchFormat = event.target.value; clearBatchFailure(); syncBatch(); });
  listen(batchImport, "click", () => batchFile.click());
  listen(batchFile, "change", async () => {
    const file = batchFile.files[0];
    if (!file) return;
    clearBatchFailure();
    batchImporting = true;
    batchImport.disabled = true;
    el.batchCancel.disabled = true;
    syncBatch();
    try {
      const text = await file.text();
      const separator = el.batchInput.value && !el.batchInput.value.endsWith("\n") ? "\n" : "";
      el.batchInput.value += separator + text;
      batchExclude.checked = false;
    } catch {
      batchFailure.textContent = "Could not read this file. Paste its contents into the list instead.";
      batchFailure.hidden = false;
    } finally {
      batchImporting = false;
      batchImport.disabled = false;
      el.batchCancel.disabled = false;
      batchFile.value = "";
      syncBatch();
    }
  });
  listen(document.getElementById("batch-exclude"), "change", syncBatch);
  listen(el.batchRun, "click", runBatch);
  listen(el.batchCancel, "click", () => el.batchDialog.close());
  function openHelp() {
    closeMenus();
    if (!el.helpDialog.open) el.helpDialog.showModal();
  }
  listen(el.helpButton, "click", openHelp);
  app.openHelp = openHelp;

  listen(el.undo, "click", () => app.undo());
  listen(el.redo, "click", () => app.redo());

  const onDocumentPointerDown = (event) => {
    if (!el.contextMenu.hidden && !el.contextMenu.contains(event.target)) {
      closeLayerContextMenu();
    }
    if (!el.exportMenu.hidden && !event.target.closest?.(".export-wrap")) {
      setExportMenu(false);
    }
    if (!el.fileMenu.hidden && !event.target.closest?.(".file-wrap")) {
      setFileMenu(false);
    }
  };
  const onResize = () => closeLayerContextMenu();
  const onScroll = () => closeLayerContextMenu();
  const onBeforeUnload = (event) => {
    if (app.history.size === 0) return;
    event.preventDefault();
    event.returnValue = "";
  };
  listen(document, "pointerdown", onDocumentPointerDown);
  listen(window, "resize", onResize);
  listen(window, "scroll", onScroll, true);
  listen(window, "beforeunload", onBeforeUnload);

  // -------------------------------------------------------------- sync

  /** Re-sync every panel from the current scene. */
  function sync() {
    const current = scene();
    el.body.dataset.mode = current.mode;
    for (const input of el.modeInputs) input.checked = input.value === current.mode;
    el.giftWarning.toggleAttribute("hidden", current.mode !== "giftcard");
    for (const fieldset of el.modeFieldsets) {
      fieldset.toggleAttribute("hidden", fieldset.dataset.modeFields !== current.mode);
    }

    for (const input of el.backgroundInputs) {
      input.checked = input.value === current.layers.background.assetId;
    }
    for (const input of el.layoutInputs) input.checked = input.value === current.layoutId;
    scheduleLayoutPreviews();
    for (const input of el.qrStyleInputs) input.checked = input.value === current.qrStyle;
    const design = current.qrDesign ?? { shape: "square", color: null, emblem: "none" };
    for (const input of el.qrShapeInputs) input.checked = input.value === design.shape;
    for (const input of el.qrEmblemInputs) input.checked = input.value === design.emblem;
    const colorId = design.color ? paletteId(QR_MODULE_PALETTE, design.color) : "ink";
    for (const input of el.qrColorInputs) input.checked = input.value === colorId;
    if (colorId === "custom" && design.color) el.qrColorCustom.value = design.color;
    for (const card of el.templateGrid.querySelectorAll(".template-card")) {
      card.setAttribute("aria-pressed", String(card.dataset.templateId === current.templateId));
    }

    const selected = selectedLayer(current);
    const characterId = selected?.kind === "character" ? selected.assetId : pick.character;
    for (const card of el.characterCards) {
      card.setAttribute("aria-pressed", String(card.dataset.characterId === characterId));
    }
    const logoId = selected?.kind === "logo" ? selected.assetId : pick.logo;
    for (const card of el.logoCards) {
      card.setAttribute("aria-pressed", String(card.dataset.logoId === logoId));
    }

    for (const [id, key] of CONTENT_FIELDS) {
      const field = document.getElementById(id);
      if (!field || document.activeElement === field) continue;
      const value = current.content[key] ?? "";
      if (field.value !== value) field.value = value;
    }
    el.includeInstall.checked = current.includeInstall;
    el.showSummary.checked = Boolean(roleLayer(current, "summary"));
    updateMemoCount();

    const key = current.mode === "payment" ? "address" : current.mode === "giftcard" ? "giftLink" : "url";
    el.contentError.textContent = current.content[key].trim() ? app.qr.error ?? "" : "";
    el.contentWarning.textContent = app.qr.warnings.join(" ");
    const preview = app.qr.value ?? "";
    el.valuePreview.textContent = current.mode === "giftcard" ? maskGiftLink(preview) : preview;

    el.body.dataset.qrState = app.qrCode ? "ready" : "pending";

    syncSelection();
    syncLayerList();
    el.undo.disabled = !app.history.canUndo;
    el.redo.disabled = !app.history.canRedo;
    if (!el.exportMenu.hidden) syncPreflight();
    if (el.batchDialog.open && !batchBusy && !batchImporting) syncBatch();

    // Batch export only needs the assets; single exports also need a valid QR.
    el.exportButton.disabled = !app.assetsLoaded;
    const singleReady = app.canExport();
    for (const item of el.exportMenu.querySelectorAll("[data-export-action]")) {
      const isBatch = item.dataset.exportAction === "batch";
      item.disabled = isBatch ? false : !singleReady;
      item.title = !isBatch && !singleReady ? "Fix the QR content first" : "";
    }
  }

  setActivePanel(activePanel);
  return {
    sync,
    syncTemplates,
    closeMenus,
    openLayerMenu,
    setDrawer,
    downloadPng,
    printCard,
    openBatchDialog,
    destroy() {
      for (const dispose of disposables.splice(0)) dispose();
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    },
  };
}
