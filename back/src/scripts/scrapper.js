import fs from "fs/promises"
import path from "path"
import { restClient } from '@massive.com/client-js'
import dotenv from 'dotenv'

dotenv.config()
const rest = restClient(process.env.POLY_API_KEY)

// TOP 300 - NASDAQ & MAJOR TECHNOLOGY COMPANIES
const TICKERS = [
  // --- GIANTS AND BIG TECH (Megacaps) ---
  "MSFT", "AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AVGO", "ASML", "AMD",
  "NFLX", "ADBE", "CSCO", "QCOM", "TMUS", "INTU", "AMAT", "ISRG", "TXN", "MU",
  
  // --- SOFTWARE, CLOUD & SAAS ---
  "ORACLE", "CRM", "NOW", "SAP", "INTC", "IBM", "PANW", "SNOW", "SHOP", "TEAM",
  "WDAY", "PLTR", "DDOG", "MDB", "NET", "CRWD", "ZS", "OKTA", "DOCU", "ZM",
  "HUBS", "SPLK", "NOW", "ADSK", "ANSS", "PTC", "CDNS", "SNPS", "DATA", "TWLO",
  "ZEN", "PAYC", "PCTY", "U", "MSTR", "BILL", "PATH", "DT", "DYAT", "APP",

  // --- HARDWARE, SEMICONDUCTORS & INFRASTRUCTURE ---
  "ARM", "DELL", "HPQ", "HPE", "LRCX", "KLAC", "ADI", "NXPI", "MRVL", "MCHP",
  "ON", "MPWR", "SMCI", "STV", "VRT", "WDC", "STX", "ANET", "JNPR", "CIEN",
  "FSLR", "ENPH", "SEDG", "COHR", "IPG", "LITE", "VIAV", "CCCS", "TER", "TOELY",

  // --- FINTECH, E-COMMERCE & SERVICES TECH ---
  "SQ", "PYPL", "MELI", "SE", "CPNG", "PDD", "BABA", "JD", "BIDU", "NTES",
  "UBER", "LYFT", "GRUB", "DASH", "PINS", "SNAP", "TTD", "ROKU", "MTCH", "IAC",
  "EXPE", "BKNG", "TRIP", "ABNB", "CHWY", "ETS", "CVNA", "W", "RVMD", "UPST",

  // --- VIDEO GAMES, ENTERTAINMENT and MEDIA ---
  "SONY", "NTDOY", "EA", "TTWO", "ATVI", "SEGA", "UBSFY", "NCMSF", "CCOEY", "WCG",
  "SPOT", "LYV", "RBLX", "DIS", "PARA", "WBD", "FOXA", "NFLX", "IQ", "HUYA",

  // --- CYBERSECURITY & NETWORK ---
  "FTNT", "CHKP", "QLYS", "TENB", "RAPID", "VRNS", "SAIL", "PING", "FORG", "SCWX",
  "BB", "FFIV", "NET", "AKAM", "FSLY", "LLNW", "ALTR", "LUNA", "EXTR", "NETGEAR",

  // --- BIOTECH, CONNECTED HEALTH & MEDTECH ---
  "AMGN", "REGN", "VRTX", "GILD", "BIIB", "ILMN", "ALGN", "DXCM", "PODD", "TNDM",
  "TDOC", "LVGO", "OMCL", "HQY", "CERE", "SGEN", "MRNA", "BNTX", "NVAX", "AZN",

  // --- CONNECTED CARS, AI & ROBOTICS ---
  "RIVN", "LCID", "NIO", "XPEV", "LI", "FSR", "NKLA", "QS", "INVZ", "LAZR",
  "OUST", "VLDR", "MVIS", "JOBY", "ACHR", "BLDE", "AAV", "BOTZ", "IRBT", "AI",

  // --- TELECOMS, SATELLITE & IOT ---
  "VZ", "T", "S", "CHTR", "CMCSA", "LBRDK", "FYBR", "IRDM", "SATL", "ORBK",
  "GOGO", "VSAT", "LRLCY", "SIMO", "GLW", "COMM", "HLIT", "SATS", "DISH", "ASTS",

  // --- INDUSTRY TECH, AUTOMATION & DRONES ---
  "HON", "GE", "ROK", "AME", "KEYS", "TER", "NATI", "METT", "A", "FTV",
  "AVT", "ARROW", "TDY", "HEI", "BWXT", "EH", "UAVS", "AMRC", "BLDP", "FCEL",

  // --- ADVANCED COMPONENTS AND MATERIALS ----
  "CREE", "WOLF", "IIVI", "ROG", "CABO", "CNSL", "BAND", "SHEN", "LICT", "CNSX",
  "ATNI", "SPOK", "ECOV", "ALGM", "POWI", "PI", "INDI", "NVTS", "CEVA", "PXLW",

  // --- OTHER MAJOR NASDAQ COMPANIES ---
  "COST", "PEP", "CSX", "PDCO", "FAST", "PAYX", "CTAS", "IDXX", "KDP", "EXC",
  "MELI", "MAR", "ORLY", "CTSH", "MNST", "MDLZ", "KLAC", "SNPS", "CDNS", "ASML",
  "AAL", "FAST", "VRSK", "SIRI", "DLTR", "EBAY", "ANSS", "ALGN", "ALXN", "VRSN",

  // --- SECONDARY TECH, DATA & ANALYTICS ---
  "NEWR", "SUMO", "ESTC", "FORR", "GART", "SNDR", "RAMP", "MAXR", "BCOV", "QMCO",
  "TCX", "DPRO", "MVIS", "KE", "SCPL", "MKTX", "SEI", "ENV", "SSNC", "TYL",

  // --- CONSULTING & INTEGRATION SERVICES ---
  "ACN", "INFY", "WIT", "CTSH", "EPAM", "GLOB", "GIB", "CACI", "LDOS", "SAIC",
  "EXLS", "WNS", "TTEC", "CNXC", "TASK", "SCSC", "EPLUS", "PCYO", "HCKT", "BBAI",

  // --- DISTRIBUTORS AND COMPONENTS --
  "TD SYNNEX", "SNX", "IM", "GTT", "EGOV", "PRFT", "DAVA", "GRID", "MTEK", "KVHI",
  "AEY", "KRNT", "ITI", "RELL", "BELFA", "SGA", "IESC", "MTRX", "TAYD", "POWL"
]

// PATH OF SAVE FILE
const OUTPUT_PATH = path.resolve("./src/data/nasdaq.json")

async function runScraper() {
  const results = []
  
  console.log(`==================================================`)
  console.log(`SCRAPER START`)
  console.log(`ASSETS TO SCRAP : ${TICKERS.length}`)
  console.log(`==================================================\n`)

  for (const ticker of TICKERS) {
    try {
      const currentStep = results.length + 1
      console.log(`⭳ [${currentStep}/${TICKERS.length}] Downloading data for ${ticker}...`)

      // SDK Massive (Polygon) API CALLING
      const metaRes = await rest.getTicker({ ticker })
      const aggRes = await rest.getStocksAggregates({ 
        stocksTicker: ticker, 
        multiplier: "1", 
        timespan: "day", 
        from: "2025-06-09", 
        to: "2026-06-09", 
        adjusted: "true", 
        sort: "asc",
        limit: "500", 
      })

      const meta = metaRes.results
      const dataPoints = aggRes.results || []
      const last = dataPoints.at(-1) 
      
      // CANDLES STRUCTURE
      const history = dataPoints.map(point => ({
        o: point.o, 
        h: point.h, 
        l: point.l, 
        c: point.c, 
        x: point.t 
      }))
      
      results.push({ 
        type: "nasdaq",
        ticker: meta.ticker, 
        name: meta.name, 
        image: meta.branding?.logo_url ?? null,
        marketCap: meta.market_cap,
        price: last?.c ?? null, 
        high: last?.h ?? null, 
        low: last?.l ?? null,
        history: history
      })

      console.log(`[OK] ${ticker} saved (${history.length} candles).`)
      
      // Security anti-429
      if (results.length < TICKERS.length) {
        console.log("⋯ [WAIT] 25-second pause...")
        await new Promise(r => setTimeout(r, 25000))
      }

    } catch (error) {
      console.error(`[ERR] Error on ticker ${ticker}:`, error.message)
      console.log(`10-second safety pause...`)
      await new Promise(r => setTimeout(r, 10000))
    }
  }

  // SAVE ON FILE JSON
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8")
    
    console.log(`\n==================================================`)
    console.log(`[OK] SCRAPING SUCCESSFULLY COMPLETED`)
    console.log(` File updated : ${OUTPUT_PATH}`)
    console.log(`==================================================`)
  } catch (err) {
    console.error(`[ERR] Erreur d'écriture du fichier JSON :`, err.message)
  }
}

runScraper()