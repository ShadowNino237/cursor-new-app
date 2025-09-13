// File Upload App JavaScript with Server Integration
class FileUploadAppServer {
    constructor() {
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.apiBaseUrl = '/api';
        
        this.initializeElements();
        this.bindEvents();
        this.loadFiles();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Files elements
        this.filesGrid = document.getElementById('filesGrid');
        this.noFiles = document.getElementById('noFiles');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Modal elements
        this.previewModal = document.getElementById('previewModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.closeModal = document.getElementById('closeModal');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
    }

    bindEvents() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // File management events
        this.refreshBtn.addEventListener('click', () => this.loadFiles());
        this.clearAllBtn.addEventListener('click', () => this.clearAllFiles());
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.closeModalWindow());
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) this.closeModalWindow();
        });
        this.downloadBtn.addEventListener('click', () => this.downloadCurrentFile());
        this.deleteBtn.addEventListener('click', () => this.deleteCurrentFile());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModalWindow();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
        e.target.value = ''; // Reset input
    }

    processFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;
        
        if (validFiles.length === 1) {
            this.uploadSingleFile(validFiles[0]);
        } else {
            this.uploadMultipleFiles(validFiles);
        }
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
            return false;
        }
        return true;
    }

    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        this.showProgress();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`File "${file.name}" uploaded successfully!`, 'success');
                this.loadFiles();
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Failed to upload "${file.name}": ${error.message}`, 'error');
        } finally {
            this.hideProgress();
        }
    }

    async uploadMultipleFiles(files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        this.showProgress();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/upload-multiple`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${files.length} files uploaded successfully!`, 'success');
                this.loadFiles();
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Failed to upload files: ${error.message}`, 'error');
        } finally {
            this.hideProgress();
        }
    }

    async loadFiles() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/files`);
            const result = await response.json();
            
            if (result.success) {
                this.uploadedFiles = result.files;
                this.renderFiles();
            } else {
                throw new Error(result.error || 'Failed to load files');
            }
        } catch (error) {
            console.error('Load files error:', error);
            this.showNotification('Failed to load files', 'error');
        }
    }

    showProgress() {
        this.uploadProgress.style.display = 'flex';
        this.updateProgress(0);
        
        // Simulate progress for better UX
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            this.updateProgress(Math.floor(progress));
        }, 200);
        
        // Store interval ID to clear it later
        this.progressInterval = interval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.updateProgress(100);
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
        }, 1000);
    }

    updateProgress(percent) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}%`;
    }

    renderFiles() {
        if (this.uploadedFiles.length === 0) {
            this.filesGrid.innerHTML = `
                <div class="no-files" id="noFiles">
                    <i class="fas fa-folder-open"></i>
                    <p>No files uploaded yet</p>
                    <p>Upload your first file to get started!</p>
                </div>
            `;
            return;
        }

        this.filesGrid.innerHTML = this.uploadedFiles.map(file => this.createFileCard(file)).join('');
        
        // Bind events to file cards
        this.filesGrid.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions-card')) {
                    const fileId = card.dataset.fileId;
                    this.showFilePreview(fileId);
                }
            });
        });

        // Bind delete events
        this.filesGrid.querySelectorAll('.file-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = btn.closest('.file-card').dataset.fileId;
                this.deleteFile(fileId);
            });
        });

        // Bind download events
        this.filesGrid.querySelectorAll('.file-action-btn.download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = btn.closest('.file-card').dataset.fileId;
                this.downloadFile(fileId);
            });
        });
    }

    createFileCard(file) {
        const fileIcon = this.getFileIcon(file.mimetype);
        const fileSize = this.formatFileSize(file.size);
        const fileDate = this.formatDate(file.uploadDate);
        
        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-actions-card">
                    <button class="file-action-btn download" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="file-icon ${fileIcon.class}">
                    <i class="${fileIcon.icon}"></i>
                </div>
                <div class="file-name" title="${file.originalName}">${file.originalName}</div>
                <div class="file-size">${fileSize}</div>
                <div class="file-date">${fileDate}</div>
            </div>
        `;
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return { icon: 'fas fa-image', class: 'image' };
        } else if (mimeType.startsWith('video/')) {
            return { icon: 'fas fa-video', class: 'video' };
        } else if (mimeType.startsWith('audio/')) {
            return { icon: 'fas fa-music', class: 'audio' };
        } else if (mimeType === 'application/pdf') {
            return { icon: 'fas fa-file-pdf', class: 'pdf' };
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return { icon: 'fas fa-file-word', class: 'document' };
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return { icon: 'fas fa-file-excel', class: 'document' };
        } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
            return { icon: 'fas fa-file-powerpoint', class: 'document' };
        } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
            return { icon: 'fas fa-file-archive', class: 'archive' };
        } else if (mimeType.includes('text/') || mimeType.includes('javascript') || mimeType.includes('json')) {
            return { icon: 'fas fa-file-code', class: 'code' };
        } else {
            return { icon: 'fas fa-file', class: 'default' };
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showFilePreview(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        this.currentFile = file;
        this.modalTitle.textContent = file.originalName;
        
        let previewContent = '';
        
        if (file.mimetype.startsWith('image/')) {
            previewContent = `<img src="${this.apiBaseUrl}/download/${file.id}" alt="${file.originalName}" style="max-width: 100%; height: auto; border-radius: 8px;">`;
        } else if (file.mimetype.startsWith('video/')) {
            previewContent = `<video controls style="max-width: 100%; height: auto; border-radius: 8px;">
                <source src="${this.apiBaseUrl}/download/${file.id}" type="${file.mimetype}">
                Your browser does not support the video tag.
            </video>`;
        } else if (file.mimetype.startsWith('audio/')) {
            previewContent = `<audio controls style="width: 100%;">
                <source src="${this.apiBaseUrl}/download/${file.id}" type="${file.mimetype}">
                Your browser does not support the audio element.
            </audio>`;
        } else if (file.mimetype === 'application/pdf') {
            previewContent = `<iframe src="${this.apiBaseUrl}/download/${file.id}" style="width: 100%; height: 400px; border: none; border-radius: 8px;"></iframe>`;
        } else {
            previewContent = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-file" style="font-size: 4rem; color: #6c757d; margin-bottom: 20px;"></i>
                    <h4>File Preview Not Available</h4>
                    <p>This file type cannot be previewed in the browser.</p>
                    <p><strong>File Size:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>File Type:</strong> ${file.mimetype || 'Unknown'}</p>
                </div>
            `;
        }
        
        this.modalBody.innerHTML = previewContent;
        this.previewModal.style.display = 'block';
    }

    closeModalWindow() {
        this.previewModal.style.display = 'none';
        this.currentFile = null;
    }

    downloadFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        const link = document.createElement('a');
        link.href = `${this.apiBaseUrl}/download/${file.id}`;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadCurrentFile() {
        if (this.currentFile) {
            this.downloadFile(this.currentFile.id);
        }
    }

    async deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/files/${fileId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('File deleted successfully!', 'success');
                this.loadFiles();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification(`Failed to delete file: ${error.message}`, 'error');
        }
    }

    deleteCurrentFile() {
        if (this.currentFile) {
            this.deleteFile(this.currentFile.id);
            this.closeModalWindow();
        }
    }

    async clearAllFiles() {
        if (this.uploadedFiles.length === 0) return;
        
        if (!confirm('Are you sure you want to delete all files? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/files`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('All files deleted successfully!', 'success');
                this.loadFiles();
            } else {
                throw new Error(result.error || 'Clear all failed');
            }
        } catch (error) {
            console.error('Clear all error:', error);
            this.showNotification(`Failed to clear all files: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadAppServer();
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, true);
}