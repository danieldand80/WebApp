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

// Initialize products file if it doesn't exist
async function initProductsFile() {
    try {
        await fs.access(PRODUCTS_FILE);
    } catch {
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
        console.log('✅ Created products.json');
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

// Write products
async function writeProducts(products) {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
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
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const { title, description, price, link } = req.body;

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
        
        // Delete video from Cloudinary
        if (product.videoPublicId) {
            try {
                await cloudinary.uploader.destroy(product.videoPublicId, { resource_type: 'video' });
                console.log(`🗑️ Deleted video from Cloudinary: ${product.videoPublicId}`);
            } catch (error) {
                console.warn('Failed to delete video from Cloudinary:', error.message);
            }
        }

        // Remove from products array
        products.splice(productIndex, 1);
        await writeProducts(products);

        console.log(`✅ Product deleted: ${product.title}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
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


