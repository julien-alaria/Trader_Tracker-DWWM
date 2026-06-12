import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Configuration des chemins (on s'aligne par rapport à back/src/scripts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Chemin vers ton fichier JSON de données dans le Back
const jsonPath = path.resolve(__dirname, "../data/nasdaq.json");

// 2. Chemin vers le dossier de destination dans le Front
const outputDir = path.resolve(__dirname, "../../../front/public/assets/logos");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadLogos() {
    try {
        // Sécurité : On vérifie que le dossier public du Front existe, sinon on le crée
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Lecture du fichier JSON
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Le fichier JSON est introuvable à l'emplacement : ${jsonPath}`);
        }
        const rawData = fs.readFileSync(jsonPath, "utf-8");
        const assets = JSON.parse(rawData);

        console.log(`[START] Lecture du JSON. ${assets.length} actifs à analyser...`);

        let downloaded = 0;
        let skipped = 0;

        for (const asset of assets) {
            // Sécurité au cas où une ligne du JSON n'aurait pas de ticker
            if (!asset.ticker) continue;

            const filename = `${asset.ticker.toLowerCase()}.svg`;
            const filePath = path.join(outputDir, filename);

            // Si l'image existe déjà dans le Front, on l'ignore (gain de temps + pas de spam API)
            if (fs.existsSync(filePath)) {
                skipped++;
                continue;
            }

            // On vérifie que l'actif possède bien une URL d'image de branding
            if (!asset.image) {
                console.log(`[-] Aucun lien image pour ${asset.ticker}, ignoré.`);
                continue;
            }

            try {
                console.log(`Téléchargement du logo pour : ${asset.ticker}...`);

                // On injecte ta clé API Polygon à la fin de l'URL existante de ton JSON
                const urlWithKey = `${asset.image}?apiKey=REDACTED_API_KEY`;

                const res = await fetch(urlWithKey);

                if (res.status === 429) {
                    console.warn(" [429] Limite de l'API atteinte ! Pause de 30 secondes...");
                    await sleep(30000);
                    // On réduit l'index pour retenter cet actif au prochain tour de boucle
                    continue;
                }

                if (!res.ok) {
                    console.warn(` [SKIP] Impossible de récupérer le logo de ${asset.ticker} (HTTP ${res.status})`);
                    await sleep(2000);
                    continue;
                }

                // Récupération et écriture du fichier physique dans le Front
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                fs.writeFileSync(filePath, buffer);
                console.log(` [OK] Enregistré dans le Front : ${filename}`);
                downloaded++;

                // RESPECT DU RATE LIMIT (Important : max 5 requêtes par minute !)
                // On attend ~13 secondes avant de passer au prochain ticker
                await sleep(13000);

            } catch (err) {
                console.error(` [ERR] Erreur réseau pour ${asset.ticker}:`, err.message);
                await sleep(2000);
            }
        }

        console.log(`\n[DONE] Fin du téléchargement des logos !`);
        console.log(`Nouveaux fichiers sauvegardés dans le Front : ${downloaded}`);
        console.log(`Fichiers déjà présents (ignorés) : ${skipped}`);

    } catch (globalErr) {
        console.error("ERREUR CRITIQUE DU SCRIPT :", globalErr.message);
    }
}

downloadLogos();