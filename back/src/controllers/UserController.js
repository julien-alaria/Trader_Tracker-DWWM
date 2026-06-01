import UserModel from "../models/UserModel.js"
import generateToken from "../services/authTokenService.js"
import { sanitizeUser, sanitizeUserUpdate } from "../utils/sanitizer.js"

async function getUser(req, res) {
    try {
        const results = await UserModel.getUsers()

        return res.status(200).json({ results })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

async function getMe(req, res) {
    try {
        const user_id = req.user.id

        if (!user_id) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const result = await UserModel.getUsersById(user_id)

        if (!result) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({ result })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

async function getUserById(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
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

async function getWatchlist(req, res) {
    try {
        const user_id = req.user.id

        const result = await UserModel.getUserWatchlist(user_id)

        return res.status(200).json({ result })

    } catch (error) {
        
        return res.status(500).json({ error: error.message })
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

        if (data.role !== undefined && !isAdmin) {
            throw new Error("Forbidden")
        }

        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
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

        return res.status(200).json(user)

    } catch (error) {

        return res.status(500).json({ error: error.message })
    }
}

async function updateMe(req, res) {
    try {
        const id = req.user.id

        const sanitizedData = sanitizeUserUpdate(req.body)

        // blocage sécurité : empêcher changement rôle
        if (sanitizedData.role !== undefined) {
            delete sanitizedData.role
        }

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

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "unvalid ID" })
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" })
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

async function followAsset(req, res) {
    try {
        const user_id = req.user.id
        const asset_id = req.asset_id

        await UserModel.userFollowAsset(user_id, asset_id)

        return res.status(201).json({
            message: "asset added to favorites"
        })

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Asset already followed"
            })
        } 
        console.error("FOLLOW ERROR:", error)
        return res.status(500).json({
            error: error.message
        })
    }
}

async function unfollowAsset(req, res) {
    try {
        const user_id = req.user.id
        const asset_id = req.asset_id

        const result = await UserModel.userUnfollowAsset(user_id, asset_id)

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Favorite not found"
            })
        }

        return res.status(200).json({
            message: "asset removed from favorites"
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export default { getUser, getUserById, createUser, updateUser, deleteUser, followAsset, unfollowAsset, getWatchlist, getMe, updateMe }