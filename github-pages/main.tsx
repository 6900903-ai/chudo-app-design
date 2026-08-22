import { createRoot } from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("CHUDO root element was not found.");
}

createRoot(container).render(<Home />);
