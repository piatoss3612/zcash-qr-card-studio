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
  templatesForMode,
} from "./catalog.js";
import {
  addLayer,
  applyLayout,
  applyTemplate,
  createScene,
  duplicateLayer,
  makeCharacterLayer,
  makeLogoLayer,
  makeTextLayer,
  removeLayer,
  reorderLayer,
  selectLayer,
  selectedLayer,
  setIncludeInstall,
  setLayerProps,
  setMode,
} from "./scene.js";
import { maskGiftLink, parseBatchLines } from "./qr-content.js";
import {
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
    logoAddColorInputs: [...document.querySelectorAll('input[name="logo-add-color"]')],
    logoAddColorCustom: document.getElementById("logo-add-color-custom"),
    addHeading: document.getElementById("add-heading-button"),
    addBody: document.getElementById("add-body-button"),
    layoutInputs: [...document.querySelectorAll('input[name="layout"]')],
    qrStyleInputs: [...document.querySelectorAll('input[name="qr-style"]')],

    modeFieldsets: [...document.querySelectorAll("[data-mode-fields]")],
    includeInstall: document.getElementById("include-install"),
    memoCount: document.getElementById("memo-count"),
    contentError: document.getElementById("content-error"),
    contentWarning: document.getElementById("content-warning"),
    valuePreview: document.getElementById("qr-value-preview"),

    selectionBlocks: [...document.querySelectorAll("[data-selection-kind]")],
    selectedLayerName: document.getElementById("selected-layer-name"),
    transformBlock: document.getElementById("transform-block"),
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
    textAlignInputs: [...document.querySelectorAll('input[name="text-align"]')],
    textColorInputs: [...document.querySelectorAll('input[name="text-color"]')],
    textColorCustom: document.getElementById("text-color-custom"),

    layerList: document.getElementById("layer-list"),
    contextMenu: document.getElementById("layer-context-menu"),

    exportButton: document.getElementById("export-button"),
    exportMenu: document.getElementById("export-menu"),
    printCanvas: document.getElementById("print-canvas"),
    cardCanvas: document.getElementById("card-canvas"),

    batchDialog: document.getElementById("batch-dialog"),
    batchInput: document.getElementById("batch-input"),
    batchHint: document.getElementById("batch-hint"),
    batchCount: document.getElementById("batch-count"),
    batchErrors: document.getElementById("batch-errors"),
    batchProgress: document.getElementById("batch-progress"),
    batchRun: document.getElementById("batch-run-button"),
    batchCancel: document.getElementById("batch-cancel-button"),
  };
  el.contextMenuActions = [...el.contextMenu.querySelectorAll("[data-layer-action]")];

  const pick = { character: "samurai", logo: "vizor" };
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
        const preview = createScene({ mode: template.mode, templateId: template.id });
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
          edit(() => applyTemplate(scene(), template.id), { composition: false });
          app.compositionDirty = false;
        });
        return card;
      }),
    );
  }

  // ------------------------------------------------------------- assets

  function currentAddColor() {
    const id = el.logoAddColorInputs.find((input) => input.checked)?.value ?? "original";
    return paletteValue(LOGO_PALETTE, id, el.logoAddColorCustom);
  }

  function applyCharacterCard(assetId) {
    pick.character = assetId;
    const layer = selectedLayer(scene());
    edit(() => {
      if (layer && layer.kind === "character" && !layer.locked) {
        const replacement = makeCharacterLayer(assetId, scene());
        if (!replacement) return false;
        setLayerProps(scene(), layer.id, {
          assetId,
          label: CHARACTERS[assetId]?.label ?? "Vizorcat",
          x: layer.x + (layer.width - replacement.width) / 2,
          y: layer.y + layer.height - replacement.height,
          width: replacement.width,
          height: replacement.height,
        });
      } else {
        const made = makeCharacterLayer(assetId, scene());
        if (!made) return false;
        addLayer(scene(), made);
      }
      return true;
    });
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
          color: asset.recolorable ? layer.color : null,
          ...(changed ? { width: asset.width, height: asset.height } : {}),
        });
      } else {
        const made = makeLogoLayer(assetId, { color: currentAddColor() }, scene());
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
  }

  // ------------------------------------------------------------ content

  function updateMemoCount() {
    el.memoCount.textContent = String(encoder.encode(scene().content.memo ?? "").length);
  }

  function switchMode(mode) {
    edit(() => {
      // An untouched composition follows the card type; edited work is preserved.
      if (!app.compositionDirty) applyTemplate(scene(), MODES[mode].defaultTemplate);
      else setMode(scene(), mode);
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
      el.textFont.value = layer.fontFamily;
      setValue(el.textSize, layer.fontSize);
      // Zarathustra only ships at 400, which the select does not offer; show its
      // closest option while the control is disabled.
      el.textWeight.value = String(layer.fontWeight === 400 ? 500 : layer.fontWeight);
      el.textWeight.disabled = layer.fontFamily === "Zarathustra";
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

  function syncLayerList() {
    const current = scene();
    el.layerList.replaceChildren(
      ...[...current.order].reverse().map((layerId) => {
        const layer = current.layers[layerId];
        const row = document.createElement("li");
        row.dataset.layerId = layer.id;
        if (layer.id === current.selectedLayerId) row.className = "is-selected";

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
    el.exportMenu.hidden = !open;
    el.exportButton.setAttribute("aria-expanded", String(open));
  }

  function closeMenus() {
    const menuClosed = closeLayerContextMenu();
    const exportOpen = !el.exportMenu.hidden;
    if (exportOpen) setExportMenu(false);
    return menuClosed || exportOpen;
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
    window.print();
  }

  // ------------------------------------------------------- batch dialog

  function syncBatch() {
    const { items, errors } = parseBatchLines(scene(), el.batchInput.value);
    el.batchCount.textContent = `${items.length} card${items.length === 1 ? "" : "s"}`;
    el.batchErrors.replaceChildren(
      ...errors.slice(0, 8).map((error) => {
        const item = document.createElement("li");
        item.textContent = `Line ${error.line}: ${error.message}`;
        return item;
      }),
    );
    el.batchRun.disabled = items.length === 0;
    return items;
  }

  function openBatchDialog() {
    el.batchHint.textContent = MODES[scene().mode].batchHint;
    el.batchInput.placeholder = MODES[scene().mode].batchPlaceholder ?? "";
    el.batchProgress.hidden = true;
    syncBatch();
    el.batchDialog.showModal();
  }

  async function runBatch() {
    const items = syncBatch();
    if (items.length === 0) return;
    el.batchRun.disabled = true;
    el.batchProgress.hidden = false;
    el.batchProgress.max = items.length;
    el.batchProgress.value = 0;
    app.setStatus(`Exporting 0/${items.length}…`, "busy");
    try {
      const blob = await exportBatch(scene(), items, {
        assets: app.assets,
        installCode: app.installCode,
        onProgress: (done, total) => {
          el.batchProgress.value = done;
          app.setStatus(`Exporting ${done}/${total}…`, "busy");
        },
      });
      saveBlob(blob, `${documentSlug()}-batch.zip`);
      app.setStatus(`Batch export done · ${items.length} cards`, "ready");
      el.batchDialog.close();
    } catch (error) {
      app.setStatus(`Batch export failed: ${error.message}`, "error");
    } finally {
      el.batchRun.disabled = false;
      el.batchProgress.hidden = true;
    }
  }

  // ------------------------------------------------------------- wiring

  for (const input of el.modeInputs) {
    input.addEventListener("change", () => {
      if (input.checked) switchMode(input.value);
    });
  }

  for (const tab of el.toolTabs) {
    tab.addEventListener("click", () => {
      if (drawerOpen && activePanel === tab.dataset.panel) {
        setDrawer(false);
        return;
      }
      setActivePanel(tab.dataset.panel);
      setDrawer(true);
      if (tab.dataset.panel === "templates") syncTemplates();
    });
  }
  for (const button of el.drawerCloseButtons) {
    button.addEventListener("click", () => setDrawer(false));
  }

  for (const input of el.backgroundInputs) {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      edit(() => {
        scene().layers.background.assetId = input.value;
        return true;
      });
    });
  }
  for (const card of el.characterCards) {
    card.addEventListener("click", () => applyCharacterCard(card.dataset.characterId));
  }
  for (const card of el.logoCards) {
    card.addEventListener("click", () => applyLogoCard(card.dataset.logoId));
  }
  el.addCharacter.addEventListener("click", () => {
    edit(() => {
      const made = makeCharacterLayer(pick.character, scene());
      if (!made) return false;
      addLayer(scene(), made);
      return true;
    });
  });
  el.addLogo.addEventListener("click", () => {
    edit(() => {
      const made = makeLogoLayer(pick.logo, { color: currentAddColor() }, scene());
      if (!made) return false;
      addLayer(scene(), made);
      return true;
    });
  });
  el.addHeading.addEventListener("click", () => addTextLayer("heading"));
  el.addBody.addEventListener("click", () => addTextLayer("body"));

  for (const input of el.layoutInputs) {
    input.addEventListener("change", () => {
      if (input.checked) edit(() => applyLayout(scene(), input.value));
    });
  }
  for (const input of el.qrStyleInputs) {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      edit(() => {
        scene().qrStyle = input.value;
        return true;
      });
    });
  }

  for (const [id, key] of CONTENT_FIELDS) {
    const field = document.getElementById(id);
    if (!field) continue;
    field.addEventListener("focus", () => {
      fieldSnapshot = app.takeSnapshot();
    });
    field.addEventListener("input", () => {
      scene().content[key] = field.value;
      if (key === "memo") updateMemoCount();
      app.requestRender();
    });
    field.addEventListener("change", () => {
      if (fieldSnapshot) app.commit(fieldSnapshot);
      fieldSnapshot = null;
      app.requestRender();
    });
  }
  el.includeInstall.addEventListener("change", () => {
    edit(() => setIncludeInstall(scene(), el.includeInstall.checked));
  });

  for (const input of [
    el.transformX,
    el.transformY,
    el.transformWidth,
    el.transformHeight,
    el.transformRotation,
  ]) {
    input.addEventListener("focus", () => {
      fieldSnapshot = app.takeSnapshot();
    });
    input.addEventListener("input", () => {
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
    input.addEventListener("change", () => {
      if (fieldSnapshot) app.commit(fieldSnapshot);
      fieldSnapshot = null;
      app.requestRender();
    });
  }

  el.flipButton.addEventListener("click", () => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.locked || !["character", "logo"].includes(layer.kind)) return false;
      layer.flipX = !layer.flipX;
      return true;
    });
  });
  el.lockButton.addEventListener("click", () => {
    edit(() => {
      const layer = selectedLayer(scene());
      if (!layer || layer.kind === "background") return false;
      layer.locked = !layer.locked;
      return true;
    });
  });
  el.duplicateButton.addEventListener("click", () => {
    edit(() => Boolean(duplicateLayer(scene(), scene().selectedLayerId)));
  });
  el.deleteButton.addEventListener("click", () => {
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
    input.addEventListener("change", () => {
      if (input.checked) commitColor(LOGO_PALETTE, input.value, el.logoColorCustom);
    });
  }
  el.logoColorCustom.addEventListener("input", () => {
    const custom = el.logoColorInputs.find((input) => input.value === "custom");
    if (custom) custom.checked = true;
    commitColor(LOGO_PALETTE, "custom", el.logoColorCustom);
  });
  for (const input of el.textColorInputs) {
    input.addEventListener("change", () => {
      if (input.checked) commitColor(TEXT_PALETTE, input.value, el.textColorCustom);
    });
  }
  el.textColorCustom.addEventListener("input", () => {
    const custom = el.textColorInputs.find((input) => input.value === "custom");
    if (custom) custom.checked = true;
    commitColor(TEXT_PALETTE, "custom", el.textColorCustom);
  });

  el.textContent.addEventListener("focus", () => {
    fieldSnapshot = app.takeSnapshot();
  });
  el.textContent.addEventListener("input", () => {
    const layer = selectedLayer(scene());
    if (!layer || layer.kind !== "text") return;
    setLayerProps(scene(), layer.id, { text: el.textContent.value });
    syncTextLayerHeight(layer);
    app.requestRender();
  });
  el.textContent.addEventListener("change", () => {
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
  el.textFont.addEventListener("change", () => {
    const family = el.textFont.value;
    commitTextProps({
      fontFamily: family,
      fontWeight: family === "Zarathustra" ? 400 : Number(el.textWeight.value) || 500,
    });
  });
  el.textSize.addEventListener("change", () => {
    const size = Number(el.textSize.value);
    if (Number.isFinite(size) && size > 0) commitTextProps({ fontSize: size });
  });
  el.textWeight.addEventListener("change", () => {
    commitTextProps({ fontWeight: Number(el.textWeight.value) || 500 });
  });
  for (const input of el.textAlignInputs) {
    input.addEventListener("change", () => {
      if (input.checked) commitTextProps({ align: input.value });
    });
  }

  el.contextMenu.addEventListener("keydown", handleContextMenuKeydown);
  el.contextMenu.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!el.contextMenu.contains(document.activeElement)) closeLayerContextMenu();
    });
  });
  for (const action of el.contextMenuActions) {
    action.addEventListener("click", () => runLayerAction(action.dataset.layerAction));
  }

  el.exportButton.addEventListener("click", () => setExportMenu(el.exportMenu.hidden));
  for (const item of el.exportMenu.querySelectorAll("[data-export-action]")) {
    item.addEventListener("click", () => {
      setExportMenu(false);
      const action = item.dataset.exportAction;
      if (action === "png") downloadPng();
      if (action === "print") printCard();
      if (action === "batch") openBatchDialog();
    });
  }

  el.batchInput.addEventListener("input", syncBatch);
  el.batchRun.addEventListener("click", runBatch);
  el.batchCancel.addEventListener("click", () => el.batchDialog.close());

  el.undo.addEventListener("click", () => app.undo());
  el.redo.addEventListener("click", () => app.redo());

  document.addEventListener("pointerdown", (event) => {
    if (!el.contextMenu.hidden && !el.contextMenu.contains(event.target)) {
      closeLayerContextMenu();
    }
    if (!el.exportMenu.hidden && !event.target.closest?.(".export-wrap")) {
      setExportMenu(false);
    }
  });
  window.addEventListener("resize", () => closeLayerContextMenu());
  window.addEventListener("scroll", () => closeLayerContextMenu(), true);
  window.addEventListener("beforeunload", (event) => {
    if (app.history.size === 0) return;
    event.preventDefault();
    event.returnValue = "";
  });

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
    for (const input of el.qrStyleInputs) input.checked = input.value === current.qrStyle;
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
    const addRecolorable = Boolean(LOGOS[pick.logo]?.recolorable);
    for (const input of el.logoAddColorInputs) input.disabled = !addRecolorable;
    el.logoAddColorCustom.disabled = !addRecolorable;
    document.getElementById("logo-add-color-note")?.toggleAttribute("hidden", addRecolorable);

    for (const [id, key] of CONTENT_FIELDS) {
      const field = document.getElementById(id);
      if (!field || document.activeElement === field) continue;
      const value = current.content[key] ?? "";
      if (field.value !== value) field.value = value;
    }
    el.includeInstall.checked = current.includeInstall;
    updateMemoCount();

    el.contentError.textContent = app.qr.error ?? "";
    el.contentWarning.textContent = app.qr.warnings.join(" ");
    const preview = app.qr.value ?? "";
    el.valuePreview.textContent = current.mode === "giftcard" ? maskGiftLink(preview) : preview;

    el.body.dataset.qrState = app.qrCode ? "ready" : "pending";

    syncSelection();
    syncLayerList();
    el.undo.disabled = !app.history.canUndo;
    el.redo.disabled = !app.history.canRedo;
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
  return { sync, syncTemplates, closeMenus, openLayerMenu, setDrawer };
}
