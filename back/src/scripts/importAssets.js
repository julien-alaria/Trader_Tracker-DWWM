import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import getConnection from "../db/connection.js"

const db = getConnection()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// mapping FIXE
const typeMap = {
  forex: 1,
  nasdaq: 2,
  comex: 3
}

const files = [
  { type: "forex", file: "forex.json" },
  { type: "nasdaq", file: "nasdaq.json" },
  { type: "comex", file: "commodities.json" }
]

function loadFile(file) {
  const fullPath = path.join(__dirname, "../data", file)
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"))
}

async function importFile(type, file) {

  const data = loadFile(file)
  const typeId = typeMap[type]

  if (!typeId) {
    console.warn(`Unknown type: ${type}`)
    return
  }

  for (const item of data) {

    const ticker = item.ticker ?? item.symbol
    const name = item.name ?? item.label

    if (!ticker || !name) {
      console.warn("skipped invalid item:", item)
      continue
    }

    await db.execute(
      `
      INSERT INTO assets (ticker, name, asset_type_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        asset_type_id = VALUES(asset_type_id)
      `,
      [ticker, name, typeId]
    )
  }

  console.log(`[OK] Imported ${type}`)
}

async function run() {

  try {
    for (const f of files) {
      await importFile(f.type, f.file)
    }

    console.log("IMPORT DONE (FIXED TYPES ARCHITECTURE)")

  } catch (err) {
    console.error("[ERR] ERROR:", err.message)
  }
}

run()