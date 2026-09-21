const assets = new Map();

export function loadCardAsset(path) {
  if (!assets.has(path)) {
    const promise = fetch(new URL(path, document.baseURI))
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Could not load the card artwork. Please reload.");
        return new Promise((resolve, reject) => {
          response.blob().then((blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () =>
              reject(new Error("Could not read card artwork."));
            reader.readAsDataURL(blob);
          }, reject);
        });
      })
      .catch((error) => {
        assets.delete(path);
        throw error;
      });
    assets.set(path, promise);
  }
  return assets.get(path);
}

export function svgUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function downloadPng(svg, filename) {
  const image = new Image();
  image.src = svgUrl(svg);
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth * 2;
  canvas.height = image.naturalHeight * 2;
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("PNG export failed. Please try again.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function serviceBase() {
  const configured = import.meta.env.VITE_CARD_SERVICE_URL;
  const base = new URL(configured || "./", document.baseURI);
  if (!["http:", "https:"].includes(base.protocol))
    throw new Error("Invalid card service URL.");
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  return base.href;
}
