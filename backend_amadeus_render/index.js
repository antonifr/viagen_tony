const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
let accessToken = null;

// 🔐 Autenticação com Amadeus
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

  setTimeout(() => {
    accessToken = null;
  }, 25 * 60 * 1000);

  return accessToken;
}

// 🔍 Autocomplete de locais
app.get("/api/locais", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query obrigatória" });

  try {
    const token = await getAccessToken();

    const { data } = await axios.get("https://test.api.amadeus.com/v1/reference-data/locations", {
      params: {
        keyword: query,
        subType: "AIRPORT,CITY",
        "page[limit]": 5,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resultados = data.data.map((item) => `${item.iataCode} - ${item.name}`);
    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar locais:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar locais" });
  }
});

// ✈️ Busca de voos
app.post("/api/search-flights", async (req, res) => {
  const { origem, destino, dataIda, dataVolta, passageiros } = req.body;

  if (!origem || !destino || !dataIda || !passageiros) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  const origemCode = origem.split(" - ")[0];
  const destinoCode = destino.split(" - ")[0];

  try {
    const token = await getAccessToken();

    const { data } = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
      params: {
        originLocationCode: origemCode,
        destinationLocationCode: destinoCode,
        departureDate: dataIda,
        returnDate: dataVolta || undefined,
        adults: passageiros,
        max: 5,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(data);
  } catch (err) {
    console.error("Erro ao buscar voos:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar voos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
