import express from "express"
import { db } from "./db"
import { authMiddleware } from "./middleware/auth"

const router = express.Router()

// Get current user
router.get("/me", authMiddleware, async (req: any, res) => {
  const [rows] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id])
  res.json((rows as any)[0])
})

// Get all users (admin use case)
router.get("/", authMiddleware, async (req, res) => {
  const [rows] = await db.query("SELECT id, name, email FROM users")
  res.json(rows)
})

export default router
