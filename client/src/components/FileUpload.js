import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, onError, apiBaseUrl }) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    // Initialize upload status for each file
    const filesWithStatus = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null
    }));

    setUploadingFiles(filesWithStatus);
    uploadFiles(filesWithStatus);
  }, []);

  const uploadFiles = async (filesWithStatus) => {
    setIsUploading(true);

    try {
      // Upload files one by one or all at once based on your preference
      if (filesWithStatus.length === 1) {
        await uploadSingleFile(filesWithStatus[0]);
      } else {
        await uploadMultipleFiles(filesWithStatus);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 3000);
    }
  };

  const uploadSingleFile = async (fileWithStatus) => {
    const formData = new FormData();
    formData.append('file', fileWithStatus.file);

    try {
      updateFileStatus(fileWithStatus.id, 'uploading', 0);

      const response = await axios.post(`${apiBaseUrl}/api/upload/single`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateFileStatus(fileWithStatus.id, 'uploading', progress);
        },
      });

      updateFileStatus(fileWithStatus.id, 'success', 100);
      onUploadSuccess([response.data.file]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upload failed';
      updateFileStatus(fileWithStatus.id, 'error', 0, errorMessage);
      onError(errorMessage);
    }
  };

  const uploadMultipleFiles = async (filesWithStatus) => {
    const formData = new FormData();
    filesWithStatus.forEach((fileWithStatus) => {
      formData.append('files', fileWithStatus.file);
      updateFileStatus(fileWithStatus.id, 'uploading', 0);
    });

    try {
      const response = await axios.post(`${apiBaseUrl}/api/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          filesWithStatus.forEach((fileWithStatus) => {
            updateFileStatus(fileWithStatus.id, 'uploading', progress);
          });
        },
      });

      filesWithStatus.forEach((fileWithStatus) => {
        updateFileStatus(fileWithStatus.id, 'success', 100);
      });

      onUploadSuccess(response.data.files);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upload failed';
      filesWithStatus.forEach((fileWithStatus) => {
        updateFileStatus(fileWithStatus.id, 'error', 0, errorMessage);
      });
      onError(errorMessage);
    }
  };

  const updateFileStatus = (fileId, status, progress, error = null) => {
    setUploadingFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status, progress, error }
          : f
      )
    );
  };

  const removeFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const { errors } = rejection;
        errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            onError('File is too large. Maximum size is 50MB.');
          } else {
            onError(`File rejected: ${error.message}`);
          }
        });
      });
    }
  });

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <Upload className="upload-icon" />
          <h3 className="upload-title">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
          </h3>
          <p className="upload-subtitle">
            or <span className="browse-text">browse files</span>
          </p>
          <div className="upload-info">
            <p>Maximum file size: 50MB</p>
            <p>Multiple files supported</p>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="upload-progress-container">
          <h4 className="progress-title">Uploading Files</h4>
          <div className="upload-progress-list">
            {uploadingFiles.map((fileWithStatus) => (
              <div key={fileWithStatus.id} className="upload-progress-item">
                <div className="file-info">
                  <File className="file-icon" />
                  <div className="file-details">
                    <span className="file-name">{fileWithStatus.file.name}</span>
                    <span className="file-size">{formatFileSize(fileWithStatus.file.size)}</span>
                  </div>
                </div>

                <div className="upload-status">
                  {fileWithStatus.status === 'pending' && (
                    <span className="status-text">Waiting...</span>
                  )}
                  
                  {fileWithStatus.status === 'uploading' && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${fileWithStatus.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{fileWithStatus.progress}%</span>
                    </div>
                  )}

                  {fileWithStatus.status === 'success' && (
                    <div className="status-success">
                      <CheckCircle className="status-icon" />
                      <span className="status-text">Success</span>
                    </div>
                  )}

                  {fileWithStatus.status === 'error' && (
                    <div className="status-error">
                      <AlertCircle className="status-icon" />
                      <span className="status-text">{fileWithStatus.error}</span>
                    </div>
                  )}
                </div>

                {fileWithStatus.status !== 'uploading' && (
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(fileWithStatus.id)}
                    aria-label="Remove file"
                  >
                    <X className="remove-icon" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;