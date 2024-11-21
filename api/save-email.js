const { Pool } = require('pg');

// Gebruik Pool in plaats van Client voor efficiënter hergebruik van connecties
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        const client = await pool.connect();
        await client.query('INSERT INTO emails (email) VALUES ($1)', [email]);
        client.release(); // Release de connectie terug naar de pool

        res.status(200).json({ message: 'Email saved successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};
