import fs from "fs/promises";
import path from "path";
import { restClient } from '@massive.com/client-js'
import dotenv from 'dotenv'
dotenv.config()
const rest = restClient(process.env.POLY_API_KEY)
// 🟢 IMPORTATION DE TON INSTANCE REST (Adapte le chemin vers ta config)
// Exemple : import { rest } from "./src/config/massiveClient.js";

const TICKERS = [
  "MSFT", "NVDA", "AMZN", "INTC", "IBM", "INTU", "NOW", "SNOW", 
  "SHOP", "UBER", "LYFT", "SQ", "DOCU", "ZM", "CRWD", "PANW", 
  "ZS", "OKTA", "PLTR", "NET", "DDOG", "MDB", "TEAM", "ASML", 
  "ARM", "MU", "DELL", "HPQ", "SAP", "SONY", "TXN", "ADI", "LRCX", "KLAC"
];

// Le chemin où sera sauvegardé ton fichier de données pour le front-end
const OUTPUT_PATH = path.resolve("./src/data/nasdaq.json");

async function runScraper() {
  const results = [];
  
  console.log(`==================================================`);
  console.log(`🚀 DÉMARRAGE DU SCRAPER ISOLÉ (scrap.js)`);
  console.log(`📋 Total actifs à récupérer : ${TICKERS.length}`);
  console.log(`==================================================\n`);

  for (const ticker of TICKERS) {
    try {
      const currentStep = results.length + 1;
      console.log(`⏳ [${currentStep}/${TICKERS.length}] Récupération de ${ticker}...`);

      // Tes appels natifs à ton SDK Massive (Polygon)
      const metaRes = await rest.getTicker({ ticker });
      const aggRes = await rest.getStocksAggregates({ 
        stocksTicker: ticker, 
        multiplier: "1", 
        timespan: "day", 
        from: "2026-05-01", // Plage de 30 jours de bourse
        to: "2026-06-09", 
        adjusted: "true", 
        sort: "asc",
        limit: "30", 
      });

      const meta = metaRes.results;
      const dataPoints = aggRes.results || [];
      const last = dataPoints.at(-1); 
      
      // Extraction de la structure OHLC complète pour tes bougies
      const history = dataPoints.map(point => ({
        o: point.o, 
        h: point.h, 
        l: point.l, 
        c: point.c, 
        x: point.t 
      }));
      
      results.push({ 
        type: "nasdaq",
        ticker: meta.ticker, 
        name: meta.name, 
        marketCap: meta.market_cap,
        price: last?.c ?? null, 
        high: last?.h ?? null, 
        low: last?.l ?? null,
        history: history
      });

      console.log(`✅ ${ticker} enregistré (${history.length} bougies).`);
      
      // Sécurité anti-429 (Pas de pause après le dernier élément)
      if (results.length < TICKERS.length) {
        console.log(`⏱️  Pause réglementaire de 25 secondes...`);
        await new Promise(r => setTimeout(r, 25000));
      }

    } catch (error) {
      console.error(`❌ Erreur sur le ticker ${ticker}:`, error.message);
      console.log(`⏳ Pause de sécurité de 10 secondes...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  // Sauvegarde finale dans ton fichier JSON
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
    
    console.log(`\n==================================================`);
    console.log(`🎉 SCRAPING TERMINÉ AVEC SUCCÈS !`);
    console.log(`💾 Fichier mis à jour : ${OUTPUT_PATH}`);
    console.log(`==================================================`);
  } catch (err) {
    console.error(`❌ Erreur d'écriture du fichier JSON :`, err.message);
  }
}

runScraper();