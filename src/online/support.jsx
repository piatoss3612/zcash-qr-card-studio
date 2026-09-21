import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SupportPage from "./SupportPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SupportPage />
  </StrictMode>,
);
