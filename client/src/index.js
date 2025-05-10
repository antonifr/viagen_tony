import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Cria e renderiza o componente principal da aplicação (App) dentro do elemento HTML com o id "root"
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
