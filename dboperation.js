const Document = require('./models/document');
const User = require('./models/user');

// 1. Create a new document
async function createDocument(title, content = '', ownerId) {
    try {
        const newDoc = new Document({
            title,
            content,
            owner: ownerId
        });
        const savedDoc = await newDoc.save();
        return savedDoc;
    } catch (error) {
        console.error("Error creating document:", error.message);
        throw error;
    }
}

// 2. Read / Get document by ID
async function getDocumentById(id) {
    try {
        const doc = await Document.findById(id).populate('owner', 'username email');
        return doc;
    } catch (error) {
        console.error("Error fetching document:", error.message);
        throw error;
    }
}

// 3. Update document content
async function updateDocument(id, newContent) {
    try {
        const updatedDoc = await Document.findByIdAndUpdate(
            id,
            { 
                content: newContent, 
                updatedAt: Date.now() 
            },
            { new: true }
        );
        return updatedDoc;
    } catch (error) {
        console.error("Error updating document:", error.message);
        throw error;
    }
}

// 4. Delete document
async function deleteDocument(id) {
    try {
        const deletedDoc = await Document.findByIdAndDelete(id);
        return deletedDoc;
    } catch (error) {
        console.error("Error deleting document:", error.message);
        throw error;
    }
}

// 5. Get all documents for a user
async function getAllDocumentsByUser(ownerId) {
    try {
        return await Document.find({ owner: ownerId });
    } catch (error) {
        console.error("Error fetching user documents:", error.message);
        throw error;
    }
}

module.exports = {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocumentsByUser
};