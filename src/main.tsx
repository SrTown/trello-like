import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { BrowserRouter } from "react-router-dom"
import App from "./app"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
