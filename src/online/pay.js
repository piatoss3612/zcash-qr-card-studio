import "./pay.css";
import { parseCard } from "./card-data.js";
import { INVALID_LINK, launchMarkup, launchQuery } from "./launch-page.js";

const main = document.querySelector("main");
try {
  main.innerHTML = launchMarkup(await parseCard(launchQuery(location)));
  // Show the fallback first, then attempt the wallet once.
  const launch = () => {
    try {
      location.assign(document.getElementById("wallet").href);
    } catch {}
  };
  if (document.readyState === "complete") launch();
  else addEventListener("load", launch, { once: true });
} catch {
  main.innerHTML = `<h1>Open your Zcash wallet</h1><p>${INVALID_LINK}</p>`;
}
