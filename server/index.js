const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

const envPath = path.join(__dirname, "..", ".env.local");
dotenv.config({ path: envPath });

const app = express();

app.use(cors());
app.use(express.json());

const deeplApiKey = process.env.REACT_APP_DEEPL_API_KEY;
const deeplApiUrl =
  process.env.REACT_APP_DEEPL_API_URL || "https://api-free.deepl.com/v2/translate";

app.post("/api/translate", async (req, res) => {
  if (!deeplApiKey) {
    return res.status(500).json({ error: "Missing DeepL API key." });
  }

  const { text, targetLang } = req.body || {};

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or target language." });
  }

  try {
    const params = new URLSearchParams({
      text,
      target_lang: targetLang,
    });

    const response = await fetch(deeplApiUrl, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.message || "DeepL request failed.";
      return res.status(response.status).json({ error: message });
    }

    const payload = await response.json();
    const translation = payload?.translations?.[0]?.text || "";

    return res.json({ translation });
  } catch (error) {
    return res.status(500).json({ error: "Translation unavailable." });
  }
});

const port = process.env.TRANSLATE_PROXY_PORT || 5005;
app.listen(port, () => {
  console.log(`Translation proxy running on http://localhost:${port}`);
});
