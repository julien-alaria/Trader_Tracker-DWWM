import {
  sanitizeUser,
  sanitizeUserUpdate,
  sanitizeLogin,
  sanitizeRecommendation,
  sanitizeRecommendationUpdate
} from "../src/utils/sanitizer.js"
import AppError from "../src/utils/AppError.js"

describe("sanitizeUser", () => {
  test("cleans and normalizes a valid dataset", () => {
    const result = sanitizeUser({
      name: "  Jean  ",
      email: "Jean@Test.com",
      password: "Abcdef1!",
      role: "analyst",
      analyst_type_id: 2,
      company: "ACME",
      bio: "hi"
    })

    expect(result).toEqual({
      name: "Jean",
      email: "jean@test.com",
      password: "Abcdef1!",
      role: "analyst",
      analyst_type_id: 2,
      company: "ACME",
      bio: "hi"
    })
  })

  test("blocks 'admin' self-promotion during public registration", () => {
    const result = sanitizeUser({
      name: "Jean",
      email: "jean@test.com",
      password: "Abcdef1!",
      role: "admin"
    })

    expect(result.role).toBe("user")
  })

  test("rejects the data if a mandatory field is missing", () => {
    expect(() => sanitizeUser({ name: "Jean" })).toThrow(AppError)
    expect(() => sanitizeUser({ name: "Jean" })).toThrow("Missing required fields")
  })
})

describe("sanitizeUserUpdate", () => {
  test("only returns the fields actually provided", () => {
    expect(sanitizeUserUpdate({ name: "Jean" })).toEqual({ name: "Jean" })
  })

  test("validates analyst_type_id against the role updated in the same call", () => {
    const result = sanitizeUserUpdate({ role: "analyst", analyst_type_id: 4 })
    expect(result).toEqual({ role: "analyst", analyst_type_id: 4 })
  })
})

describe("sanitizeLogin", () => {
  test("normalizes the email and keeps the password as is", () => {
    expect(sanitizeLogin({ email: "Test@Test.com", password: "x" }))
      .toEqual({ email: "test@test.com", password: "x" })
  })

  test("rejects missing identifiers", () => {
    expect(() => sanitizeLogin({ email: "" })).toThrow("Missing credentials")
  })
})

describe("sanitizeRecommendation", () => {
  test("cleans a valid recommendation and converts asset_id to a number", () => {
    const result = sanitizeRecommendation({ status: "BUY", comment: "top", asset_id: "12" })
    expect(result).toEqual({ status: "BUY", comment: "top", asset_id: 12 })
  })

  test("rejects an invalid asset_id", () => {
    expect(() => sanitizeRecommendation({ status: "BUY", asset_id: "abc" })).toThrow("Invalid asset id")
  })

  test("rejects if status or asset_id is missing", () => {
    expect(() => sanitizeRecommendation({ status: "BUY" })).toThrow("Missing required fields")
  })
})

describe("sanitizeRecommendationUpdate", () => {
  test("only returns the fields actually provided", () => {
    expect(sanitizeRecommendationUpdate({ status: "SELL" })).toEqual({ status: "SELL" })
  })
})