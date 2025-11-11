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
                            <input type="range" class="volume-slider" min="0" max="100" value="100" aria-label="רמת ווליום">
                        </div>
                    </div>

                    <!-- Like/Dislike Overlay Indicators -->
                    <div class="swipe-indicator like-indicator">
                        <div class="indicator-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </div>
                        <span>נשמר!</span>
                    </div>
                    <div class="swipe-indicator dislike-indicator">
                        <div class="indicator-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </div>
                        <span>לא מעניין</span>
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
                
                <!-- Product Info -->
                <div class="product-info" data-position="${product.descriptionPosition || 'bottom'}">
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
        const likeIndicator = slide.querySelector('.like-indicator');
        
        this.isAnimating = true;
        
        likeIndicator.classList.add('active');
        this.addToFavorites(productId);
        
        setTimeout(() => {
            likeIndicator.classList.remove('active');
            this.goToNextSlide();
        }, 600);
        
        console.log('❤️ LIKED & SAVED!');
    }

    dislikeProduct(slideIndex) {
        if (this.isAnimating) return;
        
        const slide = this.slides[slideIndex];
        const dislikeIndicator = slide.querySelector('.dislike-indicator');
        
        this.isAnimating = true;
        
        dislikeIndicator.classList.add('active');
        
        setTimeout(() => {
            dislikeIndicator.classList.remove('active');
            this.goToNextSlide();
        }, 600);
        
        console.log('👎 DISLIKED & SKIPPED');
    }

    goToNextSlide() {
        if (this.currentSlide >= this.totalSlides - 1) {
            console.log('🎉 You viewed all products!');
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

    // ============================
    // Video Controls
    // ============================
    setupVideoControls() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('.product-video');
            const overlay = slide.querySelector('.video-overlay');
            const playPauseBtn = slide.querySelector('.play-pause-btn');

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

            // Set initial volume
            video.volume = 1.0;

            // Volume slider change
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                video.volume = volume;
                
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
                    video.volume = 0;
                    volumeSlider.value = 0;
                    volumeIcon.style.display = 'none';
                    volumeMutedIcon.style.display = 'block';
                } else {
                    video.volume = 1.0;
                    volumeSlider.value = 100;
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
                <div class="favorites-grid">
                    ${this.favorites.map(product => `
                        <div class="favorite-item">
                            <div class="favorite-item-header">
                                <div>
                                    <h3>${product.title}</h3>
                                    <div class="favorite-item-price">${product.price}</div>
                                </div>
                                <button class="remove-favorite-btn" data-product-id="${product.id}">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                            </div>
                            <a href="${product.link}" class="favorite-item-link" target="_blank">לרכישה</a>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.querySelectorAll('.remove-favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-product-id');
                    this.removeFromFavorites(productId);
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
