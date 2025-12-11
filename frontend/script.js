// ========== HAMBURGER MENU - EXACT SAME AS HOW IT WORKS PAGE ==========
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu - Same logic as How It Works page
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Create or remove overlay - Same as How It Works
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay && navMenu.classList.contains('active')) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        });
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    } else if (overlay && !navMenu.classList.contains('active')) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
});

// Close mobile menu when clicking on links - Same as How It Works
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    });
});

// ========== EXISTING LANDING PAGE FUNCTIONALITY ==========
// Navbar scroll effect - Same as How It Works
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== LANDING PAGE SPECIFIC FEATURES ==========
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Add initial styles for reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });
    
    // Initialize step animations if present
    const steps = document.querySelectorAll('.step');
    if (steps.length > 0) {
        steps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(20px)';
        });
        
        // Scroll animation for steps
        const animateSteps = () => {
            steps.forEach((step, index) => {
                const rect = step.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                if (rect.top < windowHeight - 100) {
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                    step.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
                }
            });
        };
        
        window.addEventListener('scroll', animateSteps);
        window.addEventListener('load', animateSteps);
        animateSteps(); // Initial check
    }
    
    // Feature cards hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Price history graph interaction
    const graphBars = document.querySelectorAll('.graph-bar');
    if (graphBars.length > 0) {
        graphBars.forEach((bar, index) => {
            // Set random heights for demo
            const randomHeight = 20 + Math.random() * 80;
            bar.style.height = `${randomHeight}%`;
            
            // Mark the last bar as active (current price)
            if (index === graphBars.length - 1) {
                bar.classList.add('active');
            }
            
            bar.addEventListener('mouseenter', () => {
                bar.style.opacity = '0.8';
            });
            
            bar.addEventListener('mouseleave', () => {
                bar.style.opacity = '1';
            });
        });
    }
});

// Smooth scroll for anchor links - Same as How It Works
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// ========== REVEAL ON SCROLL ANIMATION ==========
const initRevealOnScroll = () => {
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length === 0) return;
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('reveal--visible');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Check on load
};

// Initialize reveal animation
initRevealOnScroll();

// ========== DEMO ANIMATIONS ==========
// Pulse animation for live badge
const pulseAnimation = () => {
    const pulseDot = document.querySelector('.pulse-dot');
    if (pulseDot) {
        setInterval(() => {
            pulseDot.style.opacity = pulseDot.style.opacity === '0.5' ? '1' : '0.5';
        }, 1000);
    }
};

// Alert dot blinking animation
const blinkAlertDot = () => {
    const alertDots = document.querySelectorAll('.alert-dot');
    alertDots.forEach(dot => {
        setInterval(() => {
            dot.style.opacity = dot.style.opacity === '0.3' ? '1' : '0.3';
        }, 1000);
    });
};

// Platform icons rotation
const rotatePlatformIcons = () => {
    const platformIcons = document.querySelectorAll('.platform-icons i');
    platformIcons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        }, index * 500);
    });
    
    // Repeat every 5 seconds
    setInterval(() => {
        platformIcons.forEach((icon, index) => {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 300);
            }, index * 500);
        });
    }, 5000);
};

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    pulseAnimation();
    blinkAlertDot();
    rotatePlatformIcons();
});

// ========== RESPONSIVE BEHAVIOR ==========
// Handle window resize
window.addEventListener('resize', () => {
    // Close mobile menu if resizing to larger screen
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
});

// ========== CTA BUTTON INTERACTIONS ==========
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = button.classList.contains('btn-primary') 
            ? '0 5px 15px rgba(255, 215, 0, 0.3)' 
            : 'none';
    });
    
    button.addEventListener('click', (e) => {
        // Add click feedback
        button.style.transform = 'translateY(1px)';
        setTimeout(() => {
            button.style.transform = 'translateY(-3px)';
        }, 100);
    });
});