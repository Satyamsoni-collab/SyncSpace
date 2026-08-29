require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocumentsByUser
} = require('./dboperation');
const { registerUser, loginUser, authenticateToken } = require('./auth');

const app = express();
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const doc = await createDocument(title, content, req.user.id);
        res.status(201).json({ success: true, document: doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/documents/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await getDocumentById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        res.status(200).json({ success: true, document: doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/documents/:id', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const updatedDoc = await updateDocument(req.params.id, content);
        res.status(200).json({ success: true, document: updatedDoc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
    try {
        await deleteDocument(req.params.id);
        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/my-documents', authenticateToken, async (req, res) => {
    try {
        const docs = await getAllDocumentsByUser(req.user.id);
        res.status(200).json({ success: true, documents: docs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));