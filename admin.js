// ============================
// Admin Panel JS
// ============================

class AdminPanel {
    constructor() {
        this.uploadBox = document.getElementById('uploadBox');
        this.videoFile = document.getElementById('videoFile');
        this.uploadForm = document.getElementById('uploadForm');
        this.productsList = document.getElementById('productsList');
        this.alertBox = document.getElementById('alertBox');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.selectedFilesList = document.getElementById('selectedFilesList');
        this.filesListContent = document.getElementById('filesListContent');
        this.selectedFilesCount = document.getElementById('selectedFilesCount');
        
        this.selectedFiles = [];
        
        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupFormSubmit();
        this.setupClearButton();
        this.loadProducts();
        
        console.log('✅ Admin Panel initialized');
    }

    // ============================
    // Drag & Drop
    // ============================
    setupDragDrop() {
        this.uploadBox.addEventListener('click', () => {
            this.videoFile.click();
        });

        this.videoFile.addEventListener('change', (e) => {
            this.handleMultipleFiles(Array.from(e.target.files));
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, () => {
                this.uploadBox.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, () => {
                this.uploadBox.classList.remove('dragover');
            });
        });

        this.uploadBox.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
            if (files.length > 0) {
                this.handleMultipleFiles(files);
            } else {
                this.showAlert('Please select valid video files (MP4)', 'error');
            }
        });
    }

    handleMultipleFiles(files) {
        if (files.length === 0) return;
        
        this.selectedFiles = files;
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        // Update upload box
        this.uploadBox.innerHTML = `
            <div class="upload-icon">✅</div>
            <p><strong>${files.length} video${files.length > 1 ? 's' : ''} selected</strong></p>
            <small>Total: ${totalSizeMB} MB</small>
        `;
        
        // Show files list
        this.selectedFilesList.style.display = 'block';
        this.selectedFilesCount.textContent = files.length;
        this.filesListContent.innerHTML = files.map((file, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 5px; margin-bottom: 5px; font-size: 13px;">
                <span>📹 ${file.name}</span>
                <span style="color: #999;">${(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
        `).join('');
    }
    
    setupClearButton() {
        document.getElementById('clearFilesBtn').addEventListener('click', () => {
            this.selectedFiles = [];
            this.videoFile.value = '';
            this.selectedFilesList.style.display = 'none';
            this.resetUploadBox();
        });
    }

    // ============================
    // Form Submit (Bulk Upload)
    // ============================
    setupFormSubmit() {
        this.uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.selectedFiles.length === 0) {
                this.showAlert('⚠️ Please select at least one video', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            
            // Get form data
            const title = document.getElementById('productTitle').value;
            const description = document.getElementById('productDescription').value;
            const price = document.getElementById('productPrice').value;
            const link = document.getElementById('productLink').value;

            try {
                this.progressBar.classList.add('show');
                let successCount = 0;
                let failCount = 0;
                
                // Upload each file sequentially
                for (let i = 0; i < this.selectedFiles.length; i++) {
                    const file = this.selectedFiles[i];
                    const progress = ((i + 1) / this.selectedFiles.length) * 100;
                    
                    submitBtn.textContent = `⏳ Uploading ${i + 1}/${this.selectedFiles.length}...`;
                    this.progressFill.style.width = `${progress}%`;
                    
                    const formData = new FormData();
                    formData.append('video', file);
                    formData.append('title', title);
                    formData.append('description', description);
                    formData.append('price', price);
                    formData.append('link', link);
                    formData.append('descriptionPosition', 'bottom');

                    try {
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        failCount++;
                        console.error(`Failed to upload ${file.name}:`, error);
                    }
                }
                
                // Show results
                if (successCount > 0) {
                    this.showAlert(`✅ Successfully uploaded ${successCount} product(s)!`, 'success');
                    this.uploadForm.reset();
                    this.resetUploadBox();
                    this.selectedFiles = [];
                    this.selectedFilesList.style.display = 'none';
                    this.loadProducts();
                }
                
                if (failCount > 0) {
                    this.showAlert(`⚠️ ${failCount} product(s) failed to upload`, 'error');
                }
                
                setTimeout(() => {
                    this.progressBar.classList.remove('show');
                    this.progressFill.style.width = '0%';
                }, 1000);
            } catch (error) {
                console.error('Upload error:', error);
                this.showAlert('❌ Error: ' + error.message, 'error');
                this.progressBar.classList.remove('show');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    resetUploadBox() {
        this.uploadBox.innerHTML = `
            <div class="upload-icon">🎥</div>
            <p><strong>Drag and drop videos here</strong></p>
            <p>or</p>
            <small>Click to select files (MP4, 9:16) - Multiple files supported</small>
        `;
    }

    // ============================
    // Load Products
    // ============================
    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            
            document.getElementById('productCount').textContent = products.length;
            
            if (products.length === 0) {
                this.productsList.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <p>No products yet</p>
                        <small>Upload your first product!</small>
                    </div>
                `;
            } else {
                this.productsList.innerHTML = products.map((product, index) => `
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-header">
                            <div class="product-info">
                                <h3>${product.title}</h3>
                                <div class="product-price">${product.price}</div>
                            </div>
                            <div class="product-actions">
                                <button class="btn-icon btn-edit" onclick="admin.editProduct('${product.id}')" title="ערוך">
                                    ✏️
                                </button>
                                <button class="btn-icon btn-delete" onclick="admin.deleteProduct('${product.id}')" title="מחק">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <p class="product-description">${product.description}</p>
                        <a href="${product.videoUrl}" class="product-video-link" target="_blank">
                            📹 ${product.videoUrl}
                        </a>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Load products error:', error);
            this.showAlert('Error loading products', 'error');
        }
    }

    // ============================
    // Delete Product
    // ============================
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('✅ Product deleted successfully', 'success');
                this.loadProducts();
            } else {
                throw new Error('Delete error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert('❌ Error deleting product', 'error');
        }
    }

    // ============================
    // Edit Product (Placeholder)
    // ============================
    editProduct(productId) {
        this.showAlert('ℹ️ Edit feature coming soon', 'success');
    }

    // ============================
    // Alert
    // ============================
    showAlert(message, type = 'success') {
        this.alertBox.textContent = message;
        this.alertBox.className = `alert ${type} show`;
        
        setTimeout(() => {
            this.alertBox.classList.remove('show');
        }, 5000);
    }
}

// ============================
// Initialize
// ============================
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminPanel();
});



