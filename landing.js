/* 
   landing.js
   Functionality for intersection observers and counters
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(7, 9, 19, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(7, 9, 19, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Reveal elements on scroll
    const reveals = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Animate counters
    const counters = document.querySelectorAll('.counter-val');
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const updateCounter = () => {
                    const targetData = +target.getAttribute('data-target');
                    const c = +target.innerText;
                    // determine speed
                    const increment = targetData / 100;
                    
                    if (c < targetData) {
                        target.innerText = Math.ceil(c + increment);
                        setTimeout(updateCounter, 20);
                    } else {
                        target.innerText = targetData;
                    }
                };
                updateCounter();
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Mobile menu toggle (simple version)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            if(navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(7, 9, 19, 0.98)';
                navLinks.style.padding = '2rem 0';
                navLinks.style.borderBottom = '1px solid var(--border-glass)';
            }
        });
    }
});
