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

const app = express();
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Create a new document
app.post('/api/documents', async (req, res) => {
    try {
        const { title, content, ownerId } = req.body;
        const doc = await createDocument(title, content, ownerId);
        res.status(201).json({ success: true, document: doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
    try {
        const doc = await getDocumentById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
        res.status(200).json({ success: true, document: doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update document content
app.put('/api/documents/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const updatedDoc = await updateDocument(req.params.id, content);
        res.status(200).json({ success: true, document: updatedDoc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
    try {
        await deleteDocument(req.params.id);
        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all documents of a user
app.get('/api/users/:userId/documents', async (req, res) => {
    try {
        const docs = await getAllDocumentsByUser(req.params.userId);
        res.status(200).json({ success: true, documents: docs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));