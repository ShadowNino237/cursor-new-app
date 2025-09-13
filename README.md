# FileVault - Complete File Upload & Storage Web App

A modern, responsive web application for uploading, storing, and managing files. Built with React frontend and Node.js/Express backend.

## Features

### 🚀 Core Functionality
- **File Upload**: Drag & drop or click to upload single or multiple files
- **File Storage**: Secure server-side file storage with unique naming
- **File Management**: View, download, and delete uploaded files
- **Real-time Progress**: Upload progress tracking with visual feedback
- **File Search**: Search through uploaded files by name
- **File Sorting**: Sort files by name, size, or upload date

### 🎨 User Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Drag & Drop**: Easy file upload with visual drag & drop zone
- **File Preview**: Different icons for different file types
- **Grid/List View**: Toggle between grid and list view modes
- **Toast Notifications**: User-friendly success/error messages

### 🔒 Security & Validation
- **File Size Limits**: Maximum 50MB per file
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers for enhanced protection

### 📱 Responsive Design
- **Mobile First**: Optimized for all screen sizes
- **Touch Friendly**: Easy to use on mobile devices
- **Adaptive Layout**: UI adapts to different screen orientations
- **Progressive Enhancement**: Works on older browsers

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Axios** - HTTP client for API requests
- **React Dropzone** - Drag & drop file upload
- **Lucide React** - Beautiful icons
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting
- **UUID** - Unique identifier generation

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Development Mode

Start both backend and frontend in development mode:

```bash
npm run dev
```

This will:
- Start the Express server on `http://localhost:5000`
- Start the React development server on `http://localhost:3000`
- Enable hot reloading for both frontend and backend

### 3. Production Mode

Build and start the application in production mode:

```bash
# Build the React app
npm run build

# Start the production server
npm start
```

The production server will serve both the API and the React app on `http://localhost:5000`.

## API Endpoints

### File Upload
- `POST /api/upload/single` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files

### File Management
- `GET /api/files` - Get list of all uploaded files
- `GET /api/download/:id` - Download a specific file
- `DELETE /api/files/:id` - Delete a specific file

### File Storage
- Files are stored in the `/uploads` directory
- Each file gets a unique name to prevent conflicts
- Original filenames are preserved in metadata

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=production
REACT_APP_API_URL=http://localhost:5000
```

### File Size Limits

Default limits (can be modified in `server.js`):
- Maximum file size: 50MB
- Maximum files per upload: 10

### Rate Limiting

Default rate limiting (can be modified in `server.js`):
- 100 requests per 15 minutes per IP address

## Project Structure

```
file-upload-app/
├── server.js              # Express server
├── package.json           # Backend dependencies
├── uploads/               # File storage directory
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.js
│   │   │   ├── FileUpload.js
│   │   │   ├── FileList.js
│   │   │   └── Toast.js
│   │   ├── App.js         # Main App component
│   │   └── App.css        # Global styles
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## Usage Guide

### Uploading Files

1. **Drag & Drop**: Drag files from your computer to the upload area
2. **Click to Browse**: Click on the upload area to open file browser
3. **Multiple Files**: Select multiple files at once or upload them separately
4. **Progress Tracking**: Watch real-time upload progress for each file

### Managing Files

1. **View Files**: All uploaded files are displayed in the file list
2. **Search**: Use the search box to find specific files
3. **Sort**: Click column headers to sort by name, size, or date
4. **Download**: Click the download button to save files to your device
5. **Delete**: Click the delete button to remove files (with confirmation)

### View Modes

- **List View**: Detailed view with file information in rows
- **Grid View**: Card-based view with larger file icons

## Customization

### Styling

The app uses CSS custom properties for easy theming. Modify the CSS files in:
- `client/src/App.css` - Global styles
- `client/src/components/*.css` - Component-specific styles

### File Type Support

The app accepts all file types by default. To restrict file types, modify the `fileFilter` function in `server.js`.

### Storage Location

Files are stored in the `/uploads` directory by default. To change this, modify the `uploadsDir` path in `server.js`.

## Security Considerations

- Files are stored outside the web root for security
- File names are sanitized and made unique
- Rate limiting prevents abuse
- Input validation on both client and server
- CORS protection for cross-origin requests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository.

---

**FileVault** - Your secure, modern file storage solution! 🚀