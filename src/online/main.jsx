import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OnlineStudio from "./OnlineStudio.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OnlineStudio />
  </StrictMode>,
);
