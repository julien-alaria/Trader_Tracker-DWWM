import jwt from "jsonwebtoken"

function generateToken(user) {
    const token = jwt.sign(
        {
            id: user.id, 
            role: user.role, 
            analyst_type_id: user.analyst_type_id
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: "1h"
        }
    )

    return token
}

export default generateToken