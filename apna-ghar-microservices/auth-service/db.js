const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((conn) => {
        console.log("Auth Service connected to MySQL Database successfully.");
        conn.release();
    })
    .catch((err) => {
        console.error("Error connecting to Auth Database:", err.message);
    });

module.exports = pool;
