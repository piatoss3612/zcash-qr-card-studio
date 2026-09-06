// Event layouts use ordinary layers so the existing design-file format remains sufficient.
import { CHARACTERS, TEMPLATES, LAYOUTS } from "./catalog.js";
import {
  addLayer,
  createScene,
  makeCharacterLayer,
  roleLayer,
  setPaymentSummary,
  snapshot,
} from "./scene.js";

export const EVENT_TITLES = {
  payment: "Pay with Zcash",
  giftcard: "Your Zcash gift",
  link: "Event guide",
};
export function eventText(scene, id) {
  return scene.layers[id]?.text ?? "";
}
export function setEventText(scene, id, text) {
  let layer = scene.layers[id];
  if (id === "event-name" && !text.trim()) {
    if (layer) {
      delete scene.layers[id];
      scene.order = scene.order.filter((key) => key !== id);
      if (scene.selectedLayerId === id) scene.selectedLayerId = "qr";
    }
    return null;
  }
  if (!layer) {
    const heading = id === "event-heading";
    layer = addLayer(scene, {
      kind: "text",
      text: "",
      label: "",
      fontFamily: heading ? "Zarathustra" : "Geist",
      fontSize: heading ? 76 : 30,
      fontWeight: 500,
      color: "#141818",
      align: "center",
      lineHeight: 1.1,
      x: heading ? 140 : 250,
      y: heading ? 235 : 120,
      width: heading ? 1030 : 930,
      height: heading ? 90 : 40,
      rotation: 0,
      locked: false,
      deletable: true,
    });
    delete scene.layers[layer.id];
    scene.order[scene.order.indexOf(layer.id)] = id;
    layer.id = id;
    scene.layers[id] = layer;
    scene.selectedLayerId = id;
  }
  layer.text = text;
  layer.label = id === "event-heading" ? "Card heading" : "Event name";
  return layer;
}

/** Apply the selected theme's artwork while preserving QR content and user text. */
export function applyEventTheme(scene, templateId) {
  const template = TEMPLATES[templateId];
  if (!template) return false;
  scene.templateId = templateId;
  scene.layers.background.assetId = template.background;
  const cat = template.layers.find((layer) => layer.kind === "character");
  if (cat) replaceEventCharacter(scene, cat.assetId);
  return true;
}

/** A catalog click replaces the selected character, or the primary character. */
export function replaceEventCharacter(scene, assetId) {
  if (!CHARACTERS[assetId]) return false;
  const selected = scene.layers[scene.selectedLayerId];
  const layer =
    selected?.kind === "character"
      ? selected
      : scene.order
          .map((id) => scene.layers[id])
          .find((item) => item.kind === "character");
  if (layer?.locked) return false;
  const made = makeCharacterLayer(assetId, scene);
  if (layer) {
    // Preserve user resizing while applying each character's intended artwork scale.
    const previousScale = CHARACTERS[layer.assetId]?.defaultScale ?? 1;
    const nextScale = CHARACTERS[assetId].defaultScale ?? 1;
    const scaleRatio = nextScale / previousScale;
    const width = layer.width * scaleRatio,
      height = layer.height * scaleRatio;
    Object.assign(layer, {
      assetId,
      label: made.label,
      x: layer.x + (layer.width - width) / 2,
      y: layer.y + layer.height - height,
      width,
      height,
    });
    scene.selectedLayerId = layer.id;
  } else addLayer(scene, made);
  return true;
}

export function createEventScene(mode = "payment") {
  const scene = createScene({
    mode,
    templateId: `${mode}-rampart`,
  });
  scene.layoutId = "event";
  scene.qrStyle = "clean";
  scene.qrDesign = { shape: "square", color: null, emblem: "none" };
  Object.assign(scene.layers.qr, { x: 340, y: 500, width: 630, height: 630 });
  for (const id of scene.order) {
    const layer = scene.layers[id];
    if (layer.kind === "character")
      Object.assign(layer, LAYOUTS.event.character);
    if (layer.kind === "logo")
      Object.assign(layer, {
        x: 140,
        y: 105,
        width: mode === "payment" ? 70 : 180,
        height: mode === "payment" ? 70 : 52,
      });
    if (layer.kind === "install") Object.assign(layer, LAYOUTS.event.install);
  }
  const caption = roleLayer(scene, "caption");
  Object.assign(caption, {
    x: 140,
    y: 425,
    width: 1030,
    height: 45,
    fontFamily: "Geist",
    fontSize: 34,
    fontWeight: 500,
    uppercase: false,
    align: "center",
    text:
      mode === "giftcard"
        ? "2. Scan to claim your gift"
        : mode === "link"
          ? "Scan to open the event guide"
          : "Scan to pay with Zcash",
  });
  setEventText(scene, "event-name", "");
  setEventText(scene, "event-heading", EVENT_TITLES[mode]);
  if (mode === "payment") setPaymentSummary(scene, true);
  scene.selectedLayerId = "qr";
  return scene;
}

/** Give printed gift copies non-secret identifiers, never derived from their links. */
export function numberedCard(scene, index) {
  const copy = snapshot(scene);
  addLayer(copy, {
    kind: "text",
    label: "Card number",
    text: `GIFT ${String(index + 1).padStart(3, "0")}`,
    fontFamily: "Geist",
    fontSize: 24,
    fontWeight: 500,
    color: "#141818",
    align: "left",
    lineHeight: 1.2,
    x: 140,
    y: 1665,
    width: 400,
    height: 30,
    rotation: 0,
    locked: false,
    deletable: true,
  });
  return copy;
}
