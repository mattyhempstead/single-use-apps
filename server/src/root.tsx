import React from "react";
import { createRoot } from "react-dom/client";

export function renderApp(App: React.ComponentType): void {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error("Root element not found");
  }
}
