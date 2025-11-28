
// ============================================
// LIGHTBOX IMAGE GALLERY
// ============================================

let lightboxImages = [];
let currentLightboxIndex = 0;

// Open lightbox with image
function openLightbox(imageSrc, imageIndex, allImages) {
    lightboxImages = allImages;
    currentLightboxIndex = imageIndex;

    const modal = document.getElementById('lightbox-modal');
    const image = document.getElementById('lightbox-image');
    const current = document.getElementById('lightbox-current');
    const total = document.getElementById('lightbox-total');

    image.src = imageSrc;
    current.textContent = imageIndex + 1;
    total.textContent = allImages.length;

    modal.classList.add('active');

    // Animate in
    gsap.fromTo(modal,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo('.lightbox-content',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
    );
}

// Close lightbox
function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');

    gsap.to(modal, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            modal.classList.remove('active');
        }
    });
}

// Navigate lightbox
function navigateLightbox(direction) {
    currentLightboxIndex += direction;

    // Loop around
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = lightboxImages.length - 1;
    } else if (currentLightboxIndex >= lightboxImages.length) {
        currentLightboxIndex = 0;
    }

    const image = document.getElementById('lightbox-image');
    const current = document.getElementById('lightbox-current');

    // Animate transition
    gsap.to(image, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            image.src = lightboxImages[currentLightboxIndex];
            current.textContent = currentLightboxIndex + 1;
            gsap.to(image, { opacity: 1, duration: 0.2 });
        }
    });
}

// Initialize lightbox for all slides with images
function initializeLightbox() {
    // Find all slides with image grids
    const slides = document.querySelectorAll('.slide');

    slides.forEach((slide, slideIndex) => {
        // Find all images in the slide
        const allImages = slide.querySelectorAll('img');
        const images = Array.from(allImages).filter(img => {
            // Exclude video posters and images without proper src
            if (img.closest('video')) return false;
            if (!img.src || img.src === '') return false;
            // Only include images from the images folder
            return img.src.includes('/images/');
        });

        if (images.length >= 2) { // At least 2 images for gallery
            const imageArray = images.map(img => img.src);

            images.forEach((img, index) => {
                // Skip if already has click handler
                if (img.hasAttribute('data-lightbox-init')) return;

                img.setAttribute('data-lightbox-init', 'true');

                // Find parent container
                const parent = img.closest('.gallery-card, .photo-frame, div[class*="rounded"]');

                if (parent) {
                    // Add click to parent (works even with overlay)
                    if (!parent.hasAttribute('data-lightbox-parent')) {
                        parent.setAttribute('data-lightbox-parent', 'true');
                        parent.style.cursor = 'pointer';
                        parent.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openLightbox(img.src, index, imageArray);
                        });
                    }
                } else {
                    // Fallback: add click directly to image
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openLightbox(img.src, index, imageArray);
                    });
                }
            });
        }
    });
}

// Keyboard controls for lightbox
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLightbox(1);
    }
});

// Initialize lightbox when slides are loaded
// We'll call this after slides are loaded in loader.js
