import { buildWatchlistData } from "../src/utils/assetFormatter.js"

describe("buildWatchlistData", () => {
  test("merges each watchlist entry with the corresponding asset", () => {
    const result = buildWatchlistData(
      [{ ticker: "AAPL" }, { ticker: "TSLA" }],
      [{ ticker: "AAPL", name: "Apple" }, { ticker: "TSLA", name: "Tesla" }]
    )

    expect(result).toEqual([
      { ticker: "AAPL", name: "Apple", isFollowed: true },
      { ticker: "TSLA", name: "Tesla", isFollowed: true }
    ])
  })

  test("Keep the entry even if no asset matches the ticker.", () => {
    const result = buildWatchlistData(
      [{ ticker: "UNKNOWN" }],
      [{ ticker: "AAPL", name: "Apple" }]
    )

    expect(result).toEqual([{ ticker: "UNKNOWN", isFollowed: true }])
  })

  test("returns an empty array if rawWatchlist is null", () => {
    expect(buildWatchlistData(null, [{ ticker: "AAPL" }])).toEqual([])
  })

  test("returns an empty array if rawWatchlist is null", () => {
    expect(buildWatchlistData([{ ticker: "AAPL" }], null)).toEqual([])
  })

  test("returns an empty array if the watchlist is empty", () => {
    expect(buildWatchlistData([], [])).toEqual([])
  })
})