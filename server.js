// ============================
// Node.js Server for Admin Panel
// ============================

require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dsnytix1u',
    api_key: process.env.CLOUDINARY_API_KEY || '765373694661392',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());

// Session/Auth check middleware
function checkAuth(req, res, next) {
    const auth = req.headers['x-admin-auth'];
    if (auth === 'true') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Static files
app.use(express.static(__dirname));

// Configure multer for video uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4 videos are allowed.'));
        }
    }
});

// Products data file
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const CLOUDINARY_PRODUCTS_ID = 'database/products.json';

// Upload products.json to Cloudinary
async function uploadProductsToCloudinary(products) {
    try {
        console.log(`📤 Preparing to upload ${products.length} products to Cloudinary...`);
        const jsonString = JSON.stringify(products, null, 2);
        const jsonSize = Buffer.from(jsonString).length;
        console.log(`📦 JSON size: ${(jsonSize / 1024).toFixed(2)} KB`);
        
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    public_id: CLOUDINARY_PRODUCTS_ID,
                    overwrite: true,
                    invalidate: true // Clear CDN cache
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Failed to upload products.json to Cloudinary:', error.message);
                        console.error('Error details:', error);
                        reject(error);
                    } else {
                        console.log('✅ Products.json uploaded to Cloudinary successfully!');
                        console.log(`📍 URL: ${result.secure_url}`);
                        console.log(`🆔 Public ID: ${result.public_id}`);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(Buffer.from(jsonString));
        });
    } catch (error) {
        console.error('❌ Cloudinary sync error:', error);
        throw error;
    }
}

// Download products.json from Cloudinary
async function downloadProductsFromCloudinary() {
    try {
        const https = require('https');
        const url = cloudinary.url(CLOUDINARY_PRODUCTS_ID, { resource_type: 'raw' });
        
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    let data = '';
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        try {
                            const products = JSON.parse(data);
                            console.log(`☁️ Loaded ${products.length} products from Cloudinary`);
                            resolve(products);
                        } catch (e) {
                            console.log('📝 No products.json in Cloudinary yet');
                            resolve([]);
                        }
                    });
                } else if (response.statusCode === 404) {
                    console.log('📝 No products.json in Cloudinary yet (404)');
                    resolve([]);
                } else {
                    console.log(`📝 Cloudinary response: ${response.statusCode}`);
                    resolve([]);
                }
            }).on('error', (error) => {
                console.log('📝 No products.json in Cloudinary yet (first run)');
                resolve([]);
            });
        });
    } catch (error) {
        console.log('📝 No products.json in Cloudinary yet (error)');
        return [];
    }
}

// Initialize products file - Cloudinary is the single source of truth
async function initProductsFile() {
    try {
        console.log('🔄 Initializing products from Cloudinary (single source of truth)...');
        
        // Always load from Cloudinary first
        const cloudProducts = await downloadProductsFromCloudinary();
        console.log(`☁️ Cloudinary has ${cloudProducts.length} products`);
        
        if (cloudProducts.length > 0) {
            // Save cloud data locally for this session
            await fs.writeFile(PRODUCTS_FILE, JSON.stringify(cloudProducts, null, 2));
            console.log(`✅ Loaded ${cloudProducts.length} products from Cloudinary`);
        } else {
            // No data in cloud - create empty file
            await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
            console.log('📝 No products in Cloudinary - starting fresh');
        }
    } catch (error) {
        console.error('❌ Init error:', error);
        // Try to create empty file
        try {
            await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
            console.log('⚠️ Created empty products.json as fallback');
        } catch (e) {
            console.error('❌ Cannot create products.json:', e);
        }
    }
}

// Read products
async function readProducts() {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading products:', error);
        return [];
    }
}

// Write products - save both locally and to Cloudinary (auto-sync)
async function writeProducts(products) {
    try {
        // Save locally first
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log(`💾 Saved ${products.length} products locally`);
        
        // Immediately sync to Cloudinary (single source of truth)
        console.log(`☁️ Syncing ${products.length} products to Cloudinary...`);
        const result = await uploadProductsToCloudinary(products);
        console.log(`✅ Successfully synced to Cloudinary:`, result?.secure_url || 'uploaded');
        
        // Verify the upload
        const verification = await downloadProductsFromCloudinary();
        console.log(`🔍 Verification: Cloudinary now has ${verification.length} products`);
        
        if (verification.length !== products.length) {
            console.error(`⚠️ SYNC MISMATCH! Local: ${products.length}, Cloudinary: ${verification.length}`);
        }
    } catch (error) {
        console.error('❌ Error saving products:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

// ============================
// Routes
// ============================

// Main page - redirect root to index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin login page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin panel (protected)
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ============================
// API Routes
// ============================

// Get all products (public)
app.get('/api/products', async (req, res) => {
    try {
        const products = await readProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});


// Upload new product
app.post('/api/upload', upload.single('video'), async (req, res) => {
    console.log('🎬 Upload request received!');
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE');
    console.log('Body:', req.body);
    
    try {
        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const { title, description, price, link, descriptionPosition } = req.body;

        if (!title || !description || !price || !link) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        console.log('📤 Uploading video to Cloudinary...');

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder: 'products',
                public_id: `product_${Date.now()}`
            },
            async (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', JSON.stringify(error, null, 2));
                    console.error('Error details:', error.message || error);
                    return res.status(500).json({ error: 'Failed to upload video to cloud', details: error.message });
                }

                try {
                    const products = await readProducts();
                    
                    const newProduct = {
                        id: `product_${Date.now()}`,
                        title,
                        description,
                        price,
                        link,
                        descriptionPosition: descriptionPosition || 'bottom',
                        videoUrl: result.secure_url,
                        videoPublicId: result.public_id,
                        createdAt: new Date().toISOString()
                    };

                    products.push(newProduct);
                    await writeProducts(products);

                    console.log(`✅ Product uploaded: ${title}`);
                    res.json({ success: true, product: newProduct });
                } catch (err) {
                    console.error('❌ Database error:', err);
                    res.status(500).json({ error: 'Failed to save product' });
                }
            }
        );

        // Pipe the buffer to Cloudinary
        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const products = await readProducts();
        
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[productIndex];
        console.log(`🗑️ Deleting product: ${product.title}`);
        console.log(`🗑️ Video public ID: ${product.videoPublicId}`);
        
        // Delete video from Cloudinary FIRST
        if (product.videoPublicId) {
            try {
                const deleteResult = await cloudinary.uploader.destroy(product.videoPublicId, { 
                    resource_type: 'video',
                    invalidate: true
                });
                console.log(`✅ Cloudinary delete result:`, deleteResult);
                
                if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
                    console.log(`✅ Video deleted from Cloudinary: ${product.videoPublicId}`);
                } else {
                    console.warn(`⚠️ Unexpected delete result: ${deleteResult.result}`);
                }
            } catch (error) {
                console.error('❌ Failed to delete video from Cloudinary:', error);
                // Continue anyway to delete from database
            }
        } else {
            console.warn('⚠️ No videoPublicId found for product');
        }

        // Remove from products array
        products.splice(productIndex, 1);
        console.log(`💾 Updating products list (${products.length} remaining)`);
        
        // Save and sync to Cloudinary
        await writeProducts(products);

        console.log(`✅ Product deleted successfully: ${product.title}`);
        res.json({ success: true, message: 'Product and video deleted' });
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
});

// Update product (edit)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, link } = req.body;
        
        const products = await readProducts();
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        products[productIndex] = {
            ...products[productIndex],
            title: title || products[productIndex].title,
            description: description || products[productIndex].description,
            price: price || products[productIndex].price,
            link: link || products[productIndex].link,
            updatedAt: new Date().toISOString()
        };

        await writeProducts(products);
        res.json({ success: true, product: products[productIndex] });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ============================
// Start Server
// ============================
async function startServer() {
    await initProductsFile();
    
    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════╗');
        console.log('║  🚀 Server Running                     ║');
        console.log('╠════════════════════════════════════════╣');
        console.log(`║  Main Site:   http://localhost:${PORT}/            ║`);
        console.log(`║  Admin:       http://localhost:${PORT}/admin       ║`);
        console.log(`║  Password:    Liron3214                ║`);
        console.log('╚════════════════════════════════════════╝');
        console.log('');
    });
}

startServer().catch(console.error);


