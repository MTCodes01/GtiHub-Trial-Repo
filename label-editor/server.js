const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const cors = require('cors');

const app = express();
const PORT = 3000;
const LABELS_FILE_PATH = path.join(__dirname, '..', '.github', 'labels.yml');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET labels
app.get('/api/labels', (req, res) => {
    try {
        if (!fs.existsSync(LABELS_FILE_PATH)) {
            return res.json([]);
        }
        const fileContents = fs.readFileSync(LABELS_FILE_PATH, 'utf8');
        const labels = yaml.load(fileContents) || [];
        res.json(labels);
    } catch (e) {
        console.error(e);
        res.status(500).send('Error reading labels file');
    }
});

// POST labels
app.post('/api/labels', (req, res) => {
    try {
        const newLabels = req.body;
        // Make sure it's an array
        if (!Array.isArray(newLabels)) {
            return res.status(400).send('Expected an array of labels');
        }
        
        const yamlStr = yaml.dump(newLabels);
        
        // Ensure .github directory exists
        const githubDir = path.dirname(LABELS_FILE_PATH);
        if (!fs.existsSync(githubDir)) {
            fs.mkdirSync(githubDir, { recursive: true });
        }
        
        fs.writeFileSync(LABELS_FILE_PATH, yamlStr, 'utf8');
        res.status(200).send('Labels saved successfully');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error writing labels file');
    }
});

app.listen(PORT, () => {
    console.log(`Label editor running at http://localhost:${PORT}`);
});
