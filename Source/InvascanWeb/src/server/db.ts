import mysql from "mysql2/promise"

export const db = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "invascan_user",
  password: process.env.DB_PASSWORD || "invascan_pass",
  database: process.env.DB_NAME || "invascan"
})
