import express from "express"
import { db } from "./db"
import { authMiddleware } from "./middleware/auth"

const router = express.Router()

// All Province Statistics
router.get("/all_province", authMiddleware, async (req, res) => {
  const [rows] = await db.query("SELECT province, SUM(value) as total FROM analytics GROUP BY province")
  res.json(rows)
})

// Province Statistics
router.get("/province/:province_name", authMiddleware, async (req, res) => {
  const { province_name } = req.params
  const [rows] = await db.query("SELECT * FROM analytics WHERE province = ?", [province_name])
  res.json(rows)
})

// Get All Location Details
router.get("/locationDetails", authMiddleware, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM analytics")
  res.json(rows)
})

// Province Location Details
router.get("/locationDetails/:province", authMiddleware, async (req, res) => {
  const { province } = req.params
  const [rows] = await db.query("SELECT * FROM analytics WHERE province = ?", [province])
  res.json(rows)
})

// Yearly Location Details
router.get("/locationDetails/year/:year", authMiddleware, async (req, res) => {
  const { year } = req.params
  const [rows] = await db.query("SELECT * FROM analytics WHERE YEAR(createdAt) = ?", [year])
  res.json(rows)
})

// Year + Month Location Details
router.get("/locationDetails/:year/:month", authMiddleware, async (req, res) => {
  const { year, month } = req.params
  const [rows] = await db.query(
    "SELECT * FROM analytics WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?",
    [year, month]
  )
  res.json(rows)
})

export default router
