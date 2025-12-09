const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', (req, res) => {
    const message = req.body.message;
    const reply = `You said: ${message}`;
    res.json({ reply });
});

app.post('/upload', upload.array('images', 5), (req, res) => {
    const message = req.body.message || '';
    
    if (!req.files || req.files.length === 0) {
        if (!message) {
            return res.status(400).send('No files or message uploaded.');
        }
        const reply = `You said: ${message}`;
        return res.json({ reply, imageUrls: [] });
    }
    const imageUrls = req.files.map(file => `http://localhost:${port}/uploads/${file.filename}`);
    const reply = message 
        ? `Received message: "${message}" and uploaded ${req.files.length} images.`
        : `Uploaded ${req.files.length} images.`;
        
    res.json({ reply, imageUrls });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});