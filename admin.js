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
        
        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupFormSubmit();
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
            this.handleFileSelect(e.target.files[0]);
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
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('video/')) {
                this.videoFile.files = e.dataTransfer.files;
                this.handleFileSelect(file);
            } else {
                this.showAlert('אנא בחר קובץ וידאו תקין (MP4)', 'error');
            }
        });
    }

    handleFileSelect(file) {
        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            this.uploadBox.innerHTML = `
                <div class="upload-icon">✅</div>
                <p><strong>${fileName}</strong></p>
                <small>${fileSize} MB</small>
            `;
        }
    }

    // ============================
    // Form Submit
    // ============================
    setupFormSubmit() {
        this.uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ מעלה...';
            
            const formData = new FormData();
            formData.append('video', this.videoFile.files[0]);
            formData.append('title', document.getElementById('productTitle').value);
            formData.append('description', document.getElementById('productDescription').value);
            formData.append('price', document.getElementById('productPrice').value);
            formData.append('link', document.getElementById('productLink').value);

            try {
                this.progressBar.classList.add('show');
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    this.showAlert('✅ המוצר הועלה בהצלחה!', 'success');
                    this.uploadForm.reset();
                    this.resetUploadBox();
                    this.loadProducts();
                    this.progressFill.style.width = '100%';
                    
                    setTimeout(() => {
                        this.progressBar.classList.remove('show');
                        this.progressFill.style.width = '0%';
                    }, 1000);
                } else {
                    throw new Error(result.error || 'שגיאה בהעלאה');
                }
            } catch (error) {
                console.error('Upload error:', error);
                this.showAlert('❌ שגיאה: ' + error.message, 'error');
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
            <p><strong>גרור ושחרר וידאו כאן</strong></p>
            <p>או</p>
            <small>לחץ לבחירת קובץ (MP4, 9:16)</small>
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
                        <p>אין מוצרים עדיין</p>
                        <small>העלה את המוצר הראשון שלך!</small>
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
            this.showAlert('שגיאה בטעינת מוצרים', 'error');
        }
    }

    // ============================
    // Delete Product
    // ============================
    async deleteProduct(productId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('✅ המוצר נמחק בהצלחה', 'success');
                this.loadProducts();
            } else {
                throw new Error('שגיאה במחיקה');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert('❌ שגיאה במחיקת המוצר', 'error');
        }
    }

    // ============================
    // Edit Product (Placeholder)
    // ============================
    editProduct(productId) {
        this.showAlert('ℹ️ תכונת עריכה תתווסף בקרוב', 'success');
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



