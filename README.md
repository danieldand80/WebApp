# 🎬 Liron Video Shopping App

A Tinder-style video shopping application with Hebrew (RTL) support.

## ✨ Features

- 📱 **Vertical Videos** - 9:16 format (TikTok/Instagram Reels style)
- ❤️ **Swipe Right** - Like & Save to favorites
- 👎 **Swipe Left** - Dislike & Skip to next
- 🛒 **Product Details** - Title, description, and price in Hebrew
- 🔐 **Protected Admin Panel** - Password-protected (Liron3214)
- 📤 **Video Upload** - Admin can upload products via web interface
- 💾 **Favorites** - LocalStorage-based favorites system
- 🇮🇱 **Hebrew RTL Support** - Full right-to-left language support
- 📱 **Mobile-First** - Optimized for mobile devices

## 🚀 Quick Start

### Installation

```bash
npm install
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
- 📤 Upload videos (MP4, up to 100MB)
- ✏️ Add new products
- 🗑️ Delete products
- 📊 View all products
- 🚪 Logout button

## 🎥 Video Requirements

- **Format:** MP4 (H.264 codec)
- **Aspect Ratio:** 9:16 (vertical/portrait)
- **Max Size:** 100MB
- **Duration:** 15-60 seconds recommended
- **Resolution:** 1080x1920 (Full HD) or 720x1280 (HD)

## 📱 User Controls

### Mobile (Touch):
- 👉 **Swipe RIGHT** → ❤️ Like (save to favorites)
- 👈 **Swipe LEFT** → 👎 Dislike (skip)
- **Tap video** → Play/Pause
- **Tap ❤️ button** → View favorites

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
└── videos/             # Uploaded product videos
```

## 🌐 Deploy to Render.com

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
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

3. **Deploy!**
   - Click **"Create Web Service"**
   - Wait ~5 minutes
   - Done! 🎉

Your app will be live at: `https://your-app-name.onrender.com`

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **File Upload:** Multer
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Styling:** CSS3 with RTL support
- **Video:** HTML5 Video API
- **Database:** JSON file (products.json)
- **Session:** SessionStorage (admin auth)

## 🔧 Environment Variables

For production deployment:

```env
PORT=3000
NODE_ENV=production
```

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

### Manually
Add to `products.json`:
```json
{
  "id": "product_123456789",
  "title": "Product Name",
  "description": "Product description",
  "price": "₪299",
  "link": "https://example.com/buy",
  "videoUrl": "videos/product123456789.mp4",
  "videoFileName": "product123456789.mp4",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Videos not playing
- Check video format (must be MP4)
- Check file size (max 100MB)
- Check browser console for errors

### Admin panel not accessible
- Clear browser cache
- Check session storage
- Try incognito mode

### Upload fails
- Check video size (max 100MB)
- Check available disk space
- Check `videos/` folder permissions

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
