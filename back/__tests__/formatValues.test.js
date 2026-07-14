import formatValues from "../src/utils/formatValues.js"

describe("formatValues", () => {
  test("returns the value as-is if it is less than 1 million", () => {
    expect(formatValues(500)).toBe("500")
  })

  test("formats in millions (M) for values ​​exceeding 1,000,000", () => {
    expect(formatValues(1_500_000)).toBe("1.50 M")
  })

  test("formatted in billions (B) above 1,000,000,000", () => {
    expect(formatValues(2_500_000_000)).toBe("2.50 B")
  })

  test("rounds to 2 decimal places", () => {
    expect(formatValues(1_234_567)).toBe("1.23 M")
  })
})