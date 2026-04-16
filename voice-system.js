/**
 * Comprehensive Voice System for AI Learning App
 * Includes both Text-to-Speech (TTS) and Speech-to-Text (STT) functionality
 * Creates a fully voice-integrated learning experience
 */

class VoiceSystem {
    constructor() {
        console.log('🎤 Initializing Comprehensive Voice System...');

        // Speech Recognition (Voice-to-Text)
        this.recognition = null;
        this.isListening = false;
        this.currentCallback = null;
        this.currentButton = null;

        // Speech Synthesis (Text-to-Speech)
        this.synthesis = null; // Replaced with OpenAI
        this.currentAudio = null;
        this.isSpeaking = false;
        this.speechQueue = [];
        this.shouldAbortSequences = false;

        // TTS goes through /api/openai/audio/speech (server uses OPENAI_API_KEY from .env)
        this.activeVoice = 'echo'; // default OpenAI voice

        // Settings
        this.settings = {
            voiceEnabled: true,
            ttsEnabled: true,
            sttEnabled: true,
            voiceSpeed: 1.1,
            voicePitch: 1.0,
            voiceVolume: 0.9,
            preferredVoice: 'female' // 'male', 'female', or 'auto'
        };

        // Initialize both systems
        this.initializeSpeechRecognition();
        this.initializeTextToSpeech();
        this.loadSettings();

        console.log('🎤 Voice System initialized!', {
            sttSupported: !!this.recognition,
            ttsSupported: !!this.synthesis,
            voicesAvailable: this.synthesis ? this.synthesis.getVoices().length : 0
        });
    }

    // Initialize Speech Recognition (Voice-to-Text)
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            // Configure recognition settings
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;

            this.setupRecognitionEvents();
        } else {
            console.warn('🎤 Speech Recognition not supported in this browser');
        }
    }

    // Initialize Text-to-Speech
    initializeTextToSpeech() {
        // We are using OpenAI TTS exclusively now, no need to wait for browser voices.
        this.selectBestVoice();
    }

    // Select the best voice for the AI character
    selectBestVoice(characterName = '') {
        // Check for manual user preference override first
        const userPreference = localStorage.getItem('voice-preference') || 'auto';
        if (userPreference !== 'auto') {
            this.activeVoice = userPreference;
            console.log(`🔊 Using manually selected voice override: '${this.activeVoice}'`);
            return;
        }

        const safeName = characterName || '';
        // Map characters to OpenAI voices (alloy, echo, fable, onyx, nova, shimmer)
        const nameLower = safeName.toLowerCase();

        if (nameLower.includes('vision') || nameLower.includes('maya')) {
            this.activeVoice = 'nova';
        } else if (nameLower.includes('echo') || nameLower.includes('alex') || nameLower.includes('astro')) {
            this.activeVoice = 'echo';
        } else if (nameLower.includes('logic') || nameLower.includes('sam') || nameLower.includes('layer') || nameLower.includes('leo')) {
            this.activeVoice = 'onyx';
        } else if (nameLower.includes('linky') || nameLower.includes('rosa') || nameLower.includes('gaia') || nameLower.includes('green')) {
            this.activeVoice = 'shimmer';
        } else if (nameLower.includes('robo')) {
            this.activeVoice = 'fable';
        } else {
            this.activeVoice = 'alloy';
        }
        console.log(`🔊 Assigned OpenAI voice '${this.activeVoice}' to character '${characterName || 'Default'}'`);
    }

    // Setup Speech Recognition Events
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateButtonState('listening');
            console.log('🎤 Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            const resultIndex = event.results.length - 1;
            const result = event.results[resultIndex];

            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                const confidence = result[0].confidence || 0.8;

                console.log('🎤 Voice recognized:', transcript, 'Confidence:', confidence);

                if (transcript && transcript.length > 0) {
                    this.speak(`I heard: ${transcript}`, 'success');

                    if (this.currentCallback) {
                        this.currentCallback(transcript.toLowerCase(), transcript);
                    }
                } else {
                    this.speak('I didn\'t catch that. Please try again.', 'warning');
                }

                this.stopListening();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.handleRecognitionError(event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateButtonState('ready');
            console.log('🎤 Voice recognition ended');
        };
    }

    // Text-to-Speech: Make the AI speak using OpenAI
    async speak(text, type = 'info', priority = 'normal', characterName = '') {
        if (!this.settings.ttsEnabled) {
            console.log('🔊 TTS disabled');
            return Promise.resolve();
        }

        return new Promise(async (resolve) => {
            // Update voice personality mapping or check manual override
            this.selectBestVoice(characterName);

            // Handle priority
            if (priority === 'high') {
                this.stopSpeaking();
            } else if (this.isSpeaking) {
                this.speechQueue.push({ text, type, characterName, resolve });
                return; // Wait in queue
            }

            this.isSpeaking = true;
            this.updateMascotsTalking(true);
            console.log(`🔊 OpenAI generating speech (${this.activeVoice}):`, text.substring(0, 50) + '...');

            try {
                const response = await fetch('/api/openai/audio/speech', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'tts-1',
                        voice: this.activeVoice,
                        input: text,
                        speed: this.settings.voiceSpeed || 1.0
                    })
                });

                if (!response.ok) throw new Error('OpenAI TTS failed');

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Stop any current audio
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio.src = "";
                }

                this.currentAudio = new Audio(audioUrl);

                // Add event for synchronization with text tying
                this.currentAudio.addEventListener('playing', () => {
                    window.dispatchEvent(new CustomEvent('ai-speech-started', {
                        detail: { audioUrl, text }
                    }));
                });

                // Volume controls based on type
                if (type === 'error' || type === 'warning') {
                    this.currentAudio.volume = Math.max(0.3, this.settings.voiceVolume - 0.2);
                } else {
                    this.currentAudio.volume = this.settings.voiceVolume;
                }

                this.currentAudio.onended = () => {
                    this.isSpeaking = false;
                    this.updateMascotsTalking(false);
                    URL.revokeObjectURL(audioUrl);
                    window.dispatchEvent(new CustomEvent('ai-speech-ended'));
                    resolve();
                    this.processQueue();
                };

                this.currentAudio.onerror = (e) => {
                    const errCore = (this.currentAudio && this.currentAudio.error) ? this.currentAudio.error.message : (e.message || 'Unknown media error');
                    console.error('🔊 Audio playback failed. Check browser permissions or format.', errCore);
                    this.isSpeaking = false;
                    this.updateMascotsTalking(false);
                    resolve();
                    this.processQueue();
                };

                // Play the audio!
                if (!this.shouldAbortSequences) {
                    try {
                        await this.currentAudio.play();
                    } catch (playError) {
                        console.warn('🔊 Auto-play prevented by browser. User interaction required first.', playError.message || playError.name);
                        // Still resolve so the queue doesn't hang forever
                        resolve();
                        this.processQueue();
                    }
                } else {
                    resolve(); // If aborted while fetching
                }

            } catch (error) {
                console.error('🔊 OpenAI Speech synthesis error:', error);
                this.isSpeaking = false;
                this.updateMascotsTalking(false);
                resolve();
                this.processQueue();
            }
        });
    }

    // Process speech queue
    processQueue() {
        if (this.speechQueue.length > 0 && !this.isSpeaking && !this.shouldAbortSequences) {
            const nextItem = this.speechQueue.shift();
            this.speak(nextItem.text, nextItem.type, 'normal', nextItem.characterName).then(nextItem.resolve);
        }
    }

    // Stop current speech
    stopSpeaking() {
        this.shouldAbortSequences = true;

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = "";
            this.currentAudio = null;
        }

        this.speechQueue = [];
        this.isSpeaking = false;
        this.updateMascotsTalking(false);
        console.log('🔊 OpenAI Speech playback stopped and queue cleared');

        // Allow new sequences to start immediately after this call
        setTimeout(() => { this.shouldAbortSequences = false; }, 50);
    }

    // Toggle talking animation on all mascot images
    updateMascotsTalking(isTalking) {
        const mascotImages = document.querySelectorAll('.character-img, .card-buddy-img, .header-character-img');
        const containers = document.querySelectorAll('.ai-character');
        
        const applyTalking = (elements, active) => {
            elements.forEach(el => {
                if (active) el.classList.add('talking');
                else el.classList.remove('talking');
            });
        };

        applyTalking(mascotImages, isTalking);
        applyTalking(containers, isTalking);
    }

    // Voice-to-Text: Start listening
    async startListening(callback, button = null) {
        if (!this.settings.sttEnabled || !this.recognition) {
            this.speak('Voice input is not available right now.', 'warning');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        // Check internet connectivity
        const isOnline = await this.checkConnectivity();
        if (!isOnline) {
            this.speak('I need an internet connection for voice recognition. Please check your connection.', 'warning');
            return;
        }

        this.currentCallback = callback;
        this.currentButton = button;

        try {
            this.recognition.start();
            this.speak('I\'m listening! Please speak now.', 'info');
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.speak('Sorry, I couldn\'t start listening. Please try again.', 'error');
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // Handle recognition errors
    handleRecognitionError(error) {
        let message = 'Voice input error';

        switch (error) {
            case 'no-speech':
                message = 'I didn\'t hear anything. Please try speaking again.';
                break;
            case 'audio-capture':
                message = 'I can\'t access your microphone. Please check your microphone settings.';
                break;
            case 'not-allowed':
                message = 'I need permission to use your microphone. Please allow microphone access and try again.';
                break;
            case 'network':
                message = 'I\'m having trouble connecting to the internet. Please check your connection and try again.';
                break;
            default:
                message = 'Something went wrong with voice recognition. You can always type instead!';
        }

        this.speak(message, 'error');
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

    // Update button states
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

    // Create voice button
    createVoiceButton(text, callback) {
        const button = document.createElement('button');
        button.className = 'voice-btn';
        button.innerHTML = `
            <span class="voice-icon">🎤</span>
            <span class="voice-text">${text}</span>
        `;

        button.addEventListener('click', () => {
            this.startListening(callback, button);
        });

        return button;
    }

    // AI Greeting and Welcome (with toggle check)
    async welcomeUser() {
        if (!this.settings.ttsEnabled) {
            console.log('🔊 TTS disabled, skipping welcome sequence');
            return;
        }

        if (this.hasWelcomed) return; // Prevent multiple welcomes
        
        // Ensure we are on a page with a welcome screen
        if (!document.getElementById('welcome-screen')) {
            console.log('🔊 No welcome screen found, skipping welcome sequence');
            return;
        }

        this.hasWelcomed = true;

        console.log('🔊 Starting SMART AI welcome sequence...');

        // Wait a moment for the page to fully load
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.shouldAbortSequences = false;

        let welcomeMessage = "Hi there! I'm Robo Prime, your friendly AI guide! Welcome to Young AI Explorers. To begin your amazing adventure, please enter your name below!";

        // Attempt to generate a smart, dynamic welcome!
        if (window.app && window.app.chapterGenerator) {
            try {
                const prompt = `You are Robo Prime, a super enthusiastic and friendly AI guide for children learning about technology. Generate a 2-sentence welcoming greeting for a new user who just opened the 'Young AI Explorers' app. Tell them to enter their name in the box to begin. Break it into an exciting intro! Do not use quotes.`;
                const dynamicWelcome = await window.app.chapterGenerator.generateDynamicText(prompt);
                if (dynamicWelcome) {
                    welcomeMessage = dynamicWelcome;
                }
            } catch (e) {
                console.warn("Could not generate dynamic welcome, using fallback.", e);
            }
        }

        if (!this.shouldAbortSequences) {
            // Write it to the welcome screen so the user can read it!
            const welcomeLabel = document.querySelector('.name-input-section label[for="child-name"]');
            if (welcomeLabel) {
                // Keep the original label hidden or appended to
                welcomeLabel.innerHTML = `<strong>${welcomeMessage}</strong><br><br>What's your name, Explorer?`;
            }
            await this.speak(welcomeMessage, 'greeting');
        }

        console.log('🔊 Welcome sequence completed!');
    }

    // Enhance name input with voice (prevent duplicates)
    enhanceNameInput() {
        console.log('🎤 Enhancing name input with voice...');

        const nameInput = document.getElementById('child-name');
        const nameSection = document.querySelector('.name-input-section');

        if (!nameInput || !nameSection) {
            console.log('🎤 Name input elements not found (probably not on app page). skipping enhancement.');
            return;
        }

        // Check if voice button already exists to prevent duplicates
        const existingVoiceContainer = nameSection.querySelector('.voice-input-container');
        if (existingVoiceContainer) {
            console.log('🎤 Voice button already exists, skipping duplicate creation');
            return;
        }

        // Only add voice button if voice features are enabled
        if (!this.settings.ttsEnabled && !this.settings.sttEnabled) {
            console.log('🎤 Voice features disabled, skipping voice button');
            return;
        }

        // Create voice button for name input
        const voiceButton = this.createVoiceButton('Speak your name', (transcript, originalTranscript) => {
            // Clean up the transcript
            const cleanName = originalTranscript.trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            nameInput.value = cleanName;
            nameInput.focus();

            // AI responds
            this.speak(`Nice to meet you, ${cleanName}! Now click the Start button to begin your adventure!`, 'success');

            // Trigger input event
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Add voice button to the page
        const voiceContainer = document.createElement('div');
        voiceContainer.className = 'voice-input-container';
        voiceContainer.appendChild(voiceButton);

        // Insert after the input field
        nameInput.parentNode.insertBefore(voiceContainer, nameInput.nextSibling);

        // Helper text is now in HTML, no need to create duplicate

        console.log('🎤 Name input enhanced with voice successfully!');
    }

    // Enhance quiz with voice
    enhanceQuizInput(questionContainer, callback) {
        if (!this.settings.sttEnabled) return;

        const voiceButton = this.createVoiceButton('🎤 Speak answer', (transcript, originalTranscript) => {
            callback(transcript, originalTranscript);
        });

        // Add voice button to quiz
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'voice-quiz-container';
        buttonContainer.appendChild(voiceButton);

        questionContainer.appendChild(buttonContainer);
    }

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('voiceSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('voiceSettings', JSON.stringify(this.settings));
    }

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();

        // Re-select voice if preference changed
        if (newSettings.preferredVoice) {
            this.selectBestVoice();
        }

        // Update voice buttons visibility
        this.updateVoiceButtonsVisibility();
    }

    // Update voice buttons visibility based on settings
    updateVoiceButtonsVisibility() {
        const voiceButtons = document.querySelectorAll('.voice-btn, .voice-input-container');
        voiceButtons.forEach(button => {
            if (this.settings.sttEnabled || this.settings.ttsEnabled) {
                button.style.display = '';
            } else {
                button.style.display = 'none';
            }
        });
    }

    // Add voice narration to any text content
    addVoiceNarration(textElement, text, type = 'info') {
        if (!this.settings.ttsEnabled) return;

        // Create voice narration button
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'voice-narration-btn';
        voiceBtn.innerHTML = '🔊 Listen';
        voiceBtn.title = 'Click to hear this section read aloud';

        voiceBtn.addEventListener('click', () => {
            this.speak(text, type);
        });

        // Add button near the text
        if (textElement.parentNode) {
            const container = document.createElement('div');
            container.className = 'voice-narration-container';
            container.appendChild(voiceBtn);
            textElement.parentNode.insertBefore(container, textElement.nextSibling);
        }
    }

    // Connect to existing theme settings voice toggle
    connectToThemeSettingsToggle() {
        const existingToggle = document.getElementById('voice-input-effect');
        if (existingToggle) {
            // Update the toggle state to match current settings
            existingToggle.checked = this.settings.voiceEnabled;

            // Add event listener to existing toggle
            existingToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                this.updateSettings({
                    voiceEnabled: enabled,
                    ttsEnabled: enabled,
                    sttEnabled: enabled
                });

                if (enabled) {
                    this.speak('Voice assistant enabled! I can now speak and listen to help you learn!', 'success');
                } else {
                    this.stopSpeaking();
                }
            });

            console.log('🎤🔊 Connected to existing theme settings voice toggle');
        } else {
            console.warn('🎤🔊 Theme settings voice toggle not found, retrying...');
            setTimeout(() => this.connectToThemeSettingsToggle(), 1000);
        }
    }

    // Check if voice features are available
    isAvailable() {
        return {
            stt: !!this.recognition && this.settings.sttEnabled,
            tts: !!this.synthesis && this.settings.ttsEnabled,
            both: !!this.recognition && !!this.synthesis && this.settings.voiceEnabled
        };
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }
}

// Initialize the comprehensive voice system
function initializeVoiceSystem() {
    console.log('🎤🔊 Initializing Comprehensive Voice System...');

    const voiceSystem = new VoiceSystem();
    window.voiceSystem = voiceSystem;

    // Start welcome sequence on first user interaction to bypass browser autoplay policies
    const handleFirstInteraction = () => {
        // Only welcome if they are still on the welcome screen
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            voiceSystem.welcomeUser();
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Delay setup slightly to ensure DOM is fully ready
    const setupInteractions = () => {
        setTimeout(() => {
            voiceSystem.enhanceNameInput();
            voiceSystem.connectToThemeSettingsToggle();
            document.addEventListener('click', handleFirstInteraction);
            document.addEventListener('keydown', handleFirstInteraction);
        }, 1000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInteractions);
    } else {
        setupInteractions();
    }

    console.log('🎤🔊 Comprehensive Voice System loaded and ready!');
    return voiceSystem;
}

// Initialize immediately
initializeVoiceSystem();

// Connect to existing theme settings voice toggle when DOM is ready
function connectToExistingVoiceToggle() {
    if (window.voiceSystem) {
        window.voiceSystem.connectToThemeSettingsToggle();
    }
}

// Connect to existing toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(connectToExistingVoiceToggle, 2000);
    });
} else {
    setTimeout(connectToExistingVoiceToggle, 2000);
}
