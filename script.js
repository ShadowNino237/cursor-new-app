// File Upload App JavaScript
class FileUploadApp {
    constructor() {
        this.uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['*/*']; // Allow all file types
        
        this.initializeElements();
        this.bindEvents();
        this.renderFiles();
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
        this.refreshBtn.addEventListener('click', () => this.renderFiles());
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
        
        validFiles.forEach(file => this.uploadFile(file));
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
            return false;
        }
        return true;
    }

    async uploadFile(file) {
        const fileId = this.generateFileId();
        const fileData = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            date: new Date().toISOString(),
            data: await this.fileToBase64(file)
        };

        this.showProgress();
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await this.delay(100);
            this.updateProgress(i);
        }

        this.uploadedFiles.push(fileData);
        this.saveFiles();
        this.renderFiles();
        this.hideProgress();
        
        this.showNotification(`File "${file.name}" uploaded successfully!`, 'success');
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    generateFileId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showProgress() {
        this.uploadProgress.style.display = 'flex';
        this.updateProgress(0);
    }

    hideProgress() {
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
        }, 1000);
    }

    updateProgress(percent) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}%`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        const fileIcon = this.getFileIcon(file.type);
        const fileSize = this.formatFileSize(file.size);
        const fileDate = this.formatDate(file.date);
        
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
                <div class="file-name" title="${file.name}">${file.name}</div>
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
        this.modalTitle.textContent = file.name;
        
        let previewContent = '';
        
        if (file.type.startsWith('image/')) {
            previewContent = `<img src="${file.data}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px;">`;
        } else if (file.type.startsWith('video/')) {
            previewContent = `<video controls style="max-width: 100%; height: auto; border-radius: 8px;">
                <source src="${file.data}" type="${file.type}">
                Your browser does not support the video tag.
            </video>`;
        } else if (file.type.startsWith('audio/')) {
            previewContent = `<audio controls style="width: 100%;">
                <source src="${file.data}" type="${file.type}">
                Your browser does not support the audio element.
            </audio>`;
        } else if (file.type === 'application/pdf') {
            previewContent = `<iframe src="${file.data}" style="width: 100%; height: 400px; border: none; border-radius: 8px;"></iframe>`;
        } else if (file.type.startsWith('text/')) {
            // For text files, we'll show a simple preview
            const textContent = atob(file.data.split(',')[1]);
            previewContent = `<pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 300px;">${this.escapeHtml(textContent.substring(0, 1000))}${textContent.length > 1000 ? '\n...' : ''}</pre>`;
        } else {
            previewContent = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-file" style="font-size: 4rem; color: #6c757d; margin-bottom: 20px;"></i>
                    <h4>File Preview Not Available</h4>
                    <p>This file type cannot be previewed in the browser.</p>
                    <p><strong>File Size:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>File Type:</strong> ${file.type || 'Unknown'}</p>
                </div>
            `;
        }
        
        this.modalBody.innerHTML = previewContent;
        this.previewModal.style.display = 'block';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeModalWindow() {
        this.previewModal.style.display = 'none';
        this.currentFile = null;
    }

    downloadFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        const blob = this.base64ToBlob(file.data, file.type);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadCurrentFile() {
        if (this.currentFile) {
            this.downloadFile(this.currentFile.id);
        }
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
            this.saveFiles();
            this.renderFiles();
            this.showNotification('File deleted successfully!', 'success');
        }
    }

    deleteCurrentFile() {
        if (this.currentFile) {
            this.deleteFile(this.currentFile.id);
            this.closeModalWindow();
        }
    }

    clearAllFiles() {
        if (this.uploadedFiles.length === 0) return;
        
        if (confirm('Are you sure you want to delete all files? This action cannot be undone.')) {
            this.uploadedFiles = [];
            this.saveFiles();
            this.renderFiles();
            this.showNotification('All files deleted successfully!', 'success');
        }
    }

    saveFiles() {
        localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
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
    new FileUploadApp();
});

// Add some additional utility functions
window.addEventListener('beforeunload', () => {
    // Clean up any temporary URLs
    const links = document.querySelectorAll('a[href^="blob:"]');
    links.forEach(link => {
        URL.revokeObjectURL(link.href);
    });
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, true);
}