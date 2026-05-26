import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import getConnection from "./src/db/connection.js"
import routes from "./src/routes/index.js"

dotenv.config()

const app = express()
const PORT = process.env.APP_PORT || 3000

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", routes)

app.get('/', (req, res) => {
    res.send('Welcome to DWWM Project!')
})

async function startServer() {
    try {
        await getConnection()
        console.log("Connexion database OK")

        app.listen(PORT, () => {
        console.log(`En écoute sur le port ${PORT}`)
        })
    } catch (error) {
        console.error("Erreur de connexion à la base de données:", error.message)
    }
}

startServer()


