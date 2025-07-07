class AdvancedWebsite {
    constructor() {
        this.cursor = { x: 0, y: 0 };
        this.particles = [];
        this.scrollDirection = 'down'; // Initialize scroll direction
        this.lastScrollY = 0; // Initialize last scroll position
        this.init();
    }

    init() {
        this.initSmoothScroll();
        this.initCursor();
        this.initParticles();
        this.initScrollAnimations();
        this.initContactForm();
        this.initIntersectionObserver();
        this.initMouseTracker();
        this.initProjectFiltering();
        this.startAnimationLoop();
    }

    // Initialize Lenis Smooth Scrolling
    initSmoothScroll() {
        this.lenis = new Lenis({
            lerp: 0.08,
            wheelMultiplier: 1.0,
            touchMultiplier: 2.0,
            smoothTouch: true,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        // Track scroll direction
        this.lenis.on('scroll', ({ scroll }) => {
            this.scrollDirection = scroll > this.lastScrollY ? 'down' : 'up';
            this.lastScrollY = scroll;
        });

        // Handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.lenis.scrollTo(anchor.getAttribute('href'));
            });
        });

        // Start the animation loop
        this.raf();
    }

    // Animation loop for Lenis
    raf() {
        this.lenis.raf(performance.now());
        requestAnimationFrame(() => this.raf());
    }

    // Initialize scroll animations
    initScrollAnimations() {
        // Add scroll-animate class to elements that don't have it
        const elements = document.querySelectorAll('.section-title, .about-text, .about-visual, .skill-card, .timeline-item, .project-card, .contact-card, .stat-item');
        elements.forEach(el => {
            if (!el.classList.contains('scroll-animate')) {
                el.classList.add('scroll-animate');
            }
        });
    }

    initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element entering viewport
                    this.animateElementIn(entry.target);
                    
                    // Trigger specific section animations
                    if (entry.target.classList.contains('skills')) {
                        this.animateSkillBars();
                    }
                    
                    if (entry.target.classList.contains('about')) {
                        this.animateCounters();
                    }

                    if (entry.target.classList.contains('experience')) {
                        this.animateTimeline();
                    }
                } else {
                    // Element leaving viewport - only animate out when scrolling up
                    if (this.scrollDirection === 'up') {
                        this.animateElementOut(entry.target);
                    }
                }
            });
        }, { 
            threshold: [0, 0.1],
            rootMargin: '-10% 0px -10% 0px'
        });

        // Observe all sections and scroll-animate elements
        document.querySelectorAll('section, .scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    animateElementIn(element) {
        element.classList.remove('animate-out');
        element.classList.add('animate-in');

        // Handle child elements with staggered animation
        const children = element.querySelectorAll('.scroll-animate');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.remove('animate-out');
                child.classList.add('animate-in');
            }, index * 100);
        });
    }

    animateElementOut(element) {
        element.classList.remove('animate-in');
        element.classList.add('animate-out');

        // Handle child elements
        const children = element.querySelectorAll('.scroll-animate');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.remove('animate-in');
                child.classList.add('animate-out');
            }, index * 50);
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.dataset.width;
                if (this.scrollDirection === 'down') {
                    bar.style.width = width + '%';
                } else {
                    bar.style.width = '0%';
                }
            }, index * 200);
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            
            if (this.scrollDirection === 'down') {
                this.animateCounter(counter, 0, target);
            } else {
                this.animateCounter(counter, target, 0);
            }
        });
    }

    animateCounter(element, start, end) {
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeProgress;
            
            element.textContent = Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = end;
            }
        };
        
        requestAnimationFrame(animate);
    }

    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                if (this.scrollDirection === 'down') {
                    item.classList.remove('animate-out');
                    item.classList.add('animate-in');
                } else {
                    item.classList.remove('animate-in');
                    item.classList.add('animate-out');
                }
            }, index * 200);
        });
    }

    // Custom Cursor
    initCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');

        if (!cursor || !cursorDot) return;

        document.addEventListener('mousemove', (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
            
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });

        // Cursor hover effects
        const hoverElements = document.querySelectorAll('button, a, .project-card, .skill-card, .contact-card');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }

    // Particle System
    initParticles() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animateParticles() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Mouse interaction
            const dx = this.cursor.x - particle.x;
            const dy = this.cursor.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= dx * force * 0.01;
                particle.y -= dy * force * 0.01;
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(108, 92, 231, ${particle.opacity})`;
            this.ctx.fill();
            
            // Connect nearby particles
            this.particles.forEach((otherParticle, otherIndex) => {
                if (index !== otherIndex) {
                    const dx2 = particle.x - otherParticle.x;
                    const dy2 = particle.y - otherParticle.y;
                    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    
                    if (distance2 < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.1 - distance2 / 1000})`;
                        this.ctx.stroke();
                    }
                }
            });
        });
    }

    // Enhanced project filtering
    initProjectFiltering() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                projectCards.forEach((card, index) => {
                    const category = card.dataset.category;
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.classList.add('animate-in');
                            card.classList.remove('animate-out');
                        }, index * 100);
                    } else {
                        card.classList.remove('animate-in');
                        card.classList.add('animate-out');
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Contact Form
    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        const submitBtn = form.querySelector('.submit-btn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            submitBtn.classList.add('loading');
            
            // Create particle burst effect
            this.createParticleBurst(submitBtn);
            
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            submitBtn.classList.remove('loading');
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
        });
    }

    createParticleBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #6c5ce7;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 100 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => particle.remove();
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initMouseTracker() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
        });
    }

    startAnimationLoop() {
        const animate = () => {
            this.animateParticles();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedWebsite();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
