import * as React from "react";
import { createRoot } from "react-dom/client";
import { ExtensionPopup } from "./components/extension-popup";
// styles.css is loaded directly via <link> in popup.html.

function mount() {
  const root = document.getElementById("root");
  if (!root) return;
  createRoot(root).render(
    <React.StrictMode>
      <ExtensionPopup />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}

export { ExtensionPopup };
