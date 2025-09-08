import express from "express"
import { db } from "./db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)

  await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name, email, hashed
  ])

  res.json({ message: "User created" })
})

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email])
  const user: any = (rows as any)[0]

  if (!user) return res.status(400).json({ error: "User not found" })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ error: "Invalid password" })

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "1h" })
  res.json({ token })
})

export default router
