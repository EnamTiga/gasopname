import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/error-boundary";

const rootEl = document.getElementById("root")!;
const holder = rootEl as unknown as { __gasopnameRoot?: ReturnType<typeof createRoot> };
const root = holder.__gasopnameRoot ?? createRoot(rootEl);
holder.__gasopnameRoot = root;
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
