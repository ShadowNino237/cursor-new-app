const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept all file types
        cb(null, true);
    }
});

// Store file metadata
let fileMetadata = [];

// Load existing file metadata on startup
const metadataFile = path.join(__dirname, 'file-metadata.json');
if (fs.existsSync(metadataFile)) {
    try {
        fileMetadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    } catch (error) {
        console.error('Error loading file metadata:', error);
        fileMetadata = [];
    }
}

// Save file metadata to file
function saveMetadata() {
    fs.writeFileSync(metadataFile, JSON.stringify(fileMetadata, null, 2));
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date().toISOString(),
            path: req.file.path
        };

        fileMetadata.push(fileInfo);
        saveMetadata();

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: fileInfo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Upload multiple files endpoint
app.post('/api/upload-multiple', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => {
            const fileInfo = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                originalName: file.originalname,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: new Date().toISOString(),
                path: file.path
            };
            fileMetadata.push(fileInfo);
            return fileInfo;
        });

        saveMetadata();

        res.json({
            success: true,
            message: `${uploadedFiles.length} files uploaded successfully`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get all files endpoint
app.get('/api/files', (req, res) => {
    try {
        res.json({
            success: true,
            files: fileMetadata.map(file => ({
                id: file.id,
                originalName: file.originalName,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: file.uploadDate
            }))
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Download file endpoint
app.get('/api/download/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        const file = fileMetadata.find(f => f.id === fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(uploadsDir, file.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.download(filePath, file.originalName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Delete file endpoint
app.delete('/api/files/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        const fileIndex = fileMetadata.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = fileMetadata[fileIndex];
        const filePath = path.join(uploadsDir, file.filename);
        
        // Delete file from disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Remove from metadata
        fileMetadata.splice(fileIndex, 1);
        saveMetadata();

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Clear all files endpoint
app.delete('/api/files', (req, res) => {
    try {
        // Delete all files from disk
        fileMetadata.forEach(file => {
            const filePath = path.join(uploadsDir, file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        
        // Clear metadata
        fileMetadata = [];
        saveMetadata();

        res.json({
            success: true,
            message: 'All files deleted successfully'
        });
    } catch (error) {
        console.error('Clear all error:', error);
        res.status(500).json({ error: 'Clear all failed' });
    }
});

// Get file info endpoint
app.get('/api/files/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        const file = fileMetadata.find(f => f.id === fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json({
            success: true,
            file: {
                id: file.id,
                originalName: file.originalName,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: file.uploadDate
            }
        });
    } catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({ error: 'Failed to get file info' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 File Upload App server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`📊 Currently storing ${fileMetadata.length} files`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    saveMetadata();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    saveMetadata();
    process.exit(0);
});