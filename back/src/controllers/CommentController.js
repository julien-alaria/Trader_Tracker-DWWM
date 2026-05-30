import CommentModel from "../models/CommentModel.js"
import { sanitizeComment, sanitizeCommentUpdate } from "../utils/sanitizer.js"

async function getComment(req, res) {
    try {
        const results = await CommentModel.getComments()

        return res.status(200).json({ results })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

async function createComment(req, res) {
    try {
        const sanitizedData = sanitizeComment(req.body)

        const comment = await CommentModel.createComments(sanitizedData)

        return res.status(201).json({ comment })

    } catch (error) {

        return res.status(500).json({ error: error.message })

    }
}

async function updateComment(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID invalide" })
        }

        const sanitizedData = sanitizeCommentUpdate(req.body)

        // no allowed fields
        if (Object.keys(sanitizedData).length === 0) {
            return res.status(400).json({
                error: "Aucune donnée valide"
            })
        }

        const existingComment = await CommentModel.getCommentById(id)

        if (!existingComment) {
            return res.status(404).json({ error: "Comment not found" })
        }

        if (existingComment.user_id !== req.user.id) {
            return res.status(403).json({
                error: "Update denied"
            })
        }

        const comment = await CommentModel.updateComments(id, sanitizedData)

        return res.status(200).json(comment)

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

async function deleteComment(req, res) {
    try {
        const id = Number(req.params.id)
        
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({ error: "unvalid ID" })
                }

                const existingComment = await CommentModel.getCommentById(id)

                if (!existingComment) {
                    return res.status(404).json({ error: "Comment not found" })
                }

                if (existingComment.user_id !== req.user.id) {
                    return res.status(403).json({
                        error: "Delete denied"
                    })
                }
        
                const result = await CommentModel.deleteComments(id)
        
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Comment not found" })
                }
        
                res.status(200).json({ message : "delete ok" })
        

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export default { getComment, createComment, updateComment, deleteComment }