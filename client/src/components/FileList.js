import React, { useState } from 'react';
import { 
  File, 
  Download, 
  Trash2, 
  RefreshCw, 
  Search,
  Grid,
  List,
  Calendar,
  HardDrive,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  Code
} from 'lucide-react';
import './FileList.css';

const FileList = ({ files, loading, onDelete, onDownload, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, name, size
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('list'); // list, grid

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <Image className="file-type-icon" />;
    if (mimetype.startsWith('video/')) return <Video className="file-type-icon" />;
    if (mimetype.startsWith('audio/')) return <Music className="file-type-icon" />;
    if (mimetype.startsWith('text/') || mimetype.includes('document')) return <FileText className="file-type-icon" />;
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return <Archive className="file-type-icon" />;
    if (mimetype.includes('javascript') || mimetype.includes('json') || mimetype.includes('html') || mimetype.includes('css')) return <Code className="file-type-icon" />;
    return <File className="file-type-icon" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
      default:
        comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getTotalSize = () => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(total);
  };

  if (loading) {
    return (
      <div className="file-list-container">
        <div className="file-list-header">
          <h2>Your Files</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <div className="header-left">
          <h2>Your Files</h2>
          <div className="file-stats">
            <span className="file-count">{files.length} files</span>
            <span className="total-size">{getTotalSize()}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={onRefresh}
            title="Refresh files"
          >
            <RefreshCw className="btn-icon" />
          </button>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="btn-icon" />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="btn-icon" />
            </button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <button
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => handleSort('name')}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'size' ? 'active' : ''}`}
              onClick={() => handleSort('size')}
            >
              Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => handleSort('date')}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="empty-state">
          <HardDrive className="empty-icon" />
          <h3>No files uploaded yet</h3>
          <p>Start by uploading some files using the upload area above.</p>
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="empty-state">
          <Search className="empty-icon" />
          <h3>No files match your search</h3>
          <p>Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className={`files-container ${viewMode}`}>
          {sortedFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                {getFileIcon(file.mimetype)}
                <div className="file-details">
                  <h4 className="file-name" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">
                      <Calendar className="meta-icon" />
                      {formatDate(file.uploadDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="file-actions">
                <button
                  className="action-btn download-btn"
                  onClick={() => onDownload(file.id, file.originalName)}
                  title="Download file"
                >
                  <Download className="btn-icon" />
                  <span className="btn-text">Download</span>
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
                      onDelete(file.id);
                    }
                  }}
                  title="Delete file"
                >
                  <Trash2 className="btn-icon" />
                  <span className="btn-text">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;