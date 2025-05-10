const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
let accessToken = null;

// ✅ Pega o token da Amadeus
async function getAccessToken() {
  if (accessToken) return accessToken;

  const response = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token", null, {
    params: {
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  accessToken = response.data.access_token;

  // Expira em 25 minutos
  setTimeout(() => {
    accessToken = null;
  }, 25 * 60 * 1000);

  return accessToken;
}

// 🔍 Endpoint de autocomplete de locais
app.get("/api/locais", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query obrigatória" });

  try {
    const token = await getAccessToken();

    const { data } = await axios.get("https://test.api.amadeus.com/v1/reference-data/locations", {
      params: {
        keyword: query,
        subType: "AIRPORT,CITY",
        'page[limit]': 5,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resultados = data.data.map((item) => {
      return `${item.iataCode} - ${item.name}`;
    });

    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar locais:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar locais" });
  }
});

// ✈️ Endpoint de busca de voos (já existente)
app.post("/api/search-flights", async (req, res) => {
  // ... sua lógica de busca de voos
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
