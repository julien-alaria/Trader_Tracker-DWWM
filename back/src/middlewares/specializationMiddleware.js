import AppError from "../utils/AppError.js"

export default function SpecializationMiddleware() {

    return async function (req, res, next) {
        try {
            const { role, analyst_type_id } = req.user //authMiddleware
            const { asset_type_id } = req.asset // assetMiddleware

            if (role === "admin") return next()

            if (role === "analyst") {
                if (analyst_type_id !== asset_type_id) {
                    throw new AppError("Access denied: You can only recommend assets that match your specialization.", 403)
                }
                return next()
            }

            throw new AppError("Access denied: Role not authorized.", 403)

        } catch (error) {
            next(error)
        }
    }
}