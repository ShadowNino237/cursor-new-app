# File Upload App

A modern, responsive web application for uploading, storing, and managing files. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Responsive Design**: Works perfectly on all screen sizes (mobile, tablet, desktop)
- **Drag & Drop Upload**: Intuitive file upload with drag and drop support
- **File Management**: View, download, and delete uploaded files
- **File Preview**: Preview images and view detailed file information
- **Progress Indicators**: Real-time upload progress with visual feedback
- **Local Storage**: Files are stored locally in the browser
- **Offline Support**: Service worker for offline functionality
- **Modern UI**: Beautiful gradient design with smooth animations
- **Accessibility**: Keyboard navigation and screen reader support

## File Support

- **All File Types**: Supports any file type (images, videos, documents, archives, etc.)
- **File Size Limit**: Maximum 100MB per file
- **Multiple Upload**: Upload multiple files at once
- **File Validation**: Automatic file validation and error handling

## Technologies Used

- **HTML5**: Semantic markup with modern features
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with classes and async/await
- **Font Awesome**: Icons for better user experience
- **Service Worker**: Offline functionality and caching

## Getting Started

1. **Clone or Download**: Get the project files
2. **Open**: Open `index.html` in a web browser
3. **Upload**: Drag and drop files or click to browse
4. **Manage**: View, download, or delete your uploaded files

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Upload Methods
- **Drag & Drop**: Drag files directly onto the upload area
- **Click to Browse**: Click the upload area to open file browser
- **Multiple Files**: Select multiple files at once

### File Management
- **File Grid**: Responsive grid layout showing all uploaded files
- **File Cards**: Each file displayed as a card with icon, name, and size
- **File Actions**: Download, view details, or delete individual files
- **Bulk Actions**: Clear all files or refresh the file list

### File Information
- **File Details Modal**: View comprehensive file information
- **Image Preview**: Automatic image preview in the details modal
- **File Metadata**: Name, size, type, and upload date

### User Experience
- **Toast Notifications**: Success, error, and warning messages
- **Progress Bars**: Visual upload progress indication
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error handling with user feedback

## Customization

### File Size Limit
Modify the `maxFileSize` property in `script.js`:
```javascript
this.maxFileSize = 100 * 1024 * 1024; // 100MB
```

### Allowed File Types
Modify the `allowedTypes` array in `script.js`:
```javascript
this.allowedTypes = ['image/*', 'application/pdf']; // Only images and PDFs
```

### Styling
The CSS is modular and easy to customize:
- Colors: Modify CSS custom properties
- Layout: Adjust grid and flexbox properties
- Animations: Customize transition and animation durations

## Storage

Files are stored in the browser's localStorage as base64-encoded data. This means:
- Files persist between browser sessions
- No server required
- Files are stored locally on the user's device
- Storage is limited by browser's localStorage quota

## Security Considerations

- Files are stored locally in the browser
- No server-side processing
- Client-side validation only
- Consider implementing server-side validation for production use

## Performance

- Lazy loading of file previews
- Efficient DOM manipulation
- Optimized CSS with hardware acceleration
- Service worker caching for faster loading

## Future Enhancements

- Server-side file storage
- User authentication
- File sharing capabilities
- Advanced file search and filtering
- File compression
- Cloud storage integration

## License

This project is open source and available under the MIT License.