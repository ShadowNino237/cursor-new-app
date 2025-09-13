// File Upload App JavaScript
class FileUploadApp {
    constructor() {
        this.files = [];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.allowedTypes = ['*/*']; // Allow all file types
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredFiles();
        this.updateFilesDisplay();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const closeModal = document.getElementById('closeModal');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        uploadArea.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Action buttons
        clearAllBtn.addEventListener('click', () => this.clearAllFiles());
        refreshBtn.addEventListener('click', () => this.refreshFiles());

        // Modal close
        closeModal.addEventListener('click', () => this.closeModal());
        document.getElementById('fileModal').addEventListener('click', (e) => {
            if (e.target.id === 'fileModal') this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
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
        
        if (validFiles.length === 0) {
            this.showToast('No valid files selected', 'warning');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showToast(`${files.length - validFiles.length} files were skipped due to size limits`, 'warning');
        }

        this.uploadFiles(validFiles);
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            this.showToast(`File "${file.name}" is too large (max 100MB)`, 'error');
            return false;
        }
        return true;
    }

    async uploadFiles(files) {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressContainer.style.display = 'flex';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            try {
                await this.uploadSingleFile(file);
            } catch (error) {
                console.error('Upload error:', error);
                this.showToast(`Failed to upload "${file.name}"`, 'error');
            }
        }
        
        // Hide progress after a delay
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }, 1000);
        
        this.showToast(`Successfully uploaded ${files.length} file(s)`, 'success');
        this.updateFilesDisplay();
    }

    async uploadSingleFile(file) {
        return new Promise((resolve, reject) => {
            // Simulate upload delay
            setTimeout(() => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    size: file.size,
                    type: this.getFileType(file.type),
                    uploadDate: new Date().toISOString(),
                    data: this.fileToBase64(file)
                };
                
                this.files.push(fileData);
                this.saveFilesToStorage();
                resolve(fileData);
            }, Math.random() * 1000 + 500); // Random delay between 500ms and 1.5s
        });
    }

    fileToBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
        return 'other';
    }

    getFileIcon(type) {
        const icons = {
            image: 'fas fa-image',
            video: 'fas fa-video',
            audio: 'fas fa-music',
            document: 'fas fa-file-alt',
            archive: 'fas fa-file-archive',
            other: 'fas fa-file'
        };
        return icons[type] || icons.other;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateFilesDisplay() {
        const filesGrid = document.getElementById('filesGrid');
        const noFiles = document.getElementById('noFiles');
        
        if (this.files.length === 0) {
            noFiles.style.display = 'block';
            return;
        }
        
        noFiles.style.display = 'none';
        
        filesGrid.innerHTML = this.files.map(file => `
            <div class="file-card" data-type="${file.type}" onclick="app.showFileDetails('${file.id}')">
                <i class="${this.getFileIcon(file.type)} file-icon"></i>
                <div class="file-name" title="${file.name}">${this.truncateFileName(file.name)}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
                <div class="file-actions-card">
                    <button class="file-action-btn" onclick="event.stopPropagation(); app.downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn" onclick="event.stopPropagation(); app.showFileDetails('${file.id}')" title="View Details">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="file-action-btn" onclick="event.stopPropagation(); app.deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    truncateFileName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        const extension = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
        return `${truncatedName}...${extension}`;
    }

    showFileDetails(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const modal = document.getElementById('fileModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = file.name;
        
        const uploadDate = new Date(file.uploadDate).toLocaleString();
        
        modalBody.innerHTML = `
            <div class="file-details">
                <div class="detail-item">
                    <strong>Name:</strong> ${file.name}
                </div>
                <div class="detail-item">
                    <strong>Size:</strong> ${this.formatFileSize(file.size)}
                </div>
                <div class="detail-item">
                    <strong>Type:</strong> ${file.type}
                </div>
                <div class="detail-item">
                    <strong>Uploaded:</strong> ${uploadDate}
                </div>
                ${file.type === 'image' ? `
                    <div class="detail-item">
                        <strong>Preview:</strong>
                        <div class="image-preview">
                            <img src="${file.data}" alt="${file.name}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 10px;">
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="upload-btn" onclick="app.downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn" onclick="app.deleteFile('${file.id}'); app.closeModal();" style="background: #dc3545; color: white;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        modal.style.display = 'block';
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`Downloaded "${file.name}"`, 'success');
    }

    deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        this.files = this.files.filter(f => f.id !== fileId);
        this.saveFilesToStorage();
        this.updateFilesDisplay();
        this.showToast('File deleted successfully', 'success');
    }

    clearAllFiles() {
        if (this.files.length === 0) {
            this.showToast('No files to clear', 'warning');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete all ${this.files.length} files?`)) return;
        
        this.files = [];
        this.saveFilesToStorage();
        this.updateFilesDisplay();
        this.showToast('All files cleared', 'success');
    }

    refreshFiles() {
        this.loadStoredFiles();
        this.updateFilesDisplay();
        this.showToast('Files refreshed', 'success');
    }

    closeModal() {
        document.getElementById('fileModal').style.display = 'none';
    }

    saveFilesToStorage() {
        try {
            localStorage.setItem('uploadedFiles', JSON.stringify(this.files));
        } catch (error) {
            console.error('Error saving files to storage:', error);
            this.showToast('Error saving files to storage', 'error');
        }
    }

    loadStoredFiles() {
        try {
            const stored = localStorage.getItem('uploadedFiles');
            if (stored) {
                this.files = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading files from storage:', error);
            this.showToast('Error loading files from storage', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-exclamation-triangle';
        
        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FileUploadApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}