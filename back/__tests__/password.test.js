import { hashPassword, comparePassword } from "../src/utils/password.js"

describe("hashPassword", () => {
  test("returns a hash that differs from the plaintext password", async () => {
    const hash = await hashPassword("Abcdef1!")
    expect(hash).not.toBe("Abcdef1!")
    expect(typeof hash).toBe("string")
  })

  test("generates a different hash on each call (salting)", async () => {
    const hash1 = await hashPassword("Abcdef1!")
    const hash2 = await hashPassword("Abcdef1!")
    expect(hash1).not.toBe(hash2)
  })
})

describe("comparePassword", () => {
  test("returns true if the password matches the hash", async () => {
    const hash = await hashPassword("Abcdef1!")
    await expect(comparePassword("Abcdef1!", hash)).resolves.toBe(true)
  })

  test("returns false if the password does not match the hash", async () => {
    const hash = await hashPassword("Abcdef1!")
    await expect(comparePassword("WrongPassword1!", hash)).resolves.toBe(false)
  })
})