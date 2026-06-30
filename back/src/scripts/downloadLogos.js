import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

dotenv.config()

// Configuration of paths (align with back/src/scripts)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to JSON data file in the Back
const jsonPath = path.resolve(__dirname, "../data/nasdaq.json")

// Path to the destination folder in the Front
const outputDir = path.resolve(__dirname, "../../../front/public/assets/logos")

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function downloadLogos() {
    try {
        // Security: check the Front's public folder exists; if not, create it.
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        // Reading the JSON file
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`The JSON file could not be found at the following location: ${jsonPath}`)
        }
        const rawData = fs.readFileSync(jsonPath, "utf-8")
        const assets = JSON.parse(rawData)

        console.log(`[START] Reading the JSON. ${assets.length} assets to analyze...`)

        let downloaded = 0
        let skipped = 0

        for (const asset of assets) {
            // Security in case a line of the JSON doesn't have a ticker
            if (!asset.ticker) continue;

            const filename = `${asset.ticker.toLowerCase()}.svg`
            const filePath = path.join(outputDir, filename)

            // If the image already exists in the front end, ignore it (saves time + avoids API spam)
            if (fs.existsSync(filePath)) {
                skipped++
                continue
            }

            // We check that the asset has a branded image URL
            if (!asset.image) {
                console.log(`[-] No image link for ${asset.ticker}, ignored.`)
                continue
            }

            try {
                console.log(`Download the logo for: ${asset.ticker}...`)

                // We inject your Polygon API key at the end of your existing JSON URL
                 const urlWithKey = `${asset.image}?apiKey=${process.env.POLY_API_KEY}`

                const res = await fetch(urlWithKey)

                if (res.status === 429) {
                    console.warn(" // On[429] API limit reached. 30-second pause... inject your Polygon API key at the end of your existing JSON URL")
                    await sleep(30000)
                    // reduce the index to try this asset again on the next loop iteration
                    continue
                }

                if (!res.ok) {
                    console.warn(` [SKIP] Impossible de récupérer le logo de ${asset.ticker} (HTTP ${res.status})`)
                    await sleep(2000)
                    continue
                }

                // Retrieving and writing the physical file to the Front End
                const arrayBuffer = await res.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                fs.writeFileSync(filePath, buffer)
                console.log(` [OK] Saved in the Front : 
                ${filename}`)
                downloaded++

                // RATE LIMIT RESPECTED (Important: max 5 requests per minute)
                // waiting ~13 seconds before moving to the next ticker
                await sleep(13000)

            } catch (err) {
                console.error(` [ERR] Network error for ${asset.ticker}:`, err.message)
                await sleep(2000)
            }
        }

        console.log(`\n[DONE] Logo upload complete!`)
        console.log(`New files saved in the Front : 
        ${downloaded}`)
        console.log(`Files already present (ignored): ${skipped}`)

    } catch (globalErr) {
        console.error("CRITICAL SCRIPT ERROR:", globalErr.message)
    }
}

downloadLogos()