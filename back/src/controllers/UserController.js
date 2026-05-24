import UserModel from "../models/UserModel.js"
import generateToken from "../services/authTokenService.js"
import { sanitizeUser } from "../utils/sanitizer.js"

async function getUser(req, res) {
    try {
        const results = await UserModel.getUsers()

        res.status(200).json({ results })

    } catch (error) {

        res.status(500).json({ error: error.message })
    }
}

async function getUserById(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error : "ID invalide" })
        }

        const result = await UserModel.getUsersById(id)

        if (!result) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ result })

    }catch (error) {

        res.status(500).json({ error: error.message })
    }
}

async function createUser(req, res) {
    try {

        const sanitizedData = sanitizeUser(req.body)

        const user = await UserModel.createUsers(sanitizedData)

        const token = generateToken(user)

        return res.status(201).json({ user, token})

    } catch (error) {

        return res.status(500).json({ error: error.message })
    }
}

async function updateUser(req, res) {
    try {
        const id = Number(req.params.id)

        // validate id
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "ID invalide" })
        }

        const sanitizedData = sanitizeUserUpdate(req.body)

        // no allowed fields
        if (Object.keys(sanitizedData).length === 0) {
            return res.status(400).json({
                error: "Aucune donnée valide"
            })
        }

        const user = await UserModel.updateUsers(id, sanitizedData)

        res.status(200).json(user)

    } catch (error) {

        res.status(500).json({ error: error.message })
    }
}

async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id)

         // validate id
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "ID invalide" })
        }

        const result = await UserModel.deleteUsers(id)

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message : "delete ok" })

    } catch (error) {

        res.status(500).json({ error: error.message })
    }
}

export default { getUser, getUserById, createUser, updateUser, deleteUser }