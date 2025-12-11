const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Create or remove overlay
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

// Close mobile menu when clicking on links
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

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Step animations
const animateSteps = () => {
    const steps = document.querySelectorAll('.process-step');
    
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

// Initialize step animations
window.addEventListener('scroll', animateSteps);
window.addEventListener('load', animateSteps);

// FAQ Toggle functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current FAQ item
        item.classList.toggle('active');
    });
});

// Timeline item hover effects
const timelineItems = document.querySelectorAll('.timeline-item');

timelineItems.forEach(item => {
    const marker = item.querySelector('.timeline-marker');
    
    item.addEventListener('mouseenter', () => {
        marker.style.transform = 'scale(1.1)';
        marker.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', () => {
        marker.style.transform = 'scale(1)';
    });
});

// Demo search input effect
const demoSearchInput = document.querySelector('.demo-search input');
if (demoSearchInput) {
    demoSearchInput.addEventListener('focus', () => {
        demoSearchInput.parentElement.style.borderColor = 'var(--primary)';
        demoSearchInput.parentElement.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
    });
    
    demoSearchInput.addEventListener('blur', () => {
        demoSearchInput.parentElement.style.borderColor = 'rgba(255, 215, 0, 0.1)';
        demoSearchInput.parentElement.style.boxShadow = 'none';
    });
}

// Pulse animation for fetching
const pulseAnimation = () => {
    const pulseDot = document.querySelector('.pulse-dot');
    const pulseRing = document.querySelector('.pulse-ring');
    
    if (pulseDot && pulseRing) {
        let scale = 1;
        let opacity = 0.8;
        
        const animate = () => {
            scale += 0.01;
            opacity -= 0.01;
            
            if (scale >= 1.2) {
                scale = 0.8;
                opacity = 0.8;
            }
            
            pulseRing.style.transform = `translate(-50%, -50%) scale(${scale})`;
            pulseRing.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
};

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer if needed
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Trigger initial animations
    animateSteps();
    pulseAnimation();
    
    // Add initial styles for steps
    const steps = document.querySelectorAll('.process-step');
    steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
    });
});

// Smooth scroll for anchor links
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