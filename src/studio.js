// React owns the workflow shell. This module keeps the canvas editor and its
// export services connected to the React-declared controls.
import { eventText, setEventText, numberedCard } from "./event-card.js";
import { preflight, summarize } from "./preflight.js";
import { maskGiftLink } from "./qr-content.js";
import { SHEET, sheetSlots, drawSheetCard } from "./print-sheet.js";
import { renderScene, makeQr } from "./render.js";
import { OUTPUT } from "./catalog.js";
import { snapshot } from "./scene.js";

function createDialog(id, content) {
  const existing = document.getElementById(id);
  if (existing) return existing;
  const dialog = document.createElement("dialog");
  dialog.id = id;
  dialog.innerHTML = content;
  document.body.append(dialog);
  return dialog;
}

/** Bind the React-declared workflow controls to the existing editor engine. */
export function createStudio(app, panels) {
  const body = document.body;
  const workbench = document.querySelector(".workbench");
  const sidebar = document.querySelector(".studio-sidebar");
  const tools = document.querySelector("#studio-design .tool-rail");
  const free = document.getElementById("free-editing");
  const liveCheck = document.getElementById("live-print-check");
  const mobilePreview = document.getElementById("mobile-preview");
  const hadPresentation = Boolean(document.getElementById("presentation"));
  const presentation = createDialog(
    "presentation",
    '<form method="dialog"><button class="button button--secondary">Close display</button></form><img alt="Card for display">',
  );
  const hadPrintPreview = Boolean(document.getElementById("sheet-preview"));
  const printPreview = createDialog(
    "sheet-preview",
    '<header><h2>A4 print preview</h2><p>In the print dialog, choose A4 landscape, 100% scale, and turn off headers and footers. Each card is A6.</p></header><div id="sheet-pages"></div><footer><button type="button" id="sheet-cancel" class="button button--secondary">Close</button><button type="button" id="sheet-print" class="button button--primary">Print / save PDF</button></footer>',
  );
  const hadPrintStyle = Boolean(document.getElementById("sheet-print-style"));
  const printStyle = document.getElementById("sheet-print-style") ?? document.createElement("style");
  printStyle.id = "sheet-print-style";
  if (!printStyle.parentNode) document.body.append(printStyle);
  let printingSheet = false;

  const onAfterPrint = () => {
    printingSheet = false;
    body.classList.remove("printing-sheets");
    body.classList.remove("printing-card");
    printStyle.textContent = "";
  };
  window.addEventListener("afterprint", onAfterPrint);

  document.getElementById("sheet-cancel").onclick = () => printPreview.close();
  const onPrintPreviewClose = () => {
    if (!printingSheet) document.getElementById("sheet-pages").replaceChildren();
  };
  printPreview.addEventListener("close", onPrintPreviewClose);
  document.getElementById("sheet-print").onclick = () => {
    printingSheet = true;
    body.classList.add("printing-sheets");
    printStyle.textContent =
      "@media print {@page {size:A4 landscape;margin:0} html,body{width:297mm!important;height:auto!important} body > *:not(#sheet-preview){display:none!important} body > #sheet-preview{display:block!important;position:static!important;max-width:none!important;max-height:none!important;width:297mm!important;padding:0!important;border:0!important;overflow:visible!important} #sheet-preview::backdrop,#sheet-preview>header,#sheet-preview>footer{display:none!important} #sheet-pages{display:block!important;padding:0!important} #sheet-pages img{display:block!important;width:297mm!important;height:210mm!important;max-width:none!important;margin:0!important;break-after:page} #sheet-pages img:last-child{break-after:auto}}";
    window.print();
  };

  function showStep(step) {
    body.dataset.step = step;
    app.freeEditing = Boolean(free?.checked && step === "design");
    body.classList.toggle("free-editing", Boolean(free?.checked));
    panels.setDrawer(true);
    app.requestRender();
    if (workbench) workbench.scrollTop = 0;
    if (sidebar) sidebar.scrollTop = 0;
    app.onStepChange?.({ content: 0, design: 1, review: 2 }[step] ?? 0);
  }
  app.showStep = showStep;

  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.onclick = () => showStep(button.dataset.nextStep);
  });
  mobilePreview.onclick = () => {
    const open = body.dataset.preview !== "open";
    body.dataset.preview = open ? "open" : "closed";
    mobilePreview.setAttribute("aria-expanded", String(open));
    mobilePreview.textContent = open ? "Hide preview" : "Show preview";
    app.requestRender();
  };
  free.onchange = () => {
    app.freeEditing = free.checked && body.dataset.step === "design";
    body.classList.toggle("free-editing", free.checked);
    if (!free.checked) tools.querySelector('[data-panel="templates"]')?.click();
    app.requestRender();
  };
  document.getElementById("review-edit").onclick = () => showStep("content");
  document.getElementById("print-a4").onclick = async () => {
    try {
      await app.prepareSheets([{ index: 0, value: app.qr.value, code: app.qrCode }]);
    } catch (error) {
      app.setStatus(`Print preparation failed: ${error.message}`, "error");
    }
  };
  document.getElementById("print-png").onclick = () => panels.downloadPng();
  document.getElementById("print-a6").onclick = () => panels.printCard();
  document.getElementById("present-card").onclick = () => {
    presentation.querySelector("img").src = document.getElementById("card-canvas").toDataURL("image/png");
    presentation.showModal();
  };
  document.getElementById("batch-sheet").onclick = () => panels.openBatchDialog("sheet");
  document.getElementById("batch-zip").onclick = () => panels.openBatchDialog("zip");
  showStep("content");

  for (const id of ["event-name", "event-heading"]) {
    const input = document.getElementById(id);
    let before;
    input.onfocus = () => (before = app.takeSnapshot());
    input.oninput = () => {
      setEventText(app.scene, id, input.value);
      app.requestRender();
    };
    input.onchange = () => {
      if (before) app.commit(before);
      before = null;
      app.requestRender();
    };
  }

  app.prepareSheets = async (items, onProgress) => {
    const original = snapshot(app.scene);
    const target = document.getElementById("sheet-pages");
    target.replaceChildren();
    const source = document.createElement("canvas");
    source.width = OUTPUT.width;
    source.height = OUTPUT.height;
    for (const slots of sheetSlots(items.length)) {
      const canvas = document.createElement("canvas");
      canvas.width = SHEET.width;
      canvas.height = SHEET.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const slot of slots) {
        const item = items[slot.index];
        const scene = original.mode === "giftcard" ? numberedCard(original, item.index) : original;
        renderScene(source.getContext("2d"), scene, {
          assets: app.assets,
          qrCode: item.code ?? makeQr(item.value, original.qrDesign.emblem === "none" ? "M" : "H"),
          installCode: app.installCode,
        });
        drawSheetCard(ctx, source, slot);
      }
      const img = document.createElement("img");
      img.alt = `Print sheet ${target.children.length + 1}`;
      img.src = canvas.toDataURL("image/png");
      await img.decode();
      target.append(img);
      onProgress?.(slots[slots.length - 1].index + 1, items.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    printPreview.showModal();
  };

  function sync() {
    for (const id of ["event-name", "event-heading"]) {
      const input = document.getElementById(id);
      if (document.activeElement !== input) input.value = eventText(app.scene, id);
    }
    const checks = preflight(app.scene, { qr: app.qr, qrCode: app.qrCode });
    const summary = summarize(checks);
    liveCheck.textContent = app.qrCode ? `Print checks: ${summary.text}` : "Add QR content to check your card";
    liveCheck.dataset.level = app.qrCode ? summary.level : "pending";
    document.getElementById("review-event").textContent = eventText(app.scene, "event-name") || "Not set";
    document.getElementById("review-heading").textContent = eventText(app.scene, "event-heading") || "Not set";
    document.getElementById("review-destination").textContent = app.scene.mode === "giftcard" ? maskGiftLink(app.qr.value || "") : app.qr.value || app.qr.error || "Add QR content";
    document.getElementById("review-check-summary").textContent = summary.level === "pass" ? "Layout checks passed" : summary.text;
    const list = document.getElementById("review-checks");
    list.replaceChildren();
    for (const check of checks) {
      const li = document.createElement("li");
      li.dataset.level = check.level;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${check.level === "pass" ? "✓" : "!"} ${check.title}`;
      button.disabled = check.level === "pass";
      button.onclick = () => {
        if (check.id === "content") return showStep("content");
        free.checked = true;
        body.classList.add("free-editing");
        app.scene.selectedLayerId = check.layerId ?? "qr";
        showStep("design");
      };
      li.append(button);
      if (check.level !== "pass") {
        const detail = document.createElement("p");
        detail.textContent = check.detail;
        li.append(detail);
      }
      list.append(li);
    }
    for (const id of ["print-a4", "print-png", "print-a6", "present-card"]) document.getElementById(id).disabled = !app.canExport();
    for (const id of ["batch-sheet", "batch-zip"]) document.getElementById(id).disabled = !app.assetsLoaded;
  }

  return {
    sync,
    destroy() {
      window.removeEventListener("afterprint", onAfterPrint);
      printPreview.removeEventListener("close", onPrintPreviewClose);
      printPreview.close();
      document.getElementById("sheet-cancel").onclick = null;
      document.getElementById("sheet-print").onclick = null;
      document.querySelectorAll("[data-next-step]").forEach((button) => (button.onclick = null));
      mobilePreview.onclick = null;
      free.onchange = null;
      if (!hadPresentation) presentation.remove();
      if (!hadPrintPreview) printPreview.remove();
      if (!hadPrintStyle) printStyle.remove();
    },
  };
}
