// db.js
const { Pool } = require("pg");

const pool = new Pool({
  host:     "localhost",
  port:     5432,
  database: "Benki_Ecom_DB",
  user:     "postgres",
  password: "1ds12is034"
})

pool.connect((err, client, release) => {
  if (err) {
    console.error("DB connection failed:", err.message)
  } else {
    console.log("DB connected ✅")
    release()
  }
})

module.exports = pool;