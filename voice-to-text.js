// Voice-to-Text System for AI Learning App
class VoiceToTextSystem {
    constructor() {
        this.recognition = null;
        this.isSupported = false;
        this.isListening = false;
        this.isEnabled = localStorage.getItem('voice-enabled') !== 'false'; // Default enabled
        this.currentCallback = null;
        this.currentButton = null;
        
        this.initializeSpeechRecognition();
    }
    
    // Initialize Web Speech API
    initializeSpeechRecognition() {
        // Check for browser support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition settings for better speech detection
            this.recognition.continuous = true;  // Keep listening for speech
            this.recognition.interimResults = true;  // Show partial results
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;  // Get more alternatives
            
            // Add timeout settings
            this.speechTimeout = null;
            this.silenceTimeout = null;
            
            // Set up event handlers
            this.setupEventHandlers();
            
            console.log('🎤 Voice-to-Text system initialized successfully!');
        } else {
            console.warn('⚠️ Speech recognition not supported in this browser');
            this.isSupported = false;
        }
    }
    
    // Set up speech recognition event handlers
    setupEventHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateButtonState('listening');
            console.log('🎤 Voice recognition started');
        };
        
        this.recognition.onresult = (event) => {
            console.log('🎤 Speech recognition result event:', event);
            
            // Clear any existing timeouts
            if (this.speechTimeout) {
                clearTimeout(this.speechTimeout);
                this.speechTimeout = null;
            }
            if (this.silenceTimeout) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = null;
            }
            
            // Get the latest result
            const resultIndex = event.results.length - 1;
            const result = event.results[resultIndex];
            
            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                const confidence = result[0].confidence || 0.8;
                
                console.log('🎤 Final voice recognized:', transcript, 'Confidence:', confidence);
                
                if (transcript && transcript.length > 0) {
                    this.showNotification(`Heard: "${transcript}"`, 'success', 2000);
                    
                    if (this.currentCallback) {
                        this.currentCallback(transcript.toLowerCase(), transcript);
                    }
                } else {
                    this.showNotification('No speech detected. Please try again.', 'warning');
                }
                
                this.stopListening();
            } else {
                // Show interim results
                const transcript = result[0].transcript;
                if (transcript && transcript.trim().length > 0) {
                    console.log('🎤 Interim result:', transcript);
                    this.updateButtonState('processing');
                    
                    // Set a timeout to finalize if no more speech
                    this.silenceTimeout = setTimeout(() => {
                        console.log('🎤 Finalizing due to silence timeout');
                        this.recognition.stop();
                    }, 2000);
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.handleError(event.error);
            this.stopListening();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateButtonState('ready');
            console.log('🎤 Voice recognition ended');
            
            // Clear any remaining timeouts
            if (this.speechTimeout) {
                clearTimeout(this.speechTimeout);
                this.speechTimeout = null;
            }
            if (this.silenceTimeout) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = null;
            }
        };
        
        // Add speech start detection
        this.recognition.onspeechstart = () => {
            console.log('🎤 Speech detected!');
            this.updateButtonState('listening');
            this.showNotification('🎤 Speech detected, keep talking...', 'info', 1500);
        };
        
        // Add speech end detection
        this.recognition.onspeechend = () => {
            console.log('🎤 Speech ended, processing...');
            this.updateButtonState('processing');
        };
        
        // Add sound start detection
        this.recognition.onsoundstart = () => {
            console.log('🎤 Sound detected');
        };
        
        // Add sound end detection  
        this.recognition.onsoundend = () => {
            console.log('🎤 Sound ended');
        };
    }
    
    // Check internet connectivity
    async checkConnectivity() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Start listening for voice input
    async startListening(callback, button = null) {
        if (!this.isSupported) {
            this.showNotification('Voice input not supported in this browser. Please use Chrome, Edge, or Safari.', 'error');
            return;
        }
        
        if (!this.isEnabled) {
            this.showNotification('Voice input is disabled. Enable it in the 🎨 Theme Settings.', 'warning');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
            return;
        }
        
        // Check internet connectivity before starting
        const isOnline = await this.checkConnectivity();
        if (!isOnline) {
            this.showNotification('Voice recognition requires internet connection. Please check your connection or type your answer instead.', 'warning');
            return;
        }
        
        this.currentCallback = callback;
        this.currentButton = button;
        
        try {
            this.recognition.start();
            this.showNotification('🎤 Listening... Speak now!', 'info', 3000);
            
            // Set a maximum listening timeout (15 seconds)
            this.speechTimeout = setTimeout(() => {
                console.log('🎤 Speech timeout reached');
                if (this.isListening) {
                    this.recognition.stop();
                    this.showNotification('Listening timeout. Please try again.', 'warning');
                }
            }, 15000);
            
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showNotification('Failed to start voice input. Please check your microphone permissions.', 'error');
        }
    }
    
    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateButtonState('ready');
    }
    
    // Update button visual state
    updateButtonState(state) {
        if (!this.currentButton) return;
        
        const button = this.currentButton;
        const icon = button.querySelector('.voice-icon');
        const text = button.querySelector('.voice-text');
        
        switch (state) {
            case 'listening':
                button.classList.add('listening');
                button.classList.remove('ready', 'processing');
                if (icon) icon.textContent = '🔴';
                if (text) text.textContent = 'Listening...';
                break;
            case 'processing':
                button.classList.add('processing');
                button.classList.remove('ready', 'listening');
                if (icon) icon.textContent = '⏳';
                if (text) text.textContent = 'Processing...';
                break;
            case 'ready':
            default:
                button.classList.add('ready');
                button.classList.remove('listening', 'processing');
                if (icon) icon.textContent = '🎤';
                if (text) text.textContent = 'Speak';
                break;
        }
    }
    
    // Handle speech recognition errors
    handleError(error) {
        let message = 'Voice input error';
        let type = 'error';
        
        switch (error) {
            case 'no-speech':
                message = 'No speech detected. Please speak clearly and try again.';
                type = 'warning';
                break;
            case 'audio-capture':
                message = 'Microphone not accessible. Please check your microphone and permissions.';
                break;
            case 'not-allowed':
                message = 'Microphone permission denied. Please click the microphone icon in your browser\'s address bar and allow access.';
                break;
            case 'network':
                message = 'Network error: Voice recognition requires internet connection. Please check your connection and try again. You can also type your answer instead.';
                type = 'warning';
                this.showNetworkTroubleshooting();
                break;
            case 'aborted':
                message = 'Voice input was cancelled.';
                type = 'info';
                break;
            case 'service-not-allowed':
                message = 'Voice service not available. Please check your internet connection or try typing instead.';
                type = 'warning';
                break;
            default:
                message = `Voice input error: ${error}. You can type your answer instead.`;
        }
        
        this.showNotification(message, type);
    }
    
    // Create voice input button
    createVoiceButton(placeholder = 'Speak', callback = null) {
        if (!this.isSupported) {
            return null;
        }
        
        const button = document.createElement('button');
        button.className = 'voice-btn ready';
        button.innerHTML = `
            <span class="voice-icon">🎤</span>
            <span class="voice-text">${placeholder}</span>
        `;
        
        button.addEventListener('click', () => {
            this.startListening(callback, button);
        });
        
        return button;
    }
    
    // Add voice input to name entry
    enhanceNameInput() {
        console.log('🎤 Attempting to enhance name input...');
        
        const nameInput = document.getElementById('child-name');
        const nameSection = document.querySelector('.name-input-section');
        
        console.log('🎤 Name input found:', !!nameInput);
        console.log('🎤 Name section found:', !!nameSection);
        console.log('🎤 Voice supported:', this.isSupported);
        
        if (!nameInput || !nameSection) {
            console.warn('🎤 Name input elements not found, retrying in 1 second...');
            setTimeout(() => this.enhanceNameInput(), 1000);
            return;
        }
        
        if (!this.isSupported) {
            console.warn('🎤 Voice input not supported in this browser');
            return;
        }
        
        // Create voice button for name input
        console.log('🎤 Creating voice button for name input...');
        const voiceButton = this.createVoiceButton('Speak your name', (transcript, originalTranscript) => {
            // Clean up the transcript (capitalize first letter, remove extra spaces)
            const cleanName = originalTranscript.trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            
            console.log('🎤 Setting name input to:', cleanName);
            nameInput.value = cleanName;
            nameInput.focus();
            
            // Show confirmation
            this.showNotification(`Great! I heard: "${cleanName}"`, 'success', 3000);
            
            // Trigger input event to update app state
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        if (voiceButton) {
            // Check if voice button already exists
            const existingVoiceContainer = nameSection.querySelector('.voice-input-container');
            if (existingVoiceContainer) {
                console.log('🎤 Voice button already exists, skipping...');
                return;
            }
            
            // Add voice button next to name input
            const voiceContainer = document.createElement('div');
            voiceContainer.className = 'voice-input-container';
            voiceContainer.appendChild(voiceButton);
            
            // Insert after the input field
            nameInput.parentNode.insertBefore(voiceContainer, nameInput.nextSibling);
            
            // Helper text is now in HTML, no need to create duplicate
            
            console.log('🎤 Voice button successfully added to name input!');
        } else {
            console.error('🎤 Failed to create voice button');
        }
    }
    
    // Add voice input to quiz questions
    enhanceQuizInput(questionContainer, callback) {
        if (!this.isSupported || !this.isEnabled) return;
        
        const voiceButton = this.createVoiceButton('Speak answer', (transcript, confidence) => {
            // Process the spoken answer
            const spokenAnswer = transcript.trim().toLowerCase();
            
            // Show what was heard
            this.showNotification(`You said: "${transcript}"`, 'info');
            
            // Call the callback with the spoken answer
            if (callback) {
                callback(spokenAnswer, transcript);
            }
        });
        
        if (voiceButton) {
            voiceButton.classList.add('quiz-voice-btn');
            questionContainer.appendChild(voiceButton);
        }
    }
    
    // Toggle voice input on/off
    toggleVoiceInput() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('voice-enabled', this.isEnabled);
        
        const status = this.isEnabled ? 'enabled' : 'disabled';
        this.showNotification(`Voice input ${status}`, 'success');
        
        // Update UI elements
        this.updateVoiceButtonsVisibility();
        
        return this.isEnabled;
    }
    
    // Update visibility of voice buttons based on enabled state
    updateVoiceButtonsVisibility() {
        const voiceButtons = document.querySelectorAll('.voice-btn, .quiz-voice-btn');
        voiceButtons.forEach(button => {
            if (this.isEnabled) {
                button.style.display = 'inline-flex';
            } else {
                button.style.display = 'none';
            }
        });
    }
    
    // Show network troubleshooting tips
    showNetworkTroubleshooting() {
        setTimeout(() => {
            const troubleshootingMessage = `
                <strong>Voice Recognition Troubleshooting:</strong><br>
                • Check your internet connection<br>
                • Try refreshing the page<br>
                • Make sure you're using Chrome, Edge, or Safari<br>
                • You can always type your answer instead!
            `;
            this.showNotification(troubleshootingMessage, 'info', 8000);
        }, 2000);
    }
    
    // Show notification to user
    showNotification(message, type = 'info', duration = 4000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `voice-notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after specified duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
        
        console.log(`🎤 ${type.toUpperCase()}: ${message}`);
    }
    
    // Check if voice input is supported and enabled
    isAvailable() {
        return this.isSupported && this.isEnabled;
    }
    
    // Get current settings
    getSettings() {
        return {
            supported: this.isSupported,
            enabled: this.isEnabled,
            listening: this.isListening
        };
    }
}

// Initialize voice system when DOM is ready
function initializeVoiceSystem() {
    console.log('🎤 Initializing Voice-to-Text system...');
    const voiceSystem = new VoiceToTextSystem();
    window.voiceSystem = voiceSystem;
    
    // Try to enhance name input immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => voiceSystem.enhanceNameInput(), 500);
        });
    } else {
        setTimeout(() => voiceSystem.enhanceNameInput(), 500);
    }
    
    console.log('🎤 Voice-to-Text system loaded and ready!');
    return voiceSystem;
}

// Initialize immediately
initializeVoiceSystem();
