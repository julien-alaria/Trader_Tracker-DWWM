import UserModel from "../models/UserModel.js"
import { sanitizeUser, sanitizeLogin } from "../utils/sanitizer.js"
import { comparePassword } from "../utils/password.js"
import generateToken from "../services/authTokenService.js"

async function login(req, res) {
    try {
        const { email, password } = sanitizeLogin(req.body)
        const user = await UserModel.getUsersByEmail(email) 

        if (!user) {
            return res.status(401).json({ message: "invalid credentials" }) 
        }

        const isMatch = await comparePassword(password, user.password)

        if(!isMatch) {
            return res.status(401).json({ message: "invalid credentials" })
        }

        const token = generateToken(user)

        res.status(200).json({ message: "authorized connexion", token })

    } catch (error) {

        res.status(500).json({ error: error.message })
    }
}

async function register(req, res) {
    try {
        const sanitizedData = sanitizeUser(req.body)
        const user = await UserModel.createUsers(sanitizedData)
        const token = generateToken(user)

        res.status(201).json({ user, token })
        
    } catch (error) {

        console.error("REGISTER ERROR:", error)
        res.status(500).json({ error : error.message })
    }
} 

export default { login, register }