const { Pool } = require('pg');

// Gebruik Pool voor efficiënte connectie-hergebruik
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
        return res.status(400).json({ error: 'Fout, controleer uw e-mailadres.' });
    }

    try {
        const client = await pool.connect();
        await client.query(
            'INSERT INTO emails (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
            [email]
        );
        client.release();

        res.status(200).json({ message: 'E-mail succesvol opgeslagen. Wij houden u op de hoogte.' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Oei, er ging iets mis. Probeer later opnieuw.' });
    }
};
