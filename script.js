// ============================
// Tinder-Style Video Shopping App
// Dynamic Loading from API
// ============================

class VideoShoppingApp {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.totalSlides = 0;
        this.videos = [];
        this.slider = document.getElementById('videoSlider');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        // Touch/Swipe events
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minActionSwipeDistance = 100;
        this.isAnimating = false;
        
        // Favorites management
        this.favorites = this.loadFavorites();
        this.products = [];
        
        // Volume management - persist across videos
        this.currentVolume = 1.0; // Default 100%
        
        this.init();
    }

    async init() {
        console.log('🚀 Loading products from API...');
        
        // Load products from API
        await this.loadProductsFromAPI();
        
        if (this.products.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Render products
        this.renderProducts();
        
        // Initialize after products are loaded
        this.slides = document.querySelectorAll('.product-slide');
        this.videos = document.querySelectorAll('.product-video');
        this.totalSlides = this.slides.length;
        
        this.setupVideoControls();
        this.setupVolumeControls();
        this.setupTouchEvents();
        this.setupActionButtons();
        this.setupFavoritesModal();
        this.setupKeyboardNavigation();
        this.preventDefaultBehaviors();
        this.updateFavoritesCount();
        this.playCurrentVideo();
        
        // Hide loading screen
        this.loadingScreen.style.display = 'none';
        
        console.log(`✅ Loaded ${this.products.length} products`);
        console.log('❤️ Swipe RIGHT to save | 👎 Swipe LEFT to skip');
    }

    // ============================
    // Load Products from API
    // ============================
    async loadProductsFromAPI() {
        try {
            const response = await fetch('/api/products');
            this.products = await response.json();
            console.log(`📦 Found ${this.products.length} products`);
        } catch (error) {
            console.error('❌ Failed to load products:', error);
            this.products = [];
        }
    }

    // ============================
    // Render Products Dynamically
    // ============================
    renderProducts() {
        this.slider.innerHTML = this.products.map((product, index) => `
            <div class="product-slide ${index === 0 ? 'active' : ''}" data-index="${index}" data-product-id="${product.id}">
                <div class="video-container">
                    <video class="product-video" playsinline webkit-playsinline loop>
                        <source src="${product.videoUrl}" type="video/mp4">
                        הדפדפן שלך לא תומך בוידאו
                    </video>
                    
                    <!-- Video Controls Overlay -->
                    <div class="video-overlay">
                        <button class="play-pause-btn" aria-label="נגן/עצור">
                            <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg class="pause-icon" viewBox="0 0 24 24" fill="white" style="display: none;">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Volume Control -->
                    <div class="volume-control">
                        <button class="volume-btn" aria-label="ווליום">
                            <svg class="volume-icon" viewBox="0 0 24 24" fill="white">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                            <svg class="volume-muted-icon" viewBox="0 0 24 24" fill="white" style="display: none;">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                        </button>
                        <div class="volume-slider-container">
                            <input type="range" class="volume-slider" min="0" max="100" value="0" aria-label="רמת ווליום">
                        </div>
                    </div>

                    <!-- Fullscreen Swipe Overlays -->
                    <div class="swipe-overlay like-overlay">
                        <div class="swipe-overlay-content">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span>נשמר!</span>
                        </div>
                    </div>
                    <div class="swipe-overlay dislike-overlay">
                        <div class="swipe-overlay-content">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                            <span>לא מעניין</span>
                        </div>
                    </div>
                </div>

                <!-- Like/Dislike Buttons (Tinder-style) -->
                <div class="action-buttons">
                    <button class="action-btn dislike-btn" aria-label="לא אוהב">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                        </svg>
                    </button>
                    <button class="action-btn like-btn" aria-label="אוהב">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Video Progress Bar -->
                <div class="video-progress-bar">
                    <div class="video-progress-fill"></div>
                </div>
                
                <!-- Product Info -->
                <div class="product-info">
                    <h2 class="product-title">${product.title}</h2>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price}</div>
                    <a href="${product.link}" class="purchase-btn" target="_blank">
                        <span>לרכישה מיידית</span>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `).join('');
    }

    // ============================
    // Empty State
    // ============================
    showEmptyState() {
        this.loadingScreen.style.display = 'none';
        this.slider.innerHTML = `
            <div class="empty-state-full">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 120px; height: 120px; opacity: 0.2; margin-bottom: 20px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h2 style="font-size: 28px; color: white; margin-bottom: 15px;">אין מוצרים עדיין</h2>
                <p style="font-size: 18px; color: rgba(255,255,255,0.7); margin-bottom: 30px;">
                    היכנס לפאנל הניהול והעלה את המוצר הראשון שלך!
                </p>
                <a href="/admin.html" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #FF385C 0%, #FF6B88 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px;">
                    🎬 פתח פאנל ניהול
                </a>
            </div>
        `;
    }

    // ============================
    // Favorites Management
    // ============================
    loadFavorites() {
        try {
            const saved = localStorage.getItem('videoShopFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch(e) {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('videoShopFavorites', JSON.stringify(this.favorites));
            this.updateFavoritesCount();
        } catch(e) {
            console.warn('Failed to save favorites');
        }
    }

    addToFavorites(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return false;
        
        if (!this.favorites.find(f => f.id === productId)) {
            this.favorites.push(product);
            this.saveFavorites();
            console.log('❤️ Added to favorites:', product.title);
            return true;
        }
        return false;
    }

    removeFromFavorites(productId) {
        this.favorites = this.favorites.filter(f => f.id !== productId);
        this.saveFavorites();
        this.renderFavorites();
    }

    updateFavoritesCount() {
        const countEl = document.querySelector('.favorites-count');
        if (countEl) {
            countEl.textContent = this.favorites.length;
            countEl.style.display = this.favorites.length > 0 ? 'flex' : 'none';
        }
    }

    // ============================
    // Like/Dislike Actions
    // ============================
    likeProduct(slideIndex) {
        if (this.isAnimating) return;
        
        const slide = this.slides[slideIndex];
        const productId = slide.getAttribute('data-product-id');
        const likeOverlay = slide.querySelector('.like-overlay');
        
        this.isAnimating = true;
        
        likeOverlay.classList.add('active');
        this.addToFavorites(productId);
        
        setTimeout(() => {
            likeOverlay.classList.remove('active');
            this.goToNextSlide();
        }, 600);
        
        console.log('❤️ LIKED & SAVED!');
    }

    dislikeProduct(slideIndex) {
        if (this.isAnimating) return;
        
        const slide = this.slides[slideIndex];
        const dislikeOverlay = slide.querySelector('.dislike-overlay');
        
        this.isAnimating = true;
        
        dislikeOverlay.classList.add('active');
        
        setTimeout(() => {
            dislikeOverlay.classList.remove('active');
            this.goToNextSlide();
        }, 600);
        
        console.log('👎 DISLIKED & SKIPPED');
    }

    goToNextSlide() {
        // Endless loop: if reached end, restart with favorites or all products
        if (this.currentSlide >= this.totalSlides - 1) {
            console.log('🎉 You viewed all products! Restarting with favorites...');
            
            // Pause current video
            const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
            if (currentVideo) {
                currentVideo.pause();
                this.resetPlayButton(currentVideo);
            }
            
            this.slides[this.currentSlide].classList.remove('active');
            
            // Restart from beginning
            this.currentSlide = 0;
            
            // Use favorites if available, otherwise restart all products
            if (this.favorites.length > 0) {
                console.log(`♻️ Showing ${this.favorites.length} favorites again...`);
                this.showAlert(`♻️ Showing your ${this.favorites.length} favorite product${this.favorites.length > 1 ? 's' : ''} again!`, 'success');
                this.renderFavoritesAsSlides();
            } else {
                console.log('♻️ No favorites, restarting all products...');
                this.slides[this.currentSlide].classList.add('active');
                this.playCurrentVideo();
            }
            
            this.isAnimating = false;
            return;
        }

        const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
        if (currentVideo) {
            currentVideo.pause();
            this.resetPlayButton(currentVideo);
        }

        this.slides[this.currentSlide].classList.remove('active');
        this.slides[this.currentSlide].classList.add('prev-slide');

        this.currentSlide++;

        this.slides[this.currentSlide].classList.remove('next-slide');
        this.slides[this.currentSlide].classList.add('active');

        setTimeout(() => {
            this.playCurrentVideo();
            this.isAnimating = false;
            
            this.slides.forEach((slide, idx) => {
                if (idx < this.currentSlide) {
                    slide.classList.add('prev-slide');
                    slide.classList.remove('next-slide');
                } else if (idx > this.currentSlide) {
                    slide.classList.add('next-slide');
                    slide.classList.remove('prev-slide');
                }
            });
        }, 500);
    }
    
    // Render favorites as slides for endless loop
    renderFavoritesAsSlides() {
        this.renderProducts();
        this.slides = document.querySelectorAll('.product-slide');
        this.videos = document.querySelectorAll('.product-video');
        this.totalSlides = this.slides.length;
        
        this.setupVideoControls();
        this.setupVolumeControls();
        this.setupActionButtons();
        
        this.slides[this.currentSlide].classList.add('active');
        this.playCurrentVideo();
    }
    
    // Show alert helper
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    // ============================
    // Video Controls
    // ============================
    setupVideoControls() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('.product-video');
            const overlay = slide.querySelector('.video-overlay');
            const playPauseBtn = slide.querySelector('.play-pause-btn');
            const progressBar = slide.querySelector('.video-progress-fill');
            const progressBarContainer = slide.querySelector('.video-progress-bar');

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target === playPauseBtn || e.target.closest('.play-pause-btn')) {
                    this.toggleVideoPlayPause(video);
                }
            });

            video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play();
            });

            video.addEventListener('error', () => {
                console.warn(`❌ Video ${index + 1} failed to load`);
            });

            video.addEventListener('play', () => {
                video.setAttribute('data-playing', 'true');
            });

            video.addEventListener('pause', () => {
                video.removeAttribute('data-playing');
            });
            
            // Update progress bar
            video.addEventListener('timeupdate', () => {
                if (video.duration) {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            });
            
            video.addEventListener('loadedmetadata', () => {
                progressBar.style.width = '0%';
            });
            
            // Make progress bar clickable for seeking
            progressBarContainer.addEventListener('click', (e) => {
                if (!video.duration) return;
                
                const rect = progressBarContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newTime = percentage * video.duration;
                
                video.currentTime = newTime;
                console.log(`⏩ Seeked to ${Math.floor(newTime)}s (${Math.floor(percentage * 100)}%)`);
            });
        });
    }

    toggleVideoPlayPause(video) {
        const playIcon = video.parentElement.querySelector('.play-icon');
        const pauseIcon = video.parentElement.querySelector('.pause-icon');

        if (video.paused) {
            video.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            video.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    playCurrentVideo() {
        const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
        if (currentVideo) {
            // Apply saved volume to new video
            currentVideo.volume = this.currentVolume;
            currentVideo.currentTime = 0;
            currentVideo.play().catch(() => {
                this.showPlayButton(currentVideo);
            });
        }
    }

    showPlayButton(video) {
        const playIcon = video.parentElement.querySelector('.play-icon');
        const pauseIcon = video.parentElement.querySelector('.pause-icon');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        
        const overlay = video.parentElement.querySelector('.video-overlay');
        overlay.style.opacity = '1';
    }

    resetPlayButton(video) {
        const playIcon = video.parentElement.querySelector('.play-icon');
        const pauseIcon = video.parentElement.querySelector('.pause-icon');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }

    // ============================
    // Volume Controls
    // ============================
    setupVolumeControls() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('.product-video');
            const volumeBtn = slide.querySelector('.volume-btn');
            const volumeSlider = slide.querySelector('.volume-slider');
            const volumeIcon = slide.querySelector('.volume-icon');
            const volumeMutedIcon = slide.querySelector('.volume-muted-icon');

            // Set initial volume from saved state
            video.volume = this.currentVolume;
            const sliderValue = (1 - this.currentVolume) * 100; // Invert for slider
            volumeSlider.value = sliderValue;
            volumeSlider.style.setProperty('--volume-percent', `${this.currentVolume * 100}%`);

            // Volume slider change (inverted: 0=top/quiet, 100=bottom/loud)
            volumeSlider.addEventListener('input', (e) => {
                // Invert the slider value so bottom = loud, top = quiet
                const sliderValue = e.target.value;
                const volume = (100 - sliderValue) / 100; // Invert: 0->100, 100->0
                video.volume = volume;
                
                // Save volume globally for next videos
                this.currentVolume = volume;
                
                // Update CSS variable for track fill (also inverted)
                volumeSlider.style.setProperty('--volume-percent', `${100 - sliderValue}%`);
                
                // Update icon
                if (volume === 0) {
                    volumeIcon.style.display = 'none';
                    volumeMutedIcon.style.display = 'block';
                } else {
                    volumeIcon.style.display = 'block';
                    volumeMutedIcon.style.display = 'none';
                }
            });

            // Volume button click - toggle mute
            volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (video.volume > 0) {
                    // Mute
                    video.volume = 0;
                    this.currentVolume = 0;
                    volumeSlider.value = 100; // Inverted: 100 = muted (top)
                    volumeSlider.style.setProperty('--volume-percent', '0%');
                    volumeIcon.style.display = 'none';
                    volumeMutedIcon.style.display = 'block';
                } else {
                    // Unmute to previous volume or max
                    const targetVolume = this.currentVolume > 0 ? this.currentVolume : 1.0;
                    video.volume = targetVolume;
                    this.currentVolume = targetVolume;
                    volumeSlider.value = (1 - targetVolume) * 100; // Inverted
                    volumeSlider.style.setProperty('--volume-percent', `${targetVolume * 100}%`);
                    volumeIcon.style.display = 'block';
                    volumeMutedIcon.style.display = 'none';
                }
            });
        });
    }

    // ============================
    // Touch Events
    // ============================
    setupTouchEvents() {
        const container = document.getElementById('appContainer');

        container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const diffX = this.touchStartX - this.touchEndX;
        const absDiffX = Math.abs(diffX);

        if (absDiffX > this.minActionSwipeDistance) {
            if (diffX < 0) {
                console.log('👉 Swipe RIGHT - LIKE ❤️');
                this.likeProduct(this.currentSlide);
            } else {
                console.log('👈 Swipe LEFT - DISLIKE 👎');
                this.dislikeProduct(this.currentSlide);
            }
        }
    }

    // ============================
    // Keyboard Navigation
    // ============================
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.dislikeProduct(this.currentSlide);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.likeProduct(this.currentSlide);
                    break;
                case ' ':
                case 'k':
                    e.preventDefault();
                    const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
                    this.toggleVideoPlayPause(currentVideo);
                    break;
            }
        });
    }

    // ============================
    // Action Buttons
    // ============================
    setupActionButtons() {
        this.slides.forEach((slide, index) => {
            const likeBtn = slide.querySelector('.like-btn');
            const dislikeBtn = slide.querySelector('.dislike-btn');
            
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.likeProduct(index);
            });
            
            dislikeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dislikeProduct(index);
            });
        });
    }

    // ============================
    // Favorites Modal
    // ============================
    setupFavoritesModal() {
        const favBtn = document.getElementById('favoritesBtn');
        const modal = document.getElementById('favoritesModal');
        const closeBtn = document.getElementById('closeModalBtn');
        
        favBtn.addEventListener('click', () => {
            this.openFavoritesModal();
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeFavoritesModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFavoritesModal();
            }
        });
    }

    openFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        modal.classList.add('active');
        this.renderFavorites();
        
        const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
        if (currentVideo) currentVideo.pause();
    }

    closeFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        modal.classList.remove('active');
    }

    renderFavorites() {
        const container = document.getElementById('favoritesList');
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <p>עדיין לא שמרת מוצרים</p>
                    <span>החלק ימינה כדי לשמור מוצרים שאהבת ❤️</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="favorites-grid-new">
                    ${this.favorites.map(product => `
                        <div class="favorite-card">
                            <div class="favorite-video-preview">
                                <video src="${product.videoUrl}" playsinline muted></video>
                                <div class="favorite-overlay">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                                <div class="favorite-title-overlay">${product.title}</div>
                            </div>
                            <div class="favorite-actions">
                                <button class="favorite-action-btn share-btn" data-product-id="${product.id}" title="Share">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                                    </svg>
                                </button>
                                <button class="favorite-action-btn buy-btn" onclick="window.open('${product.link}', '_blank')" title="Buy">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                    </svg>
                                </button>
                                <button class="favorite-action-btn delete-btn" data-product-id="${product.id}" title="Remove">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Delete button handlers
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-product-id');
                    this.removeFromFavorites(productId);
                });
            });
            
            // Share button handlers
            container.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-product-id');
                    const product = this.favorites.find(p => p.id === productId);
                    if (product && navigator.share) {
                        navigator.share({
                            title: product.title,
                            text: product.description,
                            url: product.link
                        }).catch(() => {});
                    } else {
                        // Fallback: copy link
                        navigator.clipboard.writeText(product.link);
                        this.showAlert('🔗 Link copied to clipboard!', 'success');
                    }
                });
            });
            
            // Play video on hover
            container.querySelectorAll('.favorite-video-preview').forEach(preview => {
                const video = preview.querySelector('video');
                preview.addEventListener('mouseenter', () => {
                    video.play().catch(() => {});
                });
                preview.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            });
        }
    }

    // ============================
    // Prevent Default Behaviors
    // ============================
    preventDefaultBehaviors() {
        document.body.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.videos.forEach(video => video.pause());
            } else {
                const currentVideo = this.slides[this.currentSlide].querySelector('.product-video');
                if (currentVideo) {
                    currentVideo.play().catch(() => {});
                }
            }
        });
    }
}

// ============================
// Initialize
// ============================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Video Shopping App...');
    
    setTimeout(() => {
        window.videoApp = new VideoShoppingApp();
    }, 100);
});
