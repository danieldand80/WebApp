# 📱 Liron Shop - Mobile App Build Guide

## ✅ Current Status

Your web app has been successfully converted to a mobile app using **Capacitor**!

### What's Ready:
- ✅ Capacitor configured and initialized
- ✅ Android platform added
- ✅ iOS platform added
- ✅ All plugins installed (Status Bar, Splash Screen, Haptics, Keyboard)
- ✅ Web assets building to `/public` folder
- ✅ App configuration ready

---

## 🚀 Quick Start Commands

### Development
```bash
# Build web assets
npm run build:web

# Sync changes to mobile platforms
npm run cap:sync

# Open Android Studio
npm run build:android

# Open Xcode (Mac only)
npm run build:ios
```

---

## 📋 Prerequisites

### For Android Development:
1. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - During installation, install Android SDK (API 33+)
   - Install Android SDK Build-Tools
   - Set up Android Virtual Device (AVD) for testing

2. **Install Java JDK 17**
   - Download: https://adoptium.net/
   - Set JAVA_HOME environment variable

### For iOS Development:
1. **Mac Computer Required**
   - iOS apps can only be built on macOS
   - Alternative: Use cloud build service (Codemagic, Ionic Appflow, etc.)

2. **Install Xcode**
   - Download from Mac App Store (free)
   - Install Command Line Tools: `xcode-select --install`
   - Install CocoaPods: `sudo gem install cocoapods`

3. **Apple Developer Account**
   - Required for App Store deployment
   - Cost: $99/year
   - Sign up: https://developer.apple.com/

### For Google Play Store:
1. **Google Play Developer Account**
   - One-time fee: $25
   - Sign up: https://play.google.com/console/signup

---

## 🔨 Building the App

### Android Build Process

#### Step 1: Prepare Web Assets
```bash
npm run build:web
```

#### Step 2: Sync to Android
```bash
npx cap sync android
```

#### Step 3: Open in Android Studio
```bash
npx cap open android
```

#### Step 4: Build APK/AAB
In Android Studio:
1. Click **Build** → **Build Bundle(s) / APK(s)**
2. Choose:
   - **APK** for testing/direct installation
   - **AAB** for Google Play Store

#### Step 5: Test on Device/Emulator
- Connect Android device via USB (enable USB debugging)
- Or use Android Studio emulator
- Click **Run** (▶️) button

---

### iOS Build Process (Requires Mac)

#### Step 1: Prepare Web Assets
```bash
npm run build:web
```

#### Step 2: Install CocoaPods Dependencies
```bash
cd ios/App
pod install
cd ../..
```

#### Step 3: Sync to iOS
```bash
npx cap sync ios
```

#### Step 4: Open in Xcode
```bash
npx cap open ios
```

#### Step 5: Configure Signing
In Xcode:
1. Select project in navigator
2. Select **App** target
3. Go to **Signing & Capabilities**
4. Select your Apple Developer team
5. Xcode will automatically create provisioning profile

#### Step 6: Build & Run
1. Select target device (simulator or connected iPhone)
2. Click **Run** (▶️) button
3. Wait for build to complete

---

## 🎨 Customizing Icons & Splash Screens

### Quick Method (Recommended):
1. Create `icon.png` (1024x1024) in `/resources/` folder
2. Create `splash.png` (2732x2732) in `/resources/` folder
3. Install assets generator:
   ```bash
   npm install -D @capacitor/assets
   ```
4. Generate all sizes automatically:
   ```bash
   npx capacitor-assets generate
   ```
5. Sync to platforms:
   ```bash
   npm run cap:sync
   ```

See `/resources/ICONS_README.md` for detailed icon requirements.

---

## 🌐 API Configuration

Your app needs to connect to your backend API. Update API endpoints:

### For Production:
In `capacitor.config.json`, set your production server:
```json
{
  "server": {
    "url": "https://your-railway-app.railway.app",
    "cleartext": true
  }
}
```

**Important**: After changing server URL, run:
```bash
npm run cap:sync
```

### For Local Development:
To test with local server on device:
1. Find your computer's local IP (e.g., `192.168.1.100`)
2. Update `capacitor.config.json`:
   ```json
   {
     "server": {
       "url": "http://192.168.1.100:8080",
       "cleartext": true
     }
   }
   ```
3. Run your Node.js server: `npm start`
4. Sync and rebuild

---

## 📦 Publishing to Stores

### Google Play Store

#### 1. Prepare Release Build
In Android Studio:
- **Build** → **Generate Signed Bundle / APK**
- Select **Android App Bundle**
- Create new keystore or use existing
- **Keep keystore file safe!** (You'll need it for updates)

#### 2. Upload to Google Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Fill in store listing:
   - Title: Liron Shop
   - Short description
   - Full description
   - Screenshots (required)
   - Feature graphic
4. Upload AAB file
5. Complete content rating questionnaire
6. Submit for review

**Review time**: Usually 1-7 days

---

### Apple App Store

#### 1. Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in app information:
   - Platform: iOS
   - Name: Liron Shop
   - Language: Hebrew (he-IL)
   - Bundle ID: com.lironshop.app
   - SKU: com.lironshop.app

#### 2. Prepare App Archive
In Xcode:
1. Select **Any iOS Device (arm64)** as build target
2. **Product** → **Archive**
3. Wait for archive to complete
4. Click **Distribute App**
5. Select **App Store Connect**
6. Upload

#### 3. Submit for Review
In App Store Connect:
1. Fill in all required metadata
2. Add screenshots (required)
3. Add app preview video (optional)
4. Set pricing (free or paid)
5. Submit for review

**Review time**: Usually 1-3 days

---

## 🔧 Troubleshooting

### Android Issues

**"SDK location not found"**
- Open Android Studio
- Go to **Settings** → **Android SDK**
- Note the SDK path
- Create `local.properties` in `/android/` folder:
  ```
  sdk.dir=/path/to/your/android/sdk
  ```

**Build fails with "Kotlin" errors**
- Update Android Gradle Plugin in `android/build.gradle`
- Sync Gradle files

**App crashes on launch**
- Check `capacitor.config.json` webDir path is correct
- Run `npm run build:web` before syncing

### iOS Issues

**"CocoaPods not installed"**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

**"Code signing required"**
- Add Apple Developer account in Xcode
- Xcode will auto-create free provisioning profile for testing

**Build fails with "Xcode" errors**
- Update Xcode to latest version
- Clean build folder: **Product** → **Clean Build Folder**

---

## 🎯 Next Steps

### Immediate:
1. ✅ Create proper app icons (1024x1024)
2. ✅ Create splash screen (2732x2732)
3. ✅ Test on Android device/emulator
4. ✅ Update server URL in capacitor.config.json

### Before Launch:
1. Test all features on real devices
2. Update privacy policy
3. Prepare store listings (descriptions, screenshots)
4. Create promotional materials
5. Set up analytics (optional)

### After Launch:
1. Monitor crash reports
2. Respond to user reviews
3. Plan updates and new features

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Guides**: https://developer.android.com/guide
- **iOS Developer Guides**: https://developer.apple.com/documentation/
- **Ionic Forum**: https://forum.ionicframework.com/

---

## ⚡ Performance Tips

1. **Video Optimization**: 
   - Compress videos before upload
   - Use adaptive streaming for large files

2. **Network Requests**:
   - Add loading states
   - Implement retry logic
   - Cache responses when possible

3. **Native Features**:
   - Use Capacitor plugins for camera, storage, etc.
   - Implement haptic feedback for better UX

4. **Testing**:
   - Test on low-end devices
   - Test with poor network conditions
   - Test offline behavior

---

## 🎉 Success!

Your Liron Shop web app is now a real mobile app! 

**Ready to build for**:
- ✅ Android (Google Play Store)
- ✅ iOS (Apple App Store)

Good luck with your launch! 🚀

