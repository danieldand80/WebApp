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
        
        this.selectedFiles = Array.from(files);
        const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        // Update upload box
        this.uploadBox.innerHTML = `
            <div class="upload-icon">✅</div>
            <p><strong>${files.length} video${files.length > 1 ? 's' : ''} selected</strong></p>
            <small>Total: ${totalSizeMB} MB</small>
        `;
        
        // Show files list with individual input fields
        this.selectedFilesList.style.display = 'block';
        this.selectedFilesCount.textContent = files.length;
        this.filesListContent.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="file-card" style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <div>
                        <strong style="color: #667eea;">Video ${index + 1}</strong>
                        <div style="font-size: 13px; color: #999; margin-top: 3px;">📹 ${file.name}</div>
                    </div>
                    <span style="background: #f0f2ff; color: #667eea; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 6px; font-size: 13px;">🏷️ Product Name</label>
                    <input type="text" 
                           class="product-field" 
                           data-index="${index}" 
                           data-field="title" 
                           placeholder="Example: Home Ice Cream Maker" 
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;"
                           required>
                </div>
                
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 6px; font-size: 13px;">📝 Description</label>
                    <textarea class="product-field" 
                              data-index="${index}" 
                              data-field="description" 
                              placeholder="Describe the product..." 
                              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; min-height: 70px; resize: vertical;"
                              required></textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group">
                        <label style="display: block; color: #333; font-weight: 600; margin-bottom: 6px; font-size: 13px;">💰 Price</label>
                        <input type="text" 
                               class="product-field" 
                               data-index="${index}" 
                               data-field="price" 
                               placeholder="$299" 
                               style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; color: #333; font-weight: 600; margin-bottom: 6px; font-size: 13px;">🔗 Link</label>
                        <input type="url" 
                               class="product-field" 
                               data-index="${index}" 
                               data-field="link" 
                               placeholder="https://..." 
                               style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;"
                               required>
                    </div>
                </div>
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
    // Form Submit (Bulk Upload with Individual Data)
    // ============================
    setupFormSubmit() {
        this.uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.selectedFiles.length === 0) {
                this.showAlert('⚠️ Please select at least one video', 'error');
                return;
            }
            
            // Collect data for each product
            const productsData = [];
            let hasEmptyFields = false;
            
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const titleInput = document.querySelector(`input[data-index="${i}"][data-field="title"]`);
                const descInput = document.querySelector(`textarea[data-index="${i}"][data-field="description"]`);
                const priceInput = document.querySelector(`input[data-index="${i}"][data-field="price"]`);
                const linkInput = document.querySelector(`input[data-index="${i}"][data-field="link"]`);
                
                if (!titleInput.value || !descInput.value || !priceInput.value || !linkInput.value) {
                    hasEmptyFields = true;
                    // Highlight empty card
                    titleInput.closest('.file-card').style.border = '2px solid #ff4757';
                    setTimeout(() => {
                        titleInput.closest('.file-card').style.border = '2px solid #e0e0e0';
                    }, 2000);
                    break;
                }
                
                productsData.push({
                    file: this.selectedFiles[i],
                    title: titleInput.value,
                    description: descInput.value,
                    price: priceInput.value,
                    link: linkInput.value
                });
            }
            
            if (hasEmptyFields) {
                this.showAlert('⚠️ Please fill in all fields for each product', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;

            try {
                this.progressBar.classList.add('show');
                let successCount = 0;
                let failCount = 0;
                
                // Upload each file with its individual data
                for (let i = 0; i < productsData.length; i++) {
                    const productData = productsData[i];
                    const progress = ((i + 1) / productsData.length) * 100;
                    
                    submitBtn.textContent = `⏳ Uploading ${i + 1}/${productsData.length}...`;
                    this.progressFill.style.width = `${progress}%`;
                    
                    const formData = new FormData();
                    formData.append('video', productData.file);
                    formData.append('title', productData.title);
                    formData.append('description', productData.description);
                    formData.append('price', productData.price);
                    formData.append('link', productData.link);
                    formData.append('descriptionPosition', 'bottom');

                    try {
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            successCount++;
                            console.log(`✅ Uploaded: ${productData.title}`);
                        } else {
                            failCount++;
                            console.error(`❌ Failed: ${productData.title}`);
                        }
                    } catch (error) {
                        failCount++;
                        console.error(`Failed to upload ${productData.file.name}:`, error);
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



