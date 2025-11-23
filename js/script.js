// State
let currentSlide = 0;
const totalSlides = 29; // Correct: slides 0-28
let isAnimating = false;

// Initialize GSAP
gsap.registerPlugin();

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
}

// Slide Transitions
function showSlide(index, direction = 1) {
    if (isAnimating) return;
    isAnimating = true;

    const outgoingSlide = document.querySelector('.active-slide');

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

// Element Animations per slide
function triggerSlideAnimations(slideContext) {
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
        if (!document.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
});

// Slide 5 Interaction Logic (Event Delegation)
document.addEventListener('click', (e) => {
    const card = e.target.closest('#risk-group-card');
    if (!card) return;

    // Prevent multiple triggers if already updated
    if (card.dataset.updated === 'true') return;
    card.dataset.updated = 'true';

    const numberEl = card.querySelector('.number-target');
    const iconEl = card.querySelector('.icon-target');
    const textEl = card.querySelector('.text-target');

    // Animate number
    let proxy = { val: 6083 };
    gsap.to(proxy, {
        val: 5798,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
            if (numberEl) numberEl.innerHTML = Math.round(proxy.val);
        }
    });

    // Visual updates for 'Success' state
    if (iconEl) {
        gsap.to(iconEl, {
            color: '#10B981', // green-500
            duration: 0.5,
            onStart: () => {
                iconEl.classList.replace('ph-warning-octagon', 'ph-check-circle');
            }
        });
    }

    if (numberEl) {
        gsap.to(numberEl, {
            color: '#059669', // green-600
            duration: 0.5
        });
    }

    if (textEl) {
        gsap.to(textEl, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                textEl.innerHTML = 'Nəticə (Ugurlu)';
                textEl.classList.add('text-green-600');
                gsap.to(textEl, { opacity: 1, duration: 0.3 });
            }
        });
    }

    gsap.to(card, {
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)',
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5', // green-50
        duration: 0.5
    });
});
