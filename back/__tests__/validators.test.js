import {
  validateName,
  validateEmail,
  validatePassword,
  validateBio,
  validateCompany,
  safeRole,
  safePublicRole,
  validateAnalystType,
  validateComment,
  validateRecommendationStatus
} from "../src/utils/validators.js"
import AppError from "../src/utils/AppError.js"

describe("validateName", () => {
  test("accepts a valid name and removes extra spaces", () => {
    expect(validateName("  Jean  ")).toBe("Jean")
  })

  test("rejects an empty name", () => {
    expect(() => validateName("")).toThrow(AppError)
    expect(() => validateName("")).toThrow("Name required")
  })

  test("rejects a name that is too short (fewer than 2 characters)", () => {
    expect(() => validateName("J")).toThrow("Invalid name")
  })

  test("rejects a name containing forbidden characters", () => {
    expect(() => validateName("Jean@Dupont")).toThrow("Invalid name")
  })
})

describe("validateEmail", () => {
  test("accepts a valid email and normalizes it to lowercase", () => {
    expect(validateEmail("Test@Example.com")).toBe("test@example.com")
  })

  test("rejects a malformed email", () => {
    expect(() => validateEmail("bademail")).toThrow("Invalid email")
  })

  test("rejects an empty email", () => {
    expect(() => validateEmail("")).toThrow("Email required")
  })
})

describe("validatePassword", () => {
  test("accepte un mot de passe respectant toutes les règles", () => {
    expect(validatePassword("Abcdef1!")).toBe("Abcdef1!")
  })

  test.each([
    ["weak"],
    ["nouppercase1!"],
    ["NOLOWERCASE1!"],
    ["NoSpecialChar1"]
  ])("rejects an invalid password : %s", (password) => {
    expect(() => validatePassword(password)).toThrow("Invalid password")
  })

  test("rejects an empty password", () => {
    expect(() => validatePassword("")).toThrow("Password required")
  })
})

describe("validateBio", () => {
  test("accepte une bio nulle", () => {
    expect(validateBio(null)).toBeNull()
  })

  test("accepts a bio of 1,000 characters (upper limit)", () => {
    expect(validateBio("a".repeat(1000))).toHaveLength(1000)
  })

  test("rejects a bio of more than 1,000 characters", () => {
    expect(() => validateBio("a".repeat(1001))).toThrow("Bio too long")
  })
})

describe("validateCompany", () => {
  test("accepte une entreprise nulle", () => {
    expect(validateCompany(null)).toBeNull()
  })

  test("rejects a company name longer than 100 characters", () => {
    expect(() => validateCompany("a".repeat(101))).toThrow("Company name too long")
  })
})

describe("safeRole", () => {
  test("allows an admin role (usage reserved for admin routes)", () => {
    expect(safeRole("admin")).toBe("admin")
  })

  test("falls back to 'user' if the role is unknown", () => {
    expect(safeRole("hacker")).toBe("user")
  })
})

describe("safePublicRole", () => {
  test("blocks any 'admin' self-promotion during public registration", () => {
    expect(safePublicRole("admin")).toBe("user")
  })

  test("allow 'analyst' through", () => {
    expect(safePublicRole("analyst")).toBe("analyst")
  })
})

describe("validateAnalystType", () => {
  test("returns null if the role is not 'analyst'", () => {
    expect(validateAnalystType("user", 5)).toBeNull()
  })

  test("accepts a valid ID for an analyst", () => {
    expect(validateAnalystType("analyst", 3)).toBe(3)
  })

  test("rejects a missing ID for an analyst", () => {
    expect(() => validateAnalystType("analyst", undefined)).toThrow("Analyst type required")
  })

  test("rejects a negative or non-numeric ID", () => {
    expect(() => validateAnalystType("analyst", -1)).toThrow("Invalid asset type")
    expect(() => validateAnalystType("analyst", "abc")).toThrow("Invalid asset type")
  })
})

describe("validateComment", () => {
  test("accepts a null comment", () => {
    expect(validateComment(null)).toBeNull()
  })

  test("rejects a comment longer than 1,000 characters", () => {
    expect(() => validateComment("a".repeat(1001))).toThrow("Comment too long")
  })
})

describe("validateRecommendationStatus", () => {
  test("accept BUY, SELL et HOLD", () => {
    expect(validateRecommendationStatus("BUY")).toBe("BUY")
    expect(validateRecommendationStatus("SELL")).toBe("SELL")
    expect(validateRecommendationStatus("HOLD")).toBe("HOLD")
  })

  test("rejects an unknown status", () => {
    expect(() => validateRecommendationStatus("MAYBE")).toThrow("Invalid recommendation status")
  })
})