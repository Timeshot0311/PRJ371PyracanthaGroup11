import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./auth-api"
import userRoutes from "./user-api"
import analyticsRoutes from "./analytics-api"

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reports", analyticsRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`))
