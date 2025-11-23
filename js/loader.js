async function loadSlides() {
    const app = document.getElementById('app');
    const totalSlides = 30;

    // 1. Load the first slide immediately
    try {
        const response = await fetch(`slides/slide-0.html`);
        if (!response.ok) throw new Error(`Failed to load slide 0`);
        const html = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const slide = tempDiv.querySelector('.slide');

        if (slide) {
            slide.id = `slide-0`;
            app.appendChild(slide);

            // Initialize first slide immediately
            const firstSlide = document.getElementById('slide-0');
            if (firstSlide) {
                // Prepare elements (hide them) BEFORE showing the slide
                try {
                    if (typeof prepareSlideElements === 'function') {
                        prepareSlideElements(firstSlide);
                    }
                } catch (e) {
                    console.warn("prepareSlideElements failed:", e);
                }

                // Small delay to ensure DOM is ready and transition is smooth
                setTimeout(() => {
                    document.body.classList.remove('js-loading');
                    try {
                        if (typeof gsap !== 'undefined') {
                            gsap.set(firstSlide, { visibility: 'visible', opacity: 1 });
                            firstSlide.classList.add('active-slide');
                            triggerSlideAnimations(firstSlide);
                updateNavigationButtons(); // Hide prev button on first slide
                        } else {
                            // Fallback if GSAP is missing
                            firstSlide.style.visibility = 'visible';
                            firstSlide.style.opacity = '1';
                            firstSlide.classList.add('active-slide');
                            console.error("GSAP not found!");
                        }
                    } catch (e) {
                        console.error("Error initializing first slide:", e);
                        // Emergency fallback
                        firstSlide.style.visibility = 'visible';
                        firstSlide.style.opacity = '1';
                        firstSlide.classList.add('active-slide');
                    }
                }, 500);
            } else {
                console.error("Slide 0 appended but not found in DOM");
                document.body.classList.remove('js-loading');
            }
        } else {
            console.error("Slide 0 content invalid: .slide element not found");
            document.body.classList.remove('js-loading');
        }
    } catch (error) {
        console.error("Critical error loading first slide:", error);
        // Remove loader even if error so user isn't stuck
        document.body.classList.remove('js-loading');
    }

    // 2. Load remaining slides in background
    for (let i = 1; i < totalSlides; i++) {
        try {
            const response = await fetch(`slides/slide-${i}.html`);
            if (!response.ok) throw new Error(`Failed to load slide ${i}`);
            const html = await response.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const slide = tempDiv.querySelector('.slide');

            if (slide) {
                slide.id = `slide-${i}`;
                app.appendChild(slide);
            }
        } catch (error) {
            console.warn(`Failed to background load slide ${i}`, error);
        }
    }
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', loadSlides);
