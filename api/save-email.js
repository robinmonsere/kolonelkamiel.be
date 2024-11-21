const { Pool } = require('pg');

// Poolconfiguratie
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // Maximaal 10 connecties
    idleTimeoutMillis: 30000, // Sluit inactieve connecties na 30 seconden
    connectionTimeoutMillis: 2000, // Wacht maximaal 2 seconden op een nieuwe connectie
});

// API-handler
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Fout, controleer uw e-mailadres.' });
    }

    let client; // Variabele voor de client
    try {
        client = await pool.connect(); // Vraag een connectie uit de pool
        await client.query(
            'INSERT INTO emails (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
            [email]
        );
        res.status(200).json({ message: 'E-mail succesvol opgeslagen. Wij houden u op de hoogte.' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Oei, er ging iets mis. Probeer later opnieuw.' });
    } finally {
        if (client) {
            client.release(); // Geef de connectie terug aan de pool, zelfs bij fouten
        }
    }
};

// Schone afsluiting van de pool bij serverstop
process.on('SIGTERM', async () => {
    console.log('Server stopping... Closing database pool.');
    await pool.end(); // Sluit alle actieve connecties
    process.exit(0); // Beëindig het proces correct
});
