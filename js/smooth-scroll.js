/* smooth-scroll.js */
class SmoothScroll {
    constructor(options = {}) {
        this.options = {
            ease: options.ease || 0.08,
            friction: options.friction || 0.92,
            touchMultiplier: options.touchMultiplier || 2,
            ...options
        };
        
        this.scrollTarget = 0;
        this.scrollCurrent = 0;
        this.isScrolling = false;
        this.momentum = 0;
        this.isActive = false;
        this.originalBodyStyle = {};
        
        this.init();
    }

    init() {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.createScrollContainer();
        this.bindEvents();
        this.updateHeight();
        this.activate();
        this.animate();
    }

    createScrollContainer() {
        // Store original body styles
        this.originalBodyStyle = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            width: document.body.style.width,
            height: document.body.style.height,
            overflow: document.body.style.overflow
        };

        // Create scroll container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'smooth-scroll-container';
        
        // Move all body content to scroll container
        const bodyContent = Array.from(document.body.children);
        bodyContent.forEach(child => {
            if (!child.classList.contains('scroll-progress')) {
                this.scrollContainer.appendChild(child);
            }
        });
        
        document.body.appendChild(this.scrollContainer);
        
        // Add progress bar if it doesn't exist
        if (!document.querySelector('.scroll-progress')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            document.body.appendChild(progressBar);
        }
    }

    activate() {
        document.body.classList.add('smooth-scroll-active');
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        this.isActive = true;
    }

    deactivate() {
        if (!this.isActive) return;
        
        // Restore original body styles
        Object.keys(this.originalBodyStyle).forEach(prop => {
            document.body.style[prop] = this.originalBodyStyle[prop];
        });
        
        document.body.classList.remove('smooth-scroll-active');
        
        // Move content back to body
        while (this.scrollContainer.firstChild) {
            document.body.appendChild(this.scrollContainer.firstChild);
        }
        
        this.scrollContainer.remove();
        this.isActive = false;
    }

    updateHeight() {
        if (!this.scrollContainer) return;
        const rect = this.scrollContainer.getBoundingClientRect();
        this.maxScroll = Math.max(0, rect.height - window.innerHeight);
        document.body.style.height = rect.height + 'px';
    }

    bindEvents() {
        // Wheel events
        this.wheelHandler = this.onWheel.bind(this);
        window.addEventListener('wheel', this.wheelHandler, { passive: false });

        // Touch events
        this.touchHandler = this.onTouch.bind(this);
        window.addEventListener('touchstart', this.touchHandler);
        window.addEventListener('touchmove', this.touchHandler, { passive: false });
        window.addEventListener('touchend', this.touchHandler);

        // Keyboard events
        this.keyHandler = this.onKey.bind(this);
        window.addEventListener('keydown', this.keyHandler);

        // Resize events
        this.resizeHandler = this.onResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        // Anchor link clicks
        this.clickHandler = this.onClick.bind(this);
        document.addEventListener('click', this.clickHandler);
    }

    onWheel(e) {
        if (!this.isActive) return;
        e.preventDefault();
        
        const delta = e.deltaY * 1.5;
        this.momentum += delta;
        this.isScrolling = true;
        
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }

    onTouch(e) {
        if (!this.isActive) return;
        
        switch(e.type) {
            case 'touchstart':
                this.touchStartY = e.touches[0].clientY;
                break;
            case 'touchmove':
                e.preventDefault();
                const touchEndY = e.touches[0].clientY;
                const delta = (this.touchStartY - touchEndY) * this.options.touchMultiplier;
                this.momentum += delta;
                this.touchStartY = touchEndY;
                this.isScrolling = true;
                break;
            case 'touchend':
                this.isScrolling = false;
                break;
        }
    }

    onKey(e) {
        if (!this.isActive) return;
        
        const keyScrollAmount = 100;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                this.momentum += keyScrollAmount;
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.momentum -= keyScrollAmount;
                break;
            case 'Home':
                e.preventDefault();
                this.scrollTo(0);
                break;
            case 'End':
                e.preventDefault();
                this.scrollTo(this.maxScroll);
                break;
        }
    }

    onResize() {
        this.updateHeight();
    }

    onClick(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor && this.isActive) {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const rect = target.getBoundingClientRect();
                const targetScroll = this.scrollCurrent + rect.top;
                this.scrollTo(targetScroll);
            }
        }
    }

    animate() {
        if (!this.isActive) return;
        
        // Apply momentum and friction
        if (this.isScrolling) {
            this.scrollTarget += this.momentum;
            this.momentum *= this.options.friction;
            
            if (Math.abs(this.momentum) < 0.1) {
                this.momentum = 0;
            }
        }
        
        // Clamp scroll target
        this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.maxScroll));
        
        // Smooth interpolation
        this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * this.options.ease;
        
        // Apply transform
        const roundedScroll = Math.round(this.scrollCurrent * 100) / 100;
        if (this.scrollContainer) {
            this.scrollContainer.style.transform = `translate3d(0, ${-roundedScroll}px, 0)`;
        }
        
        // Update scroll indicators
        this.updateScrollIndicators();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    updateScrollIndicators() {
        const progress = this.maxScroll > 0 ? this.scrollCurrent / this.maxScroll : 0;
        
        // Update progress bar
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }
        
        // Trigger custom scroll event
        this.triggerScrollEvent();
    }

    triggerScrollEvent() {
        const scrollEvent = new CustomEvent('smoothscroll', {
            detail: {
                scrollTop: this.scrollCurrent,
                progress: this.maxScroll > 0 ? this.scrollCurrent / this.maxScroll : 0,
                isScrolling: this.isScrolling
            }
        });
        window.dispatchEvent(scrollEvent);
    }

    scrollTo(target, duration = 1000) {
        if (!this.isActive) return;
        
        const startScroll = this.scrollCurrent;
        const distance = target - startScroll;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.scrollTarget = startScroll + (distance * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }

    destroy() {
        if (!this.isActive) return;
        
        // Remove event listeners
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('touchstart', this.touchHandler);
        window.removeEventListener('touchmove', this.touchHandler);
        window.removeEventListener('touchend', this.touchHandler);
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('resize', this.resizeHandler);
        document.removeEventListener('click', this.clickHandler);
        
        this.deactivate();
    }
}

// Export for module use or create global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmoothScroll;
} else {
    window.SmoothScroll = SmoothScroll;
}
