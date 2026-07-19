// Centralized error handler. Every controller forwards its caught
// errors here via next(error) instead of building the HTTP response
// itself. AppError instances carry their own statusCode (400, 404...);
// anything else (an unexpected bug, a DB failure...) falls back to 500.
// This must be registered LAST in index.js, after all routes.
export default function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500

    if (statusCode === 500) {
        console.error("SERVER ERROR:", err)
    }

    res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message})
    
}