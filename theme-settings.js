// Theme Settings System for AI Learning App
class ThemeSettings {
    constructor() {
        this.currentTheme = localStorage.getItem('app-theme') || 'light';
        this.currentColor = localStorage.getItem('app-color') || 'default';
        this.effects = {
            particles: localStorage.getItem('particles-effect') !== 'false',
            animations: localStorage.getItem('animations-effect') !== 'false',
            sounds: localStorage.getItem('sounds-effect') === 'true',
            voice: localStorage.getItem('voice-enabled') !== 'false'
        };
        this.voicePreference = localStorage.getItem('voice-preference') || 'auto';

        this.colorSchemes = {
            default: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#f093fb',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            green: {
                primary: '#56ab2f',
                secondary: '#a8e6cf',
                accent: '#4caf50',
                gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
            },
            purple: {
                primary: '#8360c3',
                secondary: '#2ebf91',
                accent: '#9c27b0',
                gradient: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)'
            },
            orange: {
                primary: '#f093fb',
                secondary: '#f5576c',
                accent: '#ff9800',
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            teal: {
                primary: '#4facfe',
                secondary: '#00f2fe',
                accent: '#00bcd4',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
            pink: {
                primary: '#fa709a',
                secondary: '#fee140',
                accent: '#e91e63',
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            }
        };

        this.initializeTheme();
    }

    // Initialize theme on page load
    initializeTheme() {
        this.applyThemeMode(this.currentTheme);
        this.applyColorScheme(this.currentColor);
        this.applyEffects();

        // Auto theme detection
        if (this.currentTheme === 'auto') {
            this.detectSystemTheme();
        }
    }

    // Show theme settings modal
    showThemeModal() {
        const modal = document.getElementById('theme-modal');
        modal.classList.remove('hidden');

        // Set current selections safely
        const themeInput = document.querySelector(`input[name="theme"][value="${this.currentTheme}"]`);
        if (themeInput) themeInput.checked = true;

        const colorBtn = document.querySelector(`button[data-color="${this.currentColor}"]`);
        if (colorBtn) colorBtn.classList.add('selected');

        const particlesOpt = document.getElementById('particles-effect');
        if (particlesOpt) particlesOpt.checked = this.effects.particles;

        const animationsOpt = document.getElementById('animations-effect');
        if (animationsOpt) animationsOpt.checked = this.effects.animations;

        const soundsOpt = document.getElementById('sounds-effect');
        if (soundsOpt) soundsOpt.checked = this.effects.sounds;

        const voiceOpt = document.getElementById('voice-input-effect');
        if (voiceOpt) voiceOpt.checked = this.effects.voice;

        const voicePrefEl = document.getElementById('voice-preference');
        if (voicePrefEl) voicePrefEl.value = this.voicePreference;

        // Add click handlers for color options
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    // Close theme settings modal
    closeThemeModal() {
        const modal = document.getElementById('theme-modal');
        modal.classList.add('hidden');
    }

    // Apply theme changes
    applyTheme() {
        // Get selected theme mode
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;

        // Get selected color scheme
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || this.currentColor;

        // Get effect settings
        const particles = document.getElementById('particles-effect').checked;
        const animations = document.getElementById('animations-effect').checked;
        const sounds = document.getElementById('sounds-effect').checked;
        const voice = document.getElementById('voice-input-effect').checked;
        const voicePrefEl = document.getElementById('voice-preference');
        const voicePref = voicePrefEl ? voicePrefEl.value : 'auto';

        // Apply changes
        this.currentTheme = selectedTheme;
        this.currentColor = selectedColor;
        this.effects = { particles, animations, sounds, voice };
        this.voicePreference = voicePref;

        // Save to localStorage
        localStorage.setItem('app-theme', selectedTheme);
        localStorage.setItem('app-color', selectedColor);
        localStorage.setItem('particles-effect', particles);
        localStorage.setItem('animations-effect', animations);
        localStorage.setItem('sounds-effect', sounds);
        localStorage.setItem('voice-enabled', voice);
        localStorage.setItem('voice-preference', voicePref);

        // Apply theme
        this.applyThemeMode(selectedTheme);
        this.applyColorScheme(selectedColor);
        this.applyEffects();

        // Show notification
        this.showNotification('🎨 Theme applied successfully!');

        // Play success sound
        this.playSound('success');

        // Close modal
        this.closeThemeModal();
    }

    // Apply theme mode (light/dark/auto)
    applyThemeMode(theme) {
        const body = document.body;

        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');

        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        } else {
            body.classList.add(`${theme}-theme`);
        }
    }

    // Apply color scheme
    applyColorScheme(colorName) {
        const scheme = this.colorSchemes[colorName];
        if (!scheme) return;

        const root = document.documentElement;
        root.style.setProperty('--primary-color', scheme.primary);
        root.style.setProperty('--secondary-color', scheme.secondary);
        root.style.setProperty('--accent-color', scheme.accent);
        root.style.setProperty('--background-gradient', scheme.gradient);

        // Update body background
        document.body.style.background = scheme.gradient;
    }

    // Apply visual effects
    applyEffects() {
        const body = document.body;

        // Particles effect
        if (this.effects.particles) {
            body.classList.add('particles-enabled');
            this.createParticles();
        } else {
            body.classList.remove('particles-enabled');
            this.removeParticles();
        }

        // Animations effect
        if (this.effects.animations) {
            body.classList.add('animations-enabled');
        } else {
            body.classList.remove('animations-enabled');
        }

        // Sound effects
        if (this.effects.sounds) {
            body.classList.add('sounds-enabled');
        } else {
            body.classList.remove('sounds-enabled');
        }

        // Voice input
        if (window.voiceSystem) {
            window.voiceSystem.isEnabled = this.effects.voice;
            if (typeof window.voiceSystem.updateVoiceButtonsVisibility === 'function') {
                window.voiceSystem.updateVoiceButtonsVisibility();
            }
        }
    }

    // Create floating particles effect
    createParticles() {
        // Remove existing particles
        this.removeParticles();

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles-container';
        particleContainer.innerHTML = `
            <div class="particle particle-1">✨</div>
            <div class="particle particle-2">🌟</div>
            <div class="particle particle-3">💫</div>
            <div class="particle particle-4">⭐</div>
            <div class="particle particle-5">🔮</div>
            <div class="particle particle-6">💎</div>
        `;

        document.body.appendChild(particleContainer);
    }

    // Remove particles
    removeParticles() {
        const existing = document.querySelector('.particles-container');
        if (existing) {
            existing.remove();
        }
    }

    // Detect system theme preference
    detectSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addListener((e) => {
            if (this.currentTheme === 'auto') {
                this.applyThemeMode('auto');
            }
        });
    }

    // Reset to default theme
    resetToDefault() {
        this.currentTheme = 'light';
        this.currentColor = 'default';
        this.effects = {
            particles: true,
            animations: true,
            sounds: false,
            voice: true
        };
        this.voicePreference = 'auto';

        // Clear localStorage
        localStorage.removeItem('app-theme');
        localStorage.removeItem('app-color');
        localStorage.removeItem('particles-effect');
        localStorage.removeItem('animations-effect');
        localStorage.removeItem('sounds-effect');
        localStorage.removeItem('voice-enabled');
        localStorage.removeItem('voice-preference');

        // Apply default theme
        this.applyThemeMode('light');
        this.applyColorScheme('default');
        this.applyEffects();

        // Update modal selections
        document.querySelector('input[name="theme"][value="light"]').checked = true;
        document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('selected'));
        document.querySelector('button[data-color="default"]').classList.add('selected');
        document.getElementById('particles-effect').checked = true;
        document.getElementById('animations-effect').checked = true;
        document.getElementById('sounds-effect').checked = false;
        document.getElementById('voice-input-effect').checked = true;

        const voicePrefEl = document.getElementById('voice-preference');
        if (voicePrefEl) voicePrefEl.value = 'auto';

        this.showNotification('🔄 Theme reset to default!');
    }

    // Show notification
    showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.theme-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Play sound effect (if enabled)
    playSound(soundType) {
        if (!this.effects.sounds) return;

        try {
            // Simple sound effects using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different sounds for different actions
            switch (soundType) {
                case 'click':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
                case 'success':
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    break;
                case 'notification':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
            }

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Sound effects not available:', error);
        }
    }
}

// Initialize theme settings and expose to global scope for HTML onclick handlers
const themeSettings = new ThemeSettings();
window.themeSettings = themeSettings;

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('theme-modal');
    if (e.target === modal) {
        themeSettings.closeThemeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        themeSettings.closeThemeModal();
    }
});

console.log('🎨 Theme Settings System initialized!');
