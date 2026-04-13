require('dotenv').config();
const express = require('express');
const app = express();
const { poolPromise } = require('./config/db');

app.use(express.json()); // Để server đọc được dữ liệu JSON gửi lên

app.get('/test-db', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Hotel');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});