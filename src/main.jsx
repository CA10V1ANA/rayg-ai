import React from "react";
import { createRoot } from "react-dom/client";
import App from "./Aquila.jsx";
import "./aquila.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
