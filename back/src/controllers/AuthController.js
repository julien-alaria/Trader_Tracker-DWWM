import UserModel from "../models/UserModel.js"
import generateToken from "../services/authTokenService.js"

async function register(req, res) {

    try {
        const user = await UserModel.createUsers(req.body)
        const token = generateToken(user)

        res.status(201).json({ user, token })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
} 

export default { register }