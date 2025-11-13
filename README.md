# 🎬 Liron Video Shopping App

A Tinder-style video shopping application with Hebrew (RTL) support.

## ✨ Features

### Main App
- 📱 **Vertical Videos** - 9:16 format (TikTok/Instagram Reels style)
- ❤️ **Swipe Animations** - Fullscreen green/red overlay on like/dislike
- 👎 **Swipe Left** - Dislike & Skip to next
- ♾️ **Endless Loop** - Never runs out of content! Shows favorites when all videos viewed
- 🛒 **Product Details** - Title, description, price with transparent background
- 📊 **Video Progress Bar** - Real-time white progress bar at bottom
- 💾 **Favorites Grid** - 2-column grid with video previews (share, buy, delete)
- 🔊 **Volume Control** - Persistent volume across videos
- 🇮🇱 **Hebrew RTL Support** - Full right-to-left language support
- 📱 **Mobile-First** - Optimized for mobile devices

### Admin Panel
- 🔐 **Protected Access** - Password-protected (Liron3214)
- 📤 **Bulk Upload** - Upload multiple videos at once (~200 videos supported)
- ☁️ **Cloud Storage** - Videos hosted on Cloudinary CDN (fast & reliable)
- 🔄 **Auto-Sync** - Cloudinary as single source of truth
- 📦 **Drag & Drop** - Multiple files with progress tracking
- 🗑️ **Product Management** - View, edit, delete products

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configure Cloudinary

1. **Register at Cloudinary:**
   - Go to https://cloudinary.com/users/register_free
   - Get your credentials (Cloud Name, API Key, API Secret)

2. **Set environment variables:**
   - Create `.env` file in project root:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=3000
   ```

### Run Locally

```bash
npm start
```

The app will be available at: **http://localhost:3000**

## 🔗 Routes

- `/` - Main page (video shopping feed)
- `/admin` - Admin login page
- `/admin-panel` - Admin dashboard (protected)
- `/api/products` - Products API endpoint

## 🔐 Admin Access

**Password:** `Liron3214`

### Admin Features:
- 📤 **Bulk Upload** - Upload multiple videos at once (200+ supported)
- ✏️ **Add Products** - Title, description, price, purchase link
- 🗑️ **Delete Products** - Remove products and videos from Cloudinary
- 📊 **View All Products** - See all uploaded products
- 🔄 **Auto Cloud Sync** - Products automatically sync to Cloudinary
- 🚪 **Logout** - Secure session management

## 🎥 Video Requirements

- **Format:** MP4 (H.264 codec)
- **Aspect Ratio:** 9:16 (vertical/portrait)
- **Max Size:** 100MB
- **Duration:** 15-60 seconds recommended
- **Resolution:** 1080x1920 (Full HD) or 720x1280 (HD)

## 📱 User Controls

### Mobile (Touch):
- 👉 **Swipe RIGHT** → ❤️ Like with green fullscreen overlay
- 👈 **Swipe LEFT** → 👎 Dislike with red fullscreen overlay
- **Tap video** → Play/Pause
- **Tap ❤️ button** → View favorites grid (2-column with previews)
- **Volume slider** → Adjust sound (persists across videos)

### Desktop (Keyboard/Mouse):
- **→ Right Arrow** → Like
- **← Left Arrow** → Dislike
- **Space / K** → Play/Pause
- **Mouse Wheel** → Navigate (disabled)

## 📂 Project Structure

```
├── index.html          # Main shopping page
├── login.html          # Admin login page
├── admin.html          # Admin dashboard
├── style.css           # Styles (RTL support)
├── script.js           # Main app logic
├── admin.js            # Admin panel logic
├── server.js           # Node.js + Express server
├── package.json        # Dependencies
├── products.json       # Products database (JSON)
├── .env                # Environment variables (Cloudinary)
└── .env.example        # Example environment variables
```

**Note:** Videos are stored in Cloudinary cloud, not locally!

## 🌐 Deploy to Render.com

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Added Cloudinary integration"
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to https://render.com
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub repository
   - Settings:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Environment:** Node

3. **Add Environment Variables:**
   - Go to **"Environment"** tab
   - Add:
     - `CLOUDINARY_CLOUD_NAME` = dsnyttklu
     - `CLOUDINARY_API_KEY` = 765373894661392
     - `CLOUDINARY_API_SECRET` = [your secret from Cloudinary]

4. **Deploy!**
   - Click **"Create Web Service"**
   - Wait ~5 minutes
   - Done! 🎉

Your app will be live at: `https://your-app-name.onrender.com`

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **File Upload:** Multer
- **Cloud Storage:** Cloudinary (video hosting & CDN)
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Styling:** CSS3 with RTL support
- **Video:** HTML5 Video API
- **Database:** JSON file (products.json)
- **Session:** SessionStorage (admin auth)

## 🔧 Environment Variables

For production deployment (Railway/Render):

```env
# Cloudinary (REQUIRED)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=production
```

**⚠️ Important:** Set these variables on your hosting platform (Railway/Render) before deploying!

## 📊 API Endpoints

### Public
- `GET /api/products` - Get all products

### Admin (Protected)
- `POST /api/upload` - Upload new product with video
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id` - Update product (future)

## ⚙️ Configuration

### Admin Password
Change in `login.html`:
```javascript
const CORRECT_PASSWORD = 'Liron3214';
```

### Session Duration
Change in `login.html` and `admin.html`:
```javascript
const ONE_HOUR = 60 * 60 * 1000; // 1 hour
```

### Max Video Size
Change in `server.js`:
```javascript
limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
}
```

## 🎨 Customization

### Colors
Edit in `style.css`:
```css
:root {
    --primary-color: #FF385C;
    --secondary-color: #FF6B88;
}
```

### Language
All text is in Hebrew. To change language, edit:
- `index.html` - Product info text
- `admin.html` - Admin panel text
- `login.html` - Login page text

## 📝 Adding Products

### Via Admin Panel (Recommended)
1. Go to `/admin`
2. Enter password: `Liron3214`
3. Drag & drop video or click to upload
4. Fill product details (Hebrew):
   - Title
   - Description
   - Price
   - Purchase link
5. Click **"העלה מוצר"** (Upload Product)

### Manually (Not Recommended)
Add to `products.json`:
```json
{
  "id": "product_123456789",
  "title": "Product Name",
  "description": "Product description",
  "price": "₪299",
  "link": "https://example.com/buy",
  "videoUrl": "https://res.cloudinary.com/dsnyttklu/video/upload/v1234567890/products/product_123456789.mp4",
  "videoPublicId": "products/product_123456789",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Note:** Use the admin panel instead - it handles Cloudinary upload automatically!

## 🐛 Troubleshooting

### Videos not playing
- Check video format (must be MP4)
- Check file size (max 100MB)
- Check browser console for errors
- Verify Cloudinary credentials are set correctly

### Admin panel not accessible
- Clear browser cache
- Check session storage
- Try incognito mode

### Upload fails
- Check video size (max 100MB)
- Verify Cloudinary environment variables are set
- Check Cloudinary account quota (free: 25GB)
- Check browser console for errors

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Author

Created for **Liron Shop**

## 🤝 Contributing

This is a private project. For issues or questions, contact the repository owner.

---

## 📸 Screenshots

### Main Shopping Feed
- Vertical video in 9:16 format
- Like/Dislike buttons
- Product info overlay
- Hebrew RTL text

### Admin Panel
- Password-protected login
- Drag & drop video upload
- Product management
- Clean modern UI

---

**Built with ❤️ for seamless video shopping experience**
