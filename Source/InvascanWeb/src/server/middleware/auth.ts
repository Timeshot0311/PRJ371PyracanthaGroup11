import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export function authMiddleware(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" })

  const token = authHeader.split(" ")[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey")
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
