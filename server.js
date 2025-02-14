require('dotenv').config();

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const backendUrl = process.env.BACKEND_URL; // Load backend URL from .env

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());

// Configure Multer for PDF uploads
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.render('home');  // Chatbot Page
});

app.get('/admin', async (req, res) => {
    try {
        // Fetch files from the Flask backend
        const response = await axios.get(`${backendUrl}/get_files`);
        res.render('admin', { files: response.data.files });  // Pass files to the admin page
    } catch (error) {
        res.status(500).send("Error fetching files.");
    }
});

// Handle PDF Upload
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        const formData = new FormData();
        formData.append("files", req.file.buffer, req.file.originalname);

        const response = await axios.post(`${backendUrl}/upload_pdf`, formData, {
            headers: formData.getHeaders(),
        });

        res.json({ message: response.data.message });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload PDF" });
    }
});

// Handle User Query
app.post('/query', async (req, res) => {
    try {
        const response = await axios.post(`${backendUrl}/query`, { message: req.body.message });
        res.json({ response: response.data.response });
    } catch (error) {
        res.status(500).json({ error: "Failed to process query" });
    }
});

// Remove file from vector store (admin panel)
app.post('/remove-file', async (req, res) => {
    try {
        const response = await axios.post(`${backendUrl}/remove_file`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to remove file" });
    }
});

// Clear all data in the vector store
app.post('/clear-vector-store', async (req, res) => {
    try {
        const response = await axios.post(`${backendUrl}/clear_vector_store`);
        res.json(response.data);
    } catch (error) {
        console.error('Error clearing vector store:', error);
        res.status(500).json({ message: 'Failed to clear vector store.' });
    }
});

// Handle URL upload from frontend
app.post('/upload-url', async (req, res) => {
    try {
        const response = await axios.post(`${backendUrl}/scrape`, { url: req.body.url });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to upload URL" });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
