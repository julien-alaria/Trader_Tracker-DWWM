export default function SpecializationMiddleware() {
    
    return async function (req, res, next) {
        try {
            const { role, analyst_type_id } = req.user //authMiddleware
            const { asset_type_id } = req.asset // assetMiddlewrare

            if (role === "admin") return next()

            if (role === "analyst") {
                if (analyst_type_id !== asset_type_id) {
                    return res.status(403).json({ error: "Access denied: You can only recommend assets that match your specialization."

                    })
                }
                return next()
            }
            return res.status(403).json({ error: "Access denied: Role not authorized." });

        } catch (error) {
            console.error("SpecializationMiddleware Error:", error)
            return res.status(500).json({ error: "Authorization check failed." })
        }
    }
}