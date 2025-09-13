import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Header from './components/Header';
import Toast from './components/Toast';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/files`);
      setFiles(response.data);
    } catch (error) {
      showToast('Failed to fetch files', 'error');
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFiles) => {
    // Add new files to the list
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
    showToast(
      `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully!`,
      'success'
    );
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/files/${fileId}`);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      showToast('File deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete file', 'error');
      console.error('Error deleting file:', error);
    }
  };

  const handleDownloadFile = async (fileId, filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/${fileId}`, {
        responseType: 'blob',
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Download started', 'success');
    } catch (error) {
      showToast('Failed to download file', 'error');
      console.error('Error downloading file:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="upload-section">
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onError={(message) => showToast(message, 'error')}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
          
          <div className="files-section">
            <FileList
              files={files}
              loading={loading}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
              onRefresh={fetchFiles}
            />
          </div>
        </div>
      </main>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;