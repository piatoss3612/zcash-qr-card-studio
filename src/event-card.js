// Event layouts use ordinary layers so the existing design-file format remains sufficient.
import { CHARACTERS, TEMPLATES, LAYOUTS, LOGOS, eventLayout } from "./catalog.js";
import {
  addLayer,
  createScene,
  makeCharacterLayer,
  roleLayer,
  setPaymentSummary,
  removeLayer,
  snapshot,
} from "./scene.js";

export const EVENT_TITLES = {
  payment: "Pay with Zcash",
  giftcard: "Your Zcash gift",
  link: "Event guide",
};
export const EVENT_CAPTIONS = {
  payment: "Scan to pay with Zcash",
  giftcard: "Scan with Vizor to claim",
  link: "Scan to open the event guide",
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
    const layout = eventLayout(scene.layers.background.assetId);
    layer = addLayer(scene, {
      kind: "text",
      text: "",
      label: "",
      fontFamily: heading ? "Zarathustra" : "Geist",
      fontSize: heading ? 76 : 36,
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
      ...(heading ? layout.heading : layout.eventName),
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
  const previousLayout = eventLayout(scene.layers.background.assetId);
  scene.templateId = templateId;
  scene.layers.background.assetId = template.background;
  const cat = template.layers.find((layer) => layer.kind === "character");
  if (cat) replaceEventCharacter(scene, cat.assetId);
  applyEventPlacement(scene, previousLayout);
  return true;
}

export function syncEventCaption(scene) {
  if (scene.layoutId !== "event") return;
  const layout = eventLayout(scene.layers.background.assetId);
  const caption = roleLayer(scene, "caption");
  if (layout.showDefaultCaption === false) {
    if (caption && Object.values(EVENT_CAPTIONS).includes(caption.text)) removeLayer(scene, caption.id);
  } else if (!caption) {
    addLayer(scene, {kind:"text",role:"caption",text:EVENT_CAPTIONS[scene.mode],label:"Scan instruction",
      fontFamily:"Geist",fontSize:44,fontWeight:500,color:"#141818",lineHeight:1.15,
      height:51,rotation:0,locked:false,deletable:true,...layout.caption});
  }
}

function applyEventPlacement(scene, previousLayout = LAYOUTS.event) {
  if (scene.layoutId !== "event") return;
  const layout = eventLayout(scene.layers.background.assetId);
  syncEventCaption(scene);
  const qr = scene.layers.qr;
  if (qr && !qr.locked) Object.assign(qr, {x:layout.qr.x,y:layout.qr.y,width:layout.qr.size,height:layout.qr.size});
  const character = scene.order.map(id=>scene.layers[id]).find(layer=>layer.kind === "character");
  if (character && !character.locked) {
    character.x += layout.character.x - previousLayout.character.x;
    character.y += layout.character.y - previousLayout.character.y;
  }
  for (const [layer, slot] of [
    [scene.layers["event-heading"], layout.heading],
    [scene.layers["event-name"], layout.eventName],
    [roleLayer(scene, "caption"), { fontSize:44, ...layout.caption }],
    [roleLayer(scene, "summary"), { fontSize:48, fontWeight:700, ...layout.summary }],
  ]) {
    if (layer && !layer.locked) Object.assign(layer, slot);
  }
  const logo = scene.order.map(id => scene.layers[id]).find(layer => layer.kind === "logo");
  if (logo && !logo.locked) {
    const slot = LOGOS[logo.assetId]?.wordmark ? layout.logo : layout.mark;
    const ratio = logo.height / logo.width;
    const width = slot.width ?? slot.size;
    Object.assign(logo, { x:slot.x, y:slot.y, width, height:width*ratio });
  }
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
    fontSize: 44,
    fontWeight: 500,
    uppercase: false,
    align: "center",
    text: EVENT_CAPTIONS[mode],
  });
  setEventText(scene, "event-name", "");
  setEventText(scene, "event-heading", EVENT_TITLES[mode]);
  if (mode === "payment") setPaymentSummary(scene, true);
  applyEventPlacement(scene);
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
