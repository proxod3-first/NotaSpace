import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { MainProvider } from "./context/NoteContext";
import { TagProvider } from "./context/TagContext";
import { NotebookProvider } from "./context/NotebookContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MainProvider>
        <TagProvider>
          <NotebookProvider>
            <App />
          </NotebookProvider>
        </TagProvider>
      </MainProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
