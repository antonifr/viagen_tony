import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

function App() {
  const [query, setQuery] = useState("");
  const [locais, setLocais] = useState([]);

  const buscarLocais = async () => {
    const res = await fetch(`${API_BASE}/api/locais?query=${query}`);
    const data = await res.json();
    setLocais(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Buscar Locais</h1>
      <input
        type="text"
        value={query}
        placeholder="Digite uma cidade ou aeroporto"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={buscarLocais}>Buscar</button>

      <ul>
        {locais.map((local, index) => (
          <li key={index}>{local}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
