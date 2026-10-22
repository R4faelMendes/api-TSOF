import mysql from "mysql2";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({
  path: "./.env",
  example: "./.env.example",
  allowEmptyValues: true,
});

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "senai@604",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "vio",
  port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
});

export default pool;