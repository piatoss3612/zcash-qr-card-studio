// Task-oriented shell around the existing canvas, content fields and asset tools.
import { eventText, setEventText } from "./event-card.js";
import { preflight, summarize } from "./preflight.js";
import { maskGiftLink } from "./qr-content.js";
import { SHEET, sheetSlots, drawSheetCard } from "./print-sheet.js";
import { renderScene, makeQr } from "./render.js";
import { OUTPUT } from "./catalog.js";
import { snapshot } from "./scene.js";
import { numberedCard } from "./event-card.js";

export function createStudio(app, panels) {
  const body = document.body,
    workbench = document.querySelector(".workbench");
  const nav = document.createElement("nav");
  nav.className = "studio-nav";
  nav.setAttribute("aria-label", "Card creation");
  nav.innerHTML =
    '<button type="button" data-step="content">Content</button><button type="button" data-step="design">Design</button><button type="button" data-step="review">Review & print</button>';
  workbench.before(nav);
  const sidebar = document.createElement("div");
  sidebar.className = "studio-sidebar";
  const content = document.getElementById("content-panel");
  content.querySelector(".prop-head").innerHTML =
    "<h1>Create an event card</h1><p>Choose a purpose and enter the card details.</p>";
  const fields = document.createElement("div");
  fields.className = "event-fields";
  fields.innerHTML =
    '<label class="field"><span class="field-label">Event name <em>Optional</em></span><input type="text" id="event-name" maxlength="40" placeholder="Your event name" autocomplete="off"></label><label class="field"><span class="field-label">Card heading</span><input type="text" id="event-heading" maxlength="32" autocomplete="off"></label>';
  content.querySelector(".mode-picker__hint").after(fields);
  const payment = content.querySelector('[data-mode-fields="payment"]');
  const extra = document.createElement("details");
  extra.className = "studio-details";
  extra.innerHTML = "<summary>Additional details · optional</summary>";
  for (const id of ["field-label", "field-memo", "field-message"])
    extra.append(document.getElementById(id).closest("label"));
  payment.append(extra);
  document
    .getElementById("field-amount")
    .closest("label")
    .querySelector(".field-label").textContent = "Amount (ZEC) · optional";
  const encoded = content.querySelector(".value-preview");
  const encodedDetails = document.createElement("details");
  encodedDetails.className = "studio-details";
  encodedDetails.innerHTML = "<summary>Encoded QR value</summary>";
  encodedDetails.append(encoded);
  content.append(encodedDetails);
  const giftHelp = document.createElement("details");
  giftHelp.className = "studio-details";
  giftHelp.innerHTML =
    "<summary>Where do I get a gift link?</summary><p>Create a gift in Vizor, copy the gift link, and paste it here. Each unique link belongs on one card.</p>";
  content.querySelector('[data-mode-fields="giftcard"]').append(giftHelp);
  const next = document.createElement("button");
  next.type = "button";
  next.className = "button button--primary studio-next";
  next.textContent = "Choose theme →";
  next.onclick = () => showStep("design");
  content.append(next);
  sidebar.append(content);

  const design = document.createElement("section");
  design.id = "studio-design";
  design.innerHTML =
    '<header class="studio-section-head"><h1>Theme, character & logo</h1><p>Changes here keep your card details.</p></header>';
  const tools = document.querySelector(".tool-rail"),
    drawer = document.getElementById("tool-drawer"),
    properties = document.querySelector(".properties");
  const advanced = document.createElement("label");
  advanced.className = "studio-advanced";
  advanced.innerHTML =
    '<input type="checkbox" role="switch" id="free-editing" class="sr-only" aria-labelledby="free-editing-title" aria-describedby="free-editing-help"><span class="studio-advanced__copy"><strong id="free-editing-title">Free positioning & layers</strong><span id="free-editing-help">Move, resize and arrange elements on your card.</span></span><span class="studio-advanced__switch" aria-hidden="true"></span>';
  design.append(advanced, tools, drawer, properties);
  const designNext = document.createElement("button");
  designNext.type = "button";
  designNext.className = "button button--primary studio-next";
  designNext.textContent = "Review & print →";
  designNext.onclick = () => showStep("review");
  design.append(designNext);
  sidebar.append(design);
  workbench.prepend(sidebar);

  const workspace = document.querySelector(".workspace");
  const previewHead = document.createElement("header");
  previewHead.className = "studio-preview-head";
  previewHead.innerHTML =
    '<span>Card preview <small>A6 · 105 × 148 mm</small></span><button type="button" id="mobile-preview" aria-expanded="false">Show preview</button>';
  workspace.prepend(previewHead);
  const liveCheck = document.createElement("button");
  liveCheck.type = "button";
  liveCheck.id = "live-print-check";
  liveCheck.onclick = () => showStep("review");
  workspace.append(liveCheck);
  const mobilePreview = document.getElementById("mobile-preview");
  mobilePreview.onclick = () => {
    const open = body.dataset.preview !== "open";
    body.dataset.preview = open ? "open" : "closed";
    mobilePreview.setAttribute("aria-expanded", String(open));
    mobilePreview.textContent = open ? "Hide preview" : "Show preview";
    app.requestRender();
  };

  const review = document.createElement("section");
  review.id = "studio-review";
  review.innerHTML = `<header class="studio-section-head"><h1>Review & print</h1><p>Check the destination, then test one printed copy.</p></header>
    <section class="review-section"><h2>Card details</h2><dl class="review-facts"><div><dt>Event</dt><dd id="review-event"></dd></div><div><dt>Heading</dt><dd id="review-heading"></dd></div><div class="review-destination"><dt>QR destination</dt><dd id="review-destination"></dd></div></dl><button type="button" id="review-edit" class="ghost-button">Edit details</button></section>
    <section class="review-section"><h2 id="review-check-summary">Print checks</h2><ul id="review-checks"></ul><p class="scan-reminder">Print a sample and scan it with the intended wallet before printing the full batch. Layout checks do not verify the receiving wallet or gift balance.</p></section>
    <section class="review-section"><h2>How will you use it?</h2><div class="output-options"><button type="button" id="print-a4"><strong>Office printer</strong><small>A6 card on A4, with cut marks</small></button><button type="button" id="print-png"><strong>Print shop</strong><small>300 ppi PNG with 3 mm bleed</small></button><button type="button" id="print-a6"><strong>A6 / PDF</strong><small>Actual size, without bleed</small></button><button type="button" id="present-card"><strong>Display on screen</strong><small>Card only, without editing tools</small></button></div></section>
    <section class="review-section"><h2>Multiple cards</h2><p>One QR value per line. Gift links are checked for duplicates.</p><div class="batch-actions"><button type="button" id="batch-sheet" class="button button--secondary">Print A4 sheets</button><button type="button" id="batch-zip" class="button button--secondary">Download PNGs / ZIP</button></div></section>`;
  workbench.append(review);
  const presentation = document.createElement("dialog");
  presentation.id = "presentation";
  presentation.innerHTML =
    '<form method="dialog"><button class="button button--secondary">Close display</button></form><img alt="Card for display">';
  body.append(presentation);
  const printPreview = document.createElement("dialog");
  printPreview.id = "sheet-preview";
  printPreview.innerHTML =
    '<header><h2>A4 print preview</h2><p>In the print dialog, choose A4 landscape, 100% scale, and turn off headers and footers. Each card is A6.</p></header><div id="sheet-pages"></div><footer><button type="button" id="sheet-cancel" class="button button--secondary">Close</button><button type="button" id="sheet-print" class="button button--primary">Print / save PDF</button></footer>';
  body.append(printPreview);
  const printStyle = document.createElement("style");
  printStyle.id = "sheet-print-style";
  body.append(printStyle);
  let printingSheet = false;
  document.getElementById("sheet-cancel").onclick = () => printPreview.close();
  printPreview.addEventListener("close", () => {
    if (!printingSheet)
      document.getElementById("sheet-pages").replaceChildren();
  });
  document.getElementById("sheet-print").onclick = () => {
    printingSheet = true;
    body.classList.add("printing-sheets");
    printStyle.textContent =
      "@media print {@page {size:A4 landscape;margin:0} html,body{width:297mm!important;height:auto!important} body > *:not(#sheet-preview){display:none!important} body > #sheet-preview{display:block!important;position:static!important;max-width:none!important;max-height:none!important;width:297mm!important;padding:0!important;border:0!important;overflow:visible!important} #sheet-preview::backdrop,#sheet-preview>header,#sheet-preview>footer{display:none!important} #sheet-pages{display:block!important;padding:0!important} #sheet-pages img{display:block!important;width:297mm!important;height:210mm!important;max-width:none!important;margin:0!important;break-after:page} #sheet-pages img:last-child{break-after:auto}}";
    window.print();
  };
  window.addEventListener("afterprint", () => {
    printingSheet = false;
    body.classList.remove("printing-sheets");
    printStyle.textContent = "";
  });
  app.prepareSheets = async (items) => {
    const original = snapshot(app.scene);
    const target = document.getElementById("sheet-pages");
    target.replaceChildren();
    const source = document.createElement("canvas");
    source.width = OUTPUT.width;
    source.height = OUTPUT.height;
    const pages = sheetSlots(items.length);
    for (const slots of pages) {
      const canvas = document.createElement("canvas");
      canvas.width = SHEET.width;
      canvas.height = SHEET.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const slot of slots) {
        const item = items[slot.index],
          scene =
            original.mode === "giftcard"
              ? numberedCard(original, item.index)
              : original;
        renderScene(source.getContext("2d"), scene, {
          assets: app.assets,
          qrCode:
            item.code ??
            makeQr(item.value, original.qrDesign.emblem === "none" ? "M" : "H"),
          installCode: app.installCode,
        });
        drawSheetCard(ctx, source, slot);
      }
      const img = document.createElement("img");
      img.alt = `Print sheet ${target.children.length + 1}`;
      img.src = canvas.toDataURL("image/png");
      await img.decode();
      target.append(img);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    printPreview.showModal();
  };
  document.getElementById("print-a4").onclick = async () => {
    try {
      await app.prepareSheets([
        { index: 0, value: app.qr.value, code: app.qrCode },
      ]);
    } catch (error) {
      app.setStatus(`Print preparation failed: ${error.message}`, "error");
    }
  };
  document.getElementById("print-png").onclick = () => panels.downloadPng();
  document.getElementById("print-a6").onclick = () => panels.printCard();
  document.getElementById("present-card").onclick = () => {
    presentation.querySelector("img").src = document
      .getElementById("card-canvas")
      .toDataURL("image/png");
    presentation.showModal();
  };
  document.getElementById("batch-sheet").onclick = () =>
    panels.openBatchDialog("sheet");
  document.getElementById("batch-zip").onclick = () =>
    panels.openBatchDialog("zip");
  document.getElementById("review-edit").onclick = () => showStep("content");
  const free = document.getElementById("free-editing");
  const exportButton = document.getElementById("export-button");
  for (const attribute of ["aria-haspopup", "aria-expanded", "aria-controls"])
    exportButton.removeAttribute(attribute);
  free.onchange = () => {
    app.freeEditing = free.checked && body.dataset.step === "design";
    body.classList.toggle("free-editing", free.checked);
    if (!free.checked) tools.querySelector('[data-panel="templates"]').click();
    app.requestRender();
  };
  function showStep(step) {
    body.dataset.step = step;
    app.freeEditing = free.checked && step === "design";
    nav.querySelectorAll("button").forEach((button) => {
      if (button.dataset.step === step)
        button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    panels.setDrawer(true);
    app.requestRender();
    workbench.scrollTop = 0;
    sidebar.scrollTop = 0;
  }
  nav
    .querySelectorAll("button")
    .forEach(
      (button) => (button.onclick = () => showStep(button.dataset.step)),
    );
  app.showStep = showStep;
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
  function sync() {
    for (const id of ["event-name", "event-heading"]) {
      const input = document.getElementById(id);
      if (document.activeElement !== input)
        input.value = eventText(app.scene, id);
    }
    const checks = preflight(app.scene, { qr: app.qr, qrCode: app.qrCode });
    const summary = summarize(checks);
    liveCheck.textContent = app.qrCode
      ? `Print checks: ${summary.text}`
      : "Add QR content to check your card";
    liveCheck.dataset.level = app.qrCode ? summary.level : "pending";
    document.getElementById("review-event").textContent =
      eventText(app.scene, "event-name") || "Not set";
    document.getElementById("review-heading").textContent =
      eventText(app.scene, "event-heading") || "Not set";
    document.getElementById("review-destination").textContent =
      app.scene.mode === "giftcard"
        ? maskGiftLink(app.qr.value || "")
        : app.qr.value || app.qr.error || "Add QR content";
    document.getElementById("review-check-summary").textContent =
      summary.level === "pass" ? "Layout checks passed" : summary.text;
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
        if (check.id === "content") {
          showStep("content");
          return;
        }
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
    for (const id of ["print-a4", "print-png", "print-a6", "present-card"])
      document.getElementById(id).disabled = !app.canExport();
    for (const id of ["batch-sheet", "batch-zip"])
      document.getElementById(id).disabled = !app.assetsLoaded;
  }
  return { sync };
}
