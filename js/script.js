// State
let currentSlide = 0;
const totalSlides = 30; // Correct: slides 0-29
let isAnimating = false;

// Initialize GSAP
gsap.registerPlugin();

// ============================================
// VIEWPORT SCALING - Responsive Design
// ============================================

// Reference resolution (design resolution)
const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;

// Update scale based on viewport size
function updateScale() {
    const app = document.getElementById('app');
    if (!app) return;

    const scaleX = window.innerWidth / REFERENCE_WIDTH;
    const scaleY = window.innerHeight / REFERENCE_HEIGHT;

    // Use the smaller scale to ensure everything fits
    const scale = Math.min(scaleX, scaleY);

    // Apply transform scaling
    app.style.transform = `scale(${scale})`;
    app.style.transformOrigin = 'top left';

    // Center the scaled content
    const scaledWidth = REFERENCE_WIDTH * scale;
    const scaledHeight = REFERENCE_HEIGHT * scale;
    const offsetX = (window.innerWidth - scaledWidth) / 2;
    const offsetY = (window.innerHeight - scaledHeight) / 2;

    app.style.left = `${offsetX}px`;
    app.style.top = `${offsetY}px`;
}

// Initialize scaling on load
updateScale();

// Update scaling on window resize
window.addEventListener('resize', updateScale);


// Update navigation button visibility based on current slide
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.style.display = currentSlide === 0 ? 'none' : 'flex';
    }

    if (nextBtn) {
        nextBtn.style.display = currentSlide === totalSlides - 1 ? 'none' : 'flex';
    }
}

// Tilt Effect Logic
// Tilt Effect Logic
document.addEventListener('mousemove', (e) => {
    // Only apply tilt to cards in the active slide
    const activeSlide = document.querySelector('.active-slide');
    if (!activeSlide) return;

    const tiltElements = activeSlide.querySelectorAll('.glass-card');
    if (tiltElements.length === 0) return;

    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const rotateX = ((clientY - centerY) / centerY) * -2; // Subtle tilt
    const rotateY = ((clientX - centerX) / centerX) * 2;

    gsap.to(tiltElements, {
        duration: 1,
        rotateX: rotateX,
        rotateY: rotateY,
        ease: "power2.out",
        transformPerspective: 1000
    });
});

// Helper: Prepare elements for animation (Hide them)
function prepareSlideElements(slideContext) {
    if (!slideContext) return;

    // Text
    const texts = slideContext.querySelectorAll('.animate-text');
    if (texts.length) gsap.set(texts, { y: 30, opacity: 0 });

    // Cards
    const cards = slideContext.querySelectorAll('.animate-stagger, .animate-card, .animate-stagger-item');
    if (cards.length) gsap.set(cards, { y: 50, opacity: 0 });

    // Scale
    const scales = slideContext.querySelectorAll('.animate-scale');
    if (scales.length) gsap.set(scales, { scale: 0.8, opacity: 0 });

    // Images
    const imgs = slideContext.querySelectorAll('.animate-stagger-img');
    if (imgs.length) gsap.set(imgs, { scale: 0, rotation: 10, opacity: 0 });

    // Charts
    const bars = slideContext.querySelectorAll('.chart-bar-fill');
    bars.forEach(bar => {
        if (bar.hasAttribute('data-width')) gsap.set(bar, { width: 0 });
        if (bar.hasAttribute('data-height')) gsap.set(bar, { height: 0 });
    });

    // Donuts
    const donuts = slideContext.querySelectorAll('.donut-segment');
    donuts.forEach(donut => gsap.set(donut, { strokeDasharray: '0 251' }));

    // Counters
    const counters = slideContext.querySelectorAll('.count-up');
    counters.forEach(counter => counter.innerHTML = "0");

    // Slide-2 specific: Reset goal cards to initial hidden state
    if (slideContext.id === 'slide-2') {
        const goalCards = slideContext.querySelectorAll('.goal-card-premium');
        goalCards.forEach(card => {
            card.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
            card.classList.remove('opacity-100', 'translate-y-0');
        });
    }

    // Slide-25 specific: Reset SWOT cards to initial hidden state
    if (slideContext.id === 'slide-25') {
        const swotCards = slideContext.querySelectorAll('.swot-card');
        swotCards.forEach(card => {
            gsap.set(card, { opacity: 0, scale: 0.9, pointerEvents: 'none' });
            card.classList.add('opacity-0', 'scale-95', 'pointer-events-none'); // Fallback classes
            card.classList.remove('opacity-100', 'scale-100');
        });
    }
}

// ... (existing code) ...

// Helper: Reveal next SWOT card on Slide 25
function revealNextSwotCard(slideElement) {
    // Find all hidden SWOT cards
    const hiddenCards = slideElement.querySelectorAll('.swot-card.opacity-0');

    if (hiddenCards.length > 0) {
        const nextCard = hiddenCards[0];

        // Remove fallback classes
        nextCard.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');

        // GSAP Elastic Animation
        gsap.to(nextCard, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.6)",
            pointerEvents: 'auto'
        });

        // Optional: Add a subtle sound effect or haptic feedback here if desired
    }
}

// Slide Transitions
function showSlide(index, direction = 1) {
    if (isAnimating) return;
    isAnimating = true;

    const outgoingSlide = document.querySelector('.active-slide');

    // Cleanup videos in outgoing slide
    if (outgoingSlide) {
        cleanupVideos(outgoingSlide);
    }

    // Load incoming slide if not present
    const incomingSlideId = `slide-${index}`;
    let incomingSlide = document.getElementById(incomingSlideId);

    if (!incomingSlide) {
        console.error(`Slide ${incomingSlideId} not found!`);
        isAnimating = false;
        return;
    }

    // Determine start positions based on direction
    const xOut = direction > 0 ? -100 : 100;
    const xIn = direction > 0 ? 100 : -100;

    // PREPARE INCOMING SLIDE (Hide elements)
    prepareSlideElements(incomingSlide);

    // Timeline for smooth transition
    const tl = gsap.timeline({
        onComplete: () => {
            if (outgoingSlide) outgoingSlide.classList.remove('active-slide');
            incomingSlide.classList.add('active-slide');
            isAnimating = false;
            triggerSlideAnimations(incomingSlide);
            updateNavigationButtons(); // Update button visibility
        }
    });

    // Animate Out
    if (outgoingSlide) {
        tl.to(outgoingSlide, {
            duration: 0.8,
            xPercent: xOut,
            opacity: 0,
            scale: 0.9,
            ease: "power3.inOut"
        });
    }

    // Prepare Incoming
    gsap.set(incomingSlide, {
        xPercent: xIn,
        opacity: 0,
        scale: 0.9,
        visibility: 'visible'
    });

    // Animate In
    tl.to(incomingSlide, {
        duration: 0.8,
        xPercent: 0,
        opacity: 1,
        scale: 1,
        ease: "power3.inOut"
    }, outgoingSlide ? "-=0.6" : 0); // Overlap animations slightly
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide, 1);
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide, -1);
    }
}

// Cleanup Videos - Stop and reset videos when leaving a slide
function cleanupVideos(slideContext) {
    if (!slideContext) return;

    const videos = slideContext.querySelectorAll('video');

    videos.forEach(video => {
        // Pause the video
        video.pause();

        // Reset to beginning
        video.currentTime = 0;

        // Reload video to show poster
        video.load();

        // Remove controls
        video.removeAttribute('controls');

        // Remove any existing play overlays
        const container = video.closest('.relative');
        if (container) {
            const existingOverlay = container.querySelector('.video-play-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }
    });
}

// Initialize Videos - Hide controls and add custom play button
function initializeVideos(slideContext) {
    const videos = slideContext.querySelectorAll('video');

    videos.forEach(video => {
        // Reset video state
        video.pause();
        video.currentTime = 0;
        video.load(); // Reload video to show poster
        video.removeAttribute('controls');

        // Find the video container
        const container = video.closest('.relative');
        if (!container) return;

        // Remove any existing overlay first
        const existingOverlay = container.querySelector('.video-play-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create custom play button overlay (large centered button)
        const playOverlay = document.createElement('div');
        playOverlay.className = 'video-play-overlay absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity duration-300 hover:bg-black/30';
        playOverlay.innerHTML = `
            <div class="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                <i class="ph-fill ph-play text-4xl text-gray-900 ml-1"></i>
            </div>
        `;

        // Add overlay to container
        container.appendChild(playOverlay);

        // Click handler for play overlay
        playOverlay.addEventListener('click', () => {
            // Show native controls
            video.setAttribute('controls', 'controls');

            // Play video
            video.play();

            // Remove overlay with fade out
            playOverlay.style.opacity = '0';
            setTimeout(() => {
                playOverlay.remove();
            }, 300);
        });
    });
}

// Element Animations per slide
function triggerSlideAnimations(slideContext) {
    // Initialize videos first
    initializeVideos(slideContext);

    // Text Fade Up
    const texts = slideContext.querySelectorAll('.animate-text');
    if (texts.length) {
        gsap.to(texts,
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );
    }

    // Cards Stagger
    const cards = slideContext.querySelectorAll('.animate-stagger, .animate-card, .animate-stagger-item');
    if (cards.length) {
        gsap.to(cards,
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)", delay: 0.3 }
        );
    }

    // Scale Up
    const scales = slideContext.querySelectorAll('.animate-scale');
    if (scales.length) {
        gsap.to(scales,
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)", delay: 0.4 }
        );
    }

    // Images Stagger
    const imgs = slideContext.querySelectorAll('.animate-stagger-img');
    if (imgs.length) {
        gsap.to(imgs,
            { scale: 1, rotation: (i) => i % 2 === 0 ? -2 : 2, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3 }
        );
    }

    // Charts (Bars)
    const bars = slideContext.querySelectorAll('.chart-bar-fill');
    bars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        const height = bar.getAttribute('data-height');

        if (width) gsap.to(bar, { width: width, duration: 1.5, ease: "power3.out", delay: 0.5 });
        if (height) gsap.to(bar, { height: height, duration: 1.5, ease: "power3.out", delay: 0.5 });
    });

    // Donut Segments
    const donuts = slideContext.querySelectorAll('.donut-segment');
    donuts.forEach(donut => {
        const dash = donut.getAttribute('data-dash');
        if (dash) {
            gsap.to(donut,
                { strokeDasharray: dash, duration: 1.5, ease: "power3.out", delay: 0.5 }
            );
        }
    });

    // Numbers Count Up
    const counters = slideContext.querySelectorAll('.count-up');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const isFloat = target % 1 !== 0;
        let proxy = { val: 0 };

        gsap.to(proxy, {
            val: target,
            duration: 2,
            ease: "power1.out",
            delay: 0.5,
            onUpdate: function () {
                counter.innerHTML = isFloat ? proxy.val.toFixed(1) : Math.round(proxy.val);
            }
        });
    });
}

// Keyboard Nav
document.addEventListener('keydown', (e) => {
    // Navigation
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();

    // Video Controls
    const activeSlide = document.querySelector('.active-slide');
    if (!activeSlide) return;

    const video = activeSlide.querySelector('video');
    if (!video) return;

    // P key: Play/Pause
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    // F key: Fullscreen toggle
    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();

        // If the video is already the fullscreen element, exit fullscreen
        if (document.fullscreenElement === video) {
            document.exitFullscreen();
        }
        // Otherwise (if nothing is fullscreen, OR the slide deck is fullscreen), make video fullscreen
        else {
            video.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        }
    }
});



// ============================================
// DEBUG MODE - Ctrl+Shift+Y
// ============================================

let debugModeActive = false;
let debugPanel = null;

// Create Debug Panel
function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    // Added resize and min-height/width constraints
    panel.className = 'fixed top-4 right-4 w-80 min-w-[320px] min-h-[400px] max-h-[90vh] bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-gray-700 z-[9999] overflow-hidden flex flex-col resize';
    panel.style.display = 'none';

    panel.innerHTML = `
        <div id="debug-header" class="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-gray-700 cursor-move select-none shrink-0">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <h3 class="font-black text-sm uppercase tracking-wider">Debug Mode</h3>
                </div>
                <span class="text-xs font-mono bg-white/20 px-2 py-1 rounded">Ctrl+Shift+Y</span>
            </div>
        </div>
        
        <div class="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            <!-- Current Slide Info -->
            <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div class="text-xs text-gray-400 mb-1">Current Slide</div>
                <div class="text-2xl font-black" id="debug-current-slide">0</div>
                <div class="text-xs text-gray-500 mt-1">Total: ${totalSlides} slides (0-${totalSlides - 1})</div>
            </div>
            
            <!-- Quick Jump Input -->
            <div>
                <label class="text-xs text-gray-400 mb-2 block font-bold">Jump to Slide</label>
                <div class="flex gap-2">
                    <input 
                        type="number" 
                        id="debug-slide-input" 
                        min="0" 
                        max="${totalSlides - 1}" 
                        placeholder="0-${totalSlides - 1}"
                        class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                    <button 
                        id="debug-jump-btn"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition-colors"
                    >
                        Go
                    </button>
                </div>
            </div>
            
            <!-- Quick Navigation Buttons -->
            <div class="grid grid-cols-2 gap-2">
                <button id="debug-first-btn" class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold border border-gray-700 transition-colors">
                    ⏮ First
                </button>
                <button id="debug-last-btn" class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold border border-gray-700 transition-colors">
                    Last ⏭
                </button>
            </div>
            
            <!-- Slide Grid -->
            <div>
                <div class="text-xs text-gray-400 mb-2 font-bold">All Slides</div>
                <div class="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto custom-scrollbar" id="debug-slide-grid">
                    <!-- Slides will be generated here -->
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    // Drag Logic
    const header = panel.querySelector('#debug-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target.closest('#debug-header')) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, panel);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    return panel;
}

// Update Debug Panel Info
function updateDebugPanel() {
    if (!debugPanel) return;

    const currentSlideEl = document.getElementById('debug-current-slide');
    if (currentSlideEl) {
        currentSlideEl.textContent = currentSlide;
    }

    // Update grid active state
    const gridButtons = debugPanel.querySelectorAll('.debug-slide-btn');
    gridButtons.forEach((btn, index) => {
        if (index === currentSlide) {
            btn.classList.add('bg-indigo-600', 'ring-2', 'ring-indigo-400');
            btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        } else {
            btn.classList.remove('bg-indigo-600', 'ring-2', 'ring-indigo-400');
            btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
        }
    });
}

// Generate Slide Grid
function generateSlideGrid() {
    const grid = document.getElementById('debug-slide-grid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const btn = document.createElement('button');
        btn.className = 'debug-slide-btn px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold transition-colors';
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentSlide = i;
            showSlide(i, i > currentSlide ? 1 : -1);
            updateDebugPanel();
        });
        grid.appendChild(btn);
    }
    updateDebugPanel();
}

// Toggle Debug Mode
function toggleDebugMode() {
    debugModeActive = !debugModeActive;

    if (!debugPanel) {
        debugPanel = createDebugPanel();
        generateSlideGrid();

        // Add event listeners
        const jumpBtn = document.getElementById('debug-jump-btn');
        const slideInput = document.getElementById('debug-slide-input');
        const firstBtn = document.getElementById('debug-first-btn');
        const lastBtn = document.getElementById('debug-last-btn');

        jumpBtn.addEventListener('click', () => {
            const targetSlide = parseInt(slideInput.value);
            if (targetSlide >= 0 && targetSlide < totalSlides) {
                currentSlide = targetSlide;
                showSlide(targetSlide, targetSlide > currentSlide ? 1 : -1);
                updateDebugPanel();
                slideInput.value = '';
            }
        });

        slideInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                jumpBtn.click();
            }
        });

        firstBtn.addEventListener('click', () => {
            currentSlide = 0;
            showSlide(0, -1);
            updateDebugPanel();
        });

        lastBtn.addEventListener('click', () => {
            currentSlide = totalSlides - 1;
            showSlide(totalSlides - 1, 1);
            updateDebugPanel();
        });
    }

    if (debugModeActive) {
        debugPanel.style.display = 'flex'; // Changed to flex for layout
        updateDebugPanel();
        gsap.fromTo(debugPanel,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
    } else {
        gsap.to(debugPanel, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                debugPanel.style.display = 'none';
            }
        });
    }
}

// Keyboard Shortcut: Ctrl+Shift+Y
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
        e.preventDefault();
        toggleDebugMode();
    }
});

// Add custom scrollbar styles
const style = document.createElement('style');
style.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }
`;
document.head.appendChild(style);

// ============================================
// CUSTOM CONTEXT MENU - Right Click
// ============================================

let contextMenu = null;

// Create Custom Context Menu
function createContextMenu() {
    const menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    menu.className = 'fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-[10000] overflow-hidden';
    menu.style.display = 'none';
    menu.style.minWidth = '240px';

    menu.innerHTML = `
        <div class="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-b border-gray-200">
            <div class="flex items-center gap-2 px-2 py-1">
                <i class="ph-fill ph-presentation text-white text-lg"></i>
                <span class="text-white font-black text-xs uppercase tracking-wider">Sunum Menüsü</span>
            </div>
        </div>
        
        <div class="p-2 space-y-1">
            <!-- Current Slide Info -->
            <div class="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div class="text-xs text-gray-500 font-bold">Cari Slayd</div>
                <div class="text-lg font-black text-gray-900" id="context-current-slide">0</div>
                <div class="text-xs text-gray-500">/ ${totalSlides - 1}</div>
            </div>
            
            <!-- Navigation Section -->
            <div class="pt-2 pb-1">
                <div class="px-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Naviqasiya</div>
                
                <button class="context-menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors text-left group" data-action="first">
                    <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <i class="ph-fill ph-skip-back text-indigo-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">İlk Slayd</div>
                        <div class="text-xs text-gray-500">Başa dön</div>
                    </div>
                    <span class="text-xs text-gray-400 font-mono">Home</span>
                </button>
                
                <button class="context-menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors text-left group" data-action="last">
                    <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <i class="ph-fill ph-skip-forward text-purple-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">Son Slayd</div>
                        <div class="text-xs text-gray-500">Sona get</div>
                    </div>
                    <span class="text-xs text-gray-400 font-mono">End</span>
                </button>
            </div>
            
            <div class="h-px bg-gray-200 my-2"></div>
            
            <!-- Tools Section -->
            <div class="pb-1">
                <div class="px-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Alətlər</div>
                
                <button class="context-menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors text-left group" data-action="debug">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <i class="ph-fill ph-bug text-green-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">Debug Mode</div>
                        <div class="text-xs text-gray-500">Panel aç/bağla</div>
                    </div>
                    <span class="text-xs text-gray-400 font-mono">Ctrl+Shift+Y</span>
                </button>
                
                <button class="context-menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-left group" data-action="fullscreen">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <i class="ph-fill ph-arrows-out text-blue-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">Tam Ekran</div>
                        <div class="text-xs text-gray-500">Fullscreen aç</div>
                    </div>
                    <span class="text-xs text-gray-400 font-mono">F11</span>
                </button>
                
                <button class="context-menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors text-left group" data-action="reload">
                    <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <i class="ph-fill ph-arrow-clockwise text-orange-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-gray-800">Yenilə</div>
                        <div class="text-xs text-gray-500">Səhifəni yenidən yüklə</div>
                    </div>
                    <span class="text-xs text-gray-400 font-mono">F5</span>
                </button>
            </div>
            
            <div class="h-px bg-gray-200 my-2"></div>
            
            <!-- Info Section -->
            <div class="px-3 py-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2 text-xs text-gray-600">
                    <i class="ph-duotone ph-info text-sm"></i>
                    <span class="font-medium">Klaviatura: ← → (Naviqasiya)</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(menu);
    return menu;
}

// Show Context Menu
function showContextMenu(x, y) {
    if (!contextMenu) {
        contextMenu = createContextMenu();
        addContextMenuListeners();
    }

    // Update current slide info
    const currentSlideEl = contextMenu.querySelector('#context-current-slide');
    if (currentSlideEl) {
        currentSlideEl.textContent = currentSlide;
    }

    // Position menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';

    // Check if menu goes off screen
    const menuRect = contextMenu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        contextMenu.style.left = (windowWidth - menuRect.width - 10) + 'px';
    }
    if (menuRect.bottom > windowHeight) {
        contextMenu.style.top = (windowHeight - menuRect.height - 10) + 'px';
    }

    // Animate in
    gsap.fromTo(contextMenu,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(1.7)' }
    );
}

// Hide Context Menu
function hideContextMenu() {
    if (!contextMenu) return;

    gsap.to(contextMenu, {
        scale: 0.9,
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
            contextMenu.style.display = 'none';
        }
    });
}

// Add Context Menu Event Listeners
function addContextMenuListeners() {
    if (!contextMenu) return;

    const items = contextMenu.querySelectorAll('.context-menu-item');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');

            switch (action) {
                case 'first':
                    currentSlide = 0;
                    showSlide(0, -1);
                    break;
                case 'last':
                    currentSlide = totalSlides - 1;
                    showSlide(totalSlides - 1, 1);
                    break;
                case 'debug':
                    toggleDebugMode();
                    break;
                case 'fullscreen':
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                    break;
                case 'reload':
                    location.reload();
                    break;
            }

            hideContextMenu();
        });
    });
}
// Prevent Default Context Menu & Show Custom Menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
});

// Helper: Reveal next SWOT card on Slide 25
function revealNextSwotCard(slideElement) {
    console.log('🖱️ Slide 25 clicked!');

    // Find all hidden SWOT cards
    const hiddenCards = slideElement.querySelectorAll('.swot-card.opacity-0');
    console.log(`Found ${hiddenCards.length} hidden cards`);

    if (hiddenCards.length > 0) {
        const nextCard = hiddenCards[0];
        console.log('Revealing next card:', nextCard);

        // Remove fallback classes
        nextCard.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');

        // GSAP Elastic Animation
        gsap.to(nextCard, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.6)",
            pointerEvents: 'auto'
        });

        // Optional: Add a subtle sound effect or haptic feedback here if desired
    } else {
        console.log('No more cards to reveal');
    }
}

// Hide menu on click outside
document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

// Hide menu on scroll
document.addEventListener('scroll', () => {
    hideContextMenu();
});

// Hide menu on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideContextMenu();
    }
});


