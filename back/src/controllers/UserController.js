import UserModel from "../models/UserModel.js"
import generateToken from "../services/authTokenService.js"

async function getUser(req, res) {
    try {
        const results = await UserModel.getUsers()

        res.status(200).json({ message: results })
    } catch (error) {
        res.staus(500).json({ error: error.message })
    }
}

async function createUser(req, res) {
    try {
        const user = await UserModel.createUsers(req.body)

        const token = generateToken(user)

        res.status(200).json({ user, token})
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

}

export default { getUser, createUser }