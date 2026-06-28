// Custom error class for expected, "client-fault" errors (bad input,
// missing fields, invalid format, business rule violations like
// "Email already used"...). Carrying an explicit HTTP status code lets
// controllers respond correctly (400, 404, 409...) instead of
// defaulting everything to 500, which should only mean "unexpected
// server bug".
export default class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message)
        this.statusCode = statusCode
        this.name = "AppError"
    }
}