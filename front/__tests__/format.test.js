import {
  escapeHtml,
  formatForexName,
  formatMarketCap,
  formatTicker,
  formatChartId,
  formatDate
} from "../src/utils/format.js"

describe("escapeHtml", () => {
  test("escapes HTML tags to prevent XSS injection", () => {
    expect(escapeHtml("<script>alert(1)</script>"))
      .toBe("&lt;script&gt;alert(1)&lt;/script&gt;")
  })

  test("escape the quotation marks and the ampersand", () => {
    expect(escapeHtml('He said "hi" & left'))
      .toBe("He said &quot;hi&quot; &amp; left")
  })

  test("escape the apostrophe", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s")
  })

  test("returns an empty string for null or undefined", () => {
    expect(escapeHtml(null)).toBe("")
    expect(escapeHtml(undefined)).toBe("")
  })
})

describe("formatForexName", () => {
  test("removes the 'C:' prefix and inserts a separator between the two currencies", () => {
    expect(formatForexName("C:EURUSD")).toBe("EUR / USD")
  })

  test("also works without a prefix", () => {
    expect(formatForexName("EURUSD")).toBe("EUR / USD")
  })
})

describe("formatMarketCap", () => {
  test("formatted in compact notation (K, M, B)", () => {
    expect(formatMarketCap(1500000)).toBe("1.5M")
    expect(formatMarketCap(2500000000)).toBe("2.5B")
    expect(formatMarketCap(1234)).toBe("1.23K")
  })

  test("leave the small values ​​as they are", () => {
    expect(formatMarketCap(500)).toBe("500")
  })
})

describe("formatTicker", () => {
  test("replaces any non-alphanumeric character with an underscore", () => {
    expect(formatTicker("BTC-USD")).toBe("BTC_USD")
    expect(formatTicker("C:EUR/USD")).toBe("C_EUR_USD")
  })
})

describe("formatChartId", () => {
  test("prefix the formatted ticker by 'tv-'", () => {
    expect(formatChartId("BTC-USD")).toBe("tv-BTC_USD")
  })
})

describe("formatDate", () => {
  test("formats a date into the specified format 'JJ mois AAAA' (en-GB)", () => {
    expect(formatDate("2026-07-14")).toBe("14 July 2026")
  })

  test("handles the first day of the year correctly", () => {
    expect(formatDate("2026-01-01")).toBe("01 January 2026")
  })
})