// SECURITY: sets protective HTTP response headers, inspired by the
// well-known "helmet" npm package.
export default function securityHeaders(req, res, next) {
    // Prevents browsers from "sniffing" a response's content-type
    // away from the one declared, which can be abused to execute
    // disguised malicious files (e.g. an uploaded file served as a
    // script instead of an image).
    res.setHeader("X-Content-Type-Options", "nosniff")

    // Prevents the site from being embedded in an <iframe> on another
    // domain, which protects against clickjacking attacks.
    res.setHeader("X-Frame-Options", "DENY")

    // Limits how much referrer information is sent to other sites
    // when a user navigates away (privacy hardening).
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")

    // Disables browser-side DNS prefetching of links found on the
    // page, reducing unintended information leaks.
    res.setHeader("X-DNS-Prefetch-Control", "off")

    // Removes the "X-Powered-By: Express" header Express adds by
    // default, so attackers can't easily fingerprint the backend
    // technology to target known framework-specific vulnerabilities.
    res.removeHeader("X-Powered-By")

    next()
}