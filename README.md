# File Upload App

A complete, responsive web application for uploading and managing files. The app works on all screen sizes and provides both client-side storage (localStorage) and server-side storage options.

## Features

- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🚀 **Drag & Drop**: Intuitive file upload with drag-and-drop support
- 📁 **File Management**: View, download, and delete uploaded files
- 👁️ **File Preview**: Preview images, videos, audio, PDFs, and text files
- 💾 **Dual Storage**: Client-side (localStorage) or server-side (Node.js) storage
- 🎨 **Modern UI**: Beautiful, modern interface with smooth animations
- 📊 **Progress Tracking**: Real-time upload progress indicators
- 🔒 **File Validation**: Size limits and file type validation
- 📱 **Mobile Optimized**: Touch-friendly interface for mobile devices

## Quick Start

### Option 1: Client-Side Only (No Server Required)

1. Simply open `index.html` in your web browser
2. The app uses localStorage to store files (limited by browser storage)

### Option 2: Full Server Setup (Recommended)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## File Structure

```
file-upload-app/
├── index.html              # Main HTML file
├── styles.css              # Responsive CSS styles
├── script.js               # Client-side only version
├── script-server.js        # Server-integrated version
├── server.js               # Node.js/Express server
├── package.json            # Node.js dependencies
├── uploads/                # Server file storage directory
├── file-metadata.json      # Server file metadata
└── README.md               # This file
```

## Usage

### Uploading Files

1. **Click Upload**: Click the upload area or "Choose Files" button
2. **Drag & Drop**: Drag files directly onto the upload area
3. **Multiple Files**: Select or drag multiple files at once
4. **Progress**: Watch the upload progress bar

### Managing Files

- **View Files**: Click on any file card to preview it
- **Download**: Click the download button on any file
- **Delete**: Click the delete button to remove a file
- **Clear All**: Use the "Clear All" button to remove all files

### File Preview

The app supports previewing:
- **Images**: JPEG, PNG, GIF, WebP, etc.
- **Videos**: MP4, WebM, AVI, etc.
- **Audio**: MP3, WAV, OGG, etc.
- **PDFs**: Full PDF viewer
- **Text Files**: Plain text preview

## Technical Details

### Client-Side Storage (script.js)
- Uses localStorage for file storage
- Files are converted to Base64 for storage
- Limited by browser storage quotas
- No server required

### Server-Side Storage (script-server.js)
- Uses Node.js/Express backend
- Files stored on disk in `uploads/` directory
- Metadata stored in `file-metadata.json`
- Supports larger files and better performance

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layout
- Touch-friendly interface
- Optimized for all screen sizes

## API Endpoints (Server Version)

- `POST /api/upload` - Upload single file
- `POST /api/upload-multiple` - Upload multiple files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get file info
- `GET /api/download/:id` - Download file
- `DELETE /api/files/:id` - Delete file
- `DELETE /api/files` - Delete all files

## Configuration

### File Size Limits
- Default: 10MB per file
- Configurable in both client and server code

### Supported File Types
- All file types are supported
- File type validation can be added in `server.js`

### Storage Location
- Client: Browser localStorage
- Server: `./uploads/` directory

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Prerequisites
- Node.js 14+ (for server version)
- Modern web browser

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Customization

1. **Styling**: Modify `styles.css` for custom appearance
2. **File Limits**: Update `maxFileSize` in JavaScript files
3. **Storage**: Switch between client/server versions
4. **File Types**: Add validation in `server.js`

## Security Considerations

- File size limits prevent abuse
- File type validation can be added
- Server version stores files securely on disk
- No sensitive data in client-side storage

## Performance

- Optimized for large file uploads
- Progress tracking for better UX
- Efficient file storage and retrieval
- Responsive design for all devices

## Troubleshooting

### Common Issues

1. **Files not uploading**: Check file size limits
2. **Server not starting**: Ensure Node.js is installed
3. **Files not displaying**: Check browser console for errors
4. **Mobile issues**: Ensure touch events are enabled

### Browser Console
Check the browser console (F12) for any error messages.

## License

MIT License - Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for easy file management**