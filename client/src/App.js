import React, { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ origem: "", destino: "", dataIda: "", dataVolta: "", passageiros: 1 });
  const [voos, setVoos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buscarVoos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setVoos(data.data || []);
    } catch (err) {
      alert("Erro ao buscar voos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Buscar Voos</h1>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 300, gap: 10 }}>
        <input name="origem" placeholder="Origem (ex: GRU)" onChange={handleChange} />
        <input name="destino" placeholder="Destino (ex: MIA)" onChange={handleChange} />
        <input name="dataIda" type="date" onChange={handleChange} />
        <input name="dataVolta" type="date" onChange={handleChange} />
        <input name="passageiros" type="number" min="1" value={form.passageiros} onChange={handleChange} />
        <button onClick={buscarVoos} disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
      </div>
      <h2>Resultados:</h2>
      <ul>
        {voos.map((v, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            {v.itineraries[0].segments[0].departure.iataCode} → {v.itineraries[0].segments.slice(-1)[0].arrival.iataCode}<br />
            Preço: R$ {v.price.total}
          </li>
        ))}
      </ul>
    </div>
  );
}
