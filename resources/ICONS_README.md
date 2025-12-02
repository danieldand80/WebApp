# 📱 App Icons & Splash Screens Setup

## Required Assets

To properly configure your mobile app icons and splash screens, you'll need:

### 1. App Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Requirements**: 
  - No rounded corners (iOS/Android will add them automatically)
  - No transparency on the edges
  - Centered design with safe area

### 2. Splash Screen (splash.png)
- **Size**: 2732x2732 pixels (for maximum compatibility)
- **Format**: PNG
- **Requirements**:
  - Centered logo/design
  - Safe area: Keep important content in center 1200x1200px
  - Background color should match `capacitor.config.json` backgroundColor

## How to Create

### Option 1: Use Existing Favicon
You can upscale your existing `Favicon.png` using:
- https://icons8.com/upscaler
- https://www.adobe.com/express/feature/image/upscale
- Photoshop/Figma with proper export settings

### Option 2: Design New Assets
1. Use Figma/Canva/Adobe Express
2. Export at required sizes
3. Place files in `/resources/` folder

## Asset Naming
Place these files in the `resources/` folder:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (2732x2732)

## Generate Platform-Specific Assets

### Using @capacitor/assets (Recommended)
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

This will automatically generate all required sizes for iOS and Android.

### Manual Generation
If you prefer manual generation:
- **iOS**: Place assets in `ios/App/App/Assets.xcassets/`
- **Android**: Place assets in `android/app/src/main/res/` (various `mipmap-*` folders)

## Current Setup

Your app is configured with:
- **App Name**: Liron Shop
- **App ID**: com.lironshop.app
- **Primary Color**: #FF385C (pink/red)

Make sure your icons match this branding!

## Quick Start

1. Create `icon.png` (1024x1024) in `/resources/`
2. Create `splash.png` (2732x2732) in `/resources/`
3. Run: `npm install -D @capacitor/assets`
4. Run: `npx capacitor-assets generate`
5. Sync: `npm run cap:sync`

Done! Your app will now have proper icons and splash screens.




