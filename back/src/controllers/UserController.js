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

async function getUserById(req, res) {
    try {
        const result = await UserModel.getUsersById(req.params.id)

        res.status(200).json({ message: result })
    }catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function createUser(req, res) {
    try {
        const user = await UserModel.createUsers(req.body)

        const token = generateToken(user)

        res.status(200).json({ user, token})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

async function updateUser(req, res) {
    try {
        const user = await UserModel.updateUsers(req.params.id, req.body)

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

async function deleteUser(req, res) {
    try {
        const user = await UserModel.deleteUsers(req.params.id)

        res.status(200).json({ message : "delete ok" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export default { getUser, getUserById, createUser, updateUser, deleteUser }