// Enhanced Image Generation System with Real API Integration
class EnhancedImageGenerator {
    constructor() {
        this.apiProvider = localStorage.getItem('image_api_provider') || 'openai';
        this.fallbackImages = this.createFallbackImages();
        this.humanityPromptTemplates = this.createHumanityPrompts();
    }

    // Set image provider (DALL-E uses OPENAI_API_KEY on the server — run `npm start`)
    setAPIConfig(provider) {
        this.apiProvider = provider;
        localStorage.setItem('image_api_provider', provider);
    }

    // Generate human-relatable, child-friendly image with enhanced prompts
    async generateImage(storyText, section, topicInfo = null) {
        try {
            console.log('Starting image generation...', { section, provider: this.apiProvider });

            // Create detailed illustration prompt using the enhanced template
            const detailedPrompt = this.createDetailedIllustrationPrompt(storyText, section, topicInfo);

            console.log('Generated detailed prompt:', detailedPrompt.substring(0, 200) + '...');

            switch (this.apiProvider) {
                case 'openai':
                    return await this.generateWithOpenAI(detailedPrompt, section);
                case 'placeholder':
                default:
                    return await this.generatePlaceholderImage(detailedPrompt, section);
            }
        } catch (error) {
            console.error('Image generation failed, using fallback:', error);
            return this.getFallbackImage(section);
        }
    }

    // Enhanced illustration prompt creator using detailed template
    createDetailedIllustrationPrompt(storyText, section, topicInfo) {
        const baseStyle = "Soft 3D/2.5D cartoon style, Pixar-like warmth, rounded shapes, expressive faces, big friendly eyes. ";
        const themeFusion = "Bible storybook illustration meets futuristic AI lab. Magical glowing atmosphere. ";

        let mascot = "a tiny, friendly AI robot companion floating nearby";
        let environment = "A futuristic setting with holographic data trees, floating code symbols, and soft cinematic lighting.";
        let topicFocus = "";

        if (topicInfo) {
            const concept = topicInfo.mainConcept || topicInfo.title || "AI technology";
            topicFocus = `The main focus of the image is ${concept}. `;

            mascot = `${topicInfo.character}, a small helpful robot with a friendly LED face, helping in the background`;

            // Unique environment keywords based on topic - prioritizing TOPIC over mascot
            const conceptLower = concept.toLowerCase();
            if (conceptLower.includes("chatbot") || conceptLower.includes("conversation") || conceptLower.includes("speech")) {
                environment = "A vibrant communication hub with countless floating, glowing speech bubbles made of particles and holographic chat windows.";
            } else if (conceptLower.includes("emergency") || conceptLower.includes("rescue") || conceptLower.includes("life-saving") || conceptLower.includes("health")) {
                environment = "A high-tech medical or rescue command center with glowing life-sign monitors, soft blue cinematic lighting, and holographic health icons.";
            } else if (conceptLower.includes("archaeology") || conceptLower.includes("ancient") || conceptLower.includes("history") || conceptLower.includes("space")) {
                if (conceptLower.includes("space") || conceptLower.includes("star") || conceptLower.includes("planet")) {
                    environment = "A breathtaking panoramic view of deep space with glowing colorful nebulae, distant planets, and a futuristic observation deck with giant glass windows.";
                } else {
                    environment = "An ancient mysterious site at night with glowing holographic scans revealing hidden secrets beneath the ground, like golden artifacts.";
                }
            } else if (conceptLower.includes("security") || conceptLower.includes("protection") || conceptLower.includes("cyber")) {
                environment = "A secure digital fortress with glowing holographic shields, geometric padlock patterns, and protective light beams.";
            } else if (conceptLower.includes("art") || conceptLower.includes("creative") || conceptLower.includes("music")) {
                environment = "A magical digital studio where colors flow like water and musical notes glow in the air like fireflies.";
            } else if (conceptLower.includes("sport") || conceptLower.includes("game")) {
                environment = "A futuristic arena with glowing holographic scoreboards, neon-lit playing fields, and high-tech equipment.";
            }
        }

        const characterDetail = `A diverse explorer (6-12 yrs) in curious pose. `;
        const mascotDetail = `The AI companion ${mascot} is present but the focus is on the environment. `;

        return `${baseStyle} ${themeFusion} ${topicFocus} ${environment} ${characterDetail} ${mascotDetail} Scene Action: ${storyText.substring(0, 300)}`;
    }

    // Generate illustration description from template
    generateIllustrationFromTemplate(template, storyText, section, topicInfo) {
        // Extract key elements from story text and topic info
        const character = topicInfo?.character || 'Alex';
        const setting = topicInfo?.setting || 'classroom';
        const mainConcept = topicInfo?.mainConcept || 'artificial intelligence';

        // Create detailed scene description based on section type
        let sceneDescription = '';

        switch (section) {
            case 'story':
                sceneDescription = `${character}, a curious child with bright eyes and a friendly smile, discovering ${mainConcept} at a ${setting}. The scene shows ${character} interacting with a cheerful AI robot companion with glowing blue LED eyes and a helpful expression. The ${setting} is filled with modern technology, colorful learning materials, and has warm, inviting lighting. Other diverse children can be seen in the background, all engaged in learning activities.`;
                break;

            case 'lesson':
                sceneDescription = `An educational scene showing diverse children of different ethnicities gathered around a friendly AI robot teacher in a bright, modern ${setting}. The robot has expressive LED eyes and is pointing to visual diagrams explaining ${mainConcept}. Children are raising their hands enthusiastically, with speech bubbles showing their questions and understanding. The environment is filled with colorful educational posters and interactive displays.`;
                break;

            case 'activity':
                sceneDescription = `Children from various backgrounds working together on an interactive ${mainConcept} activity in a vibrant ${setting}. A helpful AI robot companion with a friendly face is guiding them through hands-on learning exercises. The scene shows collaboration, discovery, and joy as the children engage with technology. Bright colors, learning tools, and progress indicators are visible throughout the space.`;
                break;

            case 'fun_fact':
                sceneDescription = `A wonder-filled scene showing amazed children of different ethnicities with wide eyes and expressions of awe as they learn an incredible fact about ${mainConcept}. A enthusiastic AI robot with sparkling LED eyes is sharing the amazing information, surrounded by floating fact bubbles, sparkles, and visual representations of the concept. The ${setting} glows with excitement and discovery.`;
                break;

            case 'mini_quiz':
                sceneDescription = `A supportive classroom environment with diverse students enthusiastically participating in a ${mainConcept} quiz. A friendly AI robot teacher with encouraging expressions is asking questions while children raise their hands eagerly. The scene shows question marks floating in the air, light bulbs representing ideas, and a warm, collaborative learning atmosphere where everyone feels confident to participate.`;
                break;

            default:
                sceneDescription = `Children learning about ${mainConcept} with a friendly AI companion in a ${setting}, showing curiosity, engagement, and joy in discovery.`;
        }

        return `Illustration of ${sceneDescription} Cartoon-style, bright colours, child-friendly, warm and cheerful atmosphere.`;
    }

    // Legacy method for backward compatibility
    enhancePromptForChildren(basePrompt, section, topicInfo) {
        // Use the new detailed template system
        return this.createDetailedIllustrationPrompt(basePrompt, section, topicInfo);
    }

    // Generate image using OpenAI DALL-E API via CORS proxy
    async generateWithOpenAI(prompt, section) {
        try {
            console.log('Generating image with OpenAI DALL-E 3 via server...', { prompt: prompt.substring(0, 100) + '...', section });

            const response = await fetch('/api/openai/images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: prompt,
                    size: '1024x1024'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("OpenAI Proxy API Error:", errorData);
                throw new Error(`Proxy API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.url) {
                console.log('OpenAI DALL-E 3 image generated successfully via proxy!');
                return {
                    url: data.url,
                    prompt: prompt,
                    generated: true,
                    provider: data.provider || 'openai-proxy'
                };
            } else {
                throw new Error('Invalid response from Proxy API');
            }

        } catch (error) {
            console.error('OpenAI DALL-E 3 generation failed:', error.message);
            console.log('Falling back to enhanced placeholder images...');
            return await this.generatePlaceholderImage(prompt, section);
        }
    }

    // Generate enhanced placeholder image with better visuals
    async generatePlaceholderImage(prompt, section, topicInfo = null) {
        console.log('Generating enhanced placeholder image...', { section, topic: topicInfo?.chapter_title });

        // Simulate API delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Topic-specific color palettes
        const topicPalettes = {
            space: ['#1a1a2e', '#16213e'],
            security: ['#2c3e50', '#34495e'],
            health: ['#27ae60', '#2ecc71'],
            art: ['#8e44ad', '#9b59b6'],
            robotics: ['#2980b9', '#3498db'],
            nature: ['#16a085', '#1abc9c'],
            default: ['#6c5ce7', '#a29bfe']
        };

        const concept = (topicInfo?.chapter_title || topicInfo?.mainConcept || "").toLowerCase();
        let palette = topicPalettes.default;

        if (concept.includes('space') || concept.includes('star')) palette = topicPalettes.space;
        else if (concept.includes('security') || concept.includes('cyber')) palette = topicPalettes.security;
        else if (concept.includes('health') || concept.includes('doctor') || concept.includes('medicine')) palette = topicPalettes.health;
        else if (concept.includes('art') || concept.includes('creative')) palette = topicPalettes.art;
        else if (concept.includes('robot')) palette = topicPalettes.robotics;
        else if (concept.includes('environment') || concept.includes('planet')) palette = topicPalettes.nature;

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(1, palette[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Add decorative elements based on TOPIC instead of section if possible
        this.addTopicDecorativeElements(ctx, concept, section);

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px Comic Neue, cursive';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;

        const mainText = topicInfo?.chapter_title || this.getSectionTitle(section);
        ctx.fillText(mainText, 200, 140);

        ctx.font = '14px Comic Neue, cursive';
        ctx.shadowBlur = 0;
        const subtitle = topicInfo ? this.getSectionTitle(section) : 'Your AI Adventure';
        ctx.fillText(subtitle, 200, 180);

        // Add branding footer
        ctx.font = 'italic 10px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Young AI Explorers Illustration Engine', 200, 280);

        const result = {
            url: canvas.toDataURL(),
            prompt: prompt,
            generated: false,
            provider: 'enhanced-placeholder'
        };

        console.log('Enhanced placeholder image generated successfully!');
        return result;
    }

    // New topic-specific decorative elements for placeholders
    addTopicDecorativeElements(ctx, concept, section) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';

        if (concept.includes('space')) {
            // Draw stars and planet
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 400, Math.random() * 300, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(320, 80, 40, 0, Math.PI * 2);
            ctx.fill();
        } else if (concept.includes('security') || concept.includes('cyber')) {
            // Draw shield-like shapes
            ctx.beginPath();
            ctx.moveTo(200, 50);
            ctx.lineTo(250, 80);
            ctx.lineTo(250, 150);
            ctx.quadraticCurveTo(200, 200, 150, 150);
            ctx.lineTo(150, 80);
            ctx.closePath();
            ctx.fill();
        } else if (concept.includes('health')) {
            // Draw heart or plus
            ctx.font = '60px Arial';
            ctx.fillText('❤️', 300, 100);
        } else {
            // Fallback to section elements
            this.addDecorativeElements(ctx, section);
        }
    }

    // Add decorative elements to placeholder images
    addDecorativeElements(ctx, section) {
        const elements = {
            story: () => {
                // Draw book icon
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(50, 50, 60, 80);
                ctx.fillRect(55, 55, 50, 70);
            },
            lesson: () => {
                // Draw lightbulb
                ctx.beginPath();
                ctx.arc(100, 100, 25, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
            },
            activity: () => {
                // Draw play button
                ctx.beginPath();
                ctx.moveTo(80, 70);
                ctx.lineTo(80, 110);
                ctx.lineTo(120, 90);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
            },
            fun_fact: () => {
                // Draw star
                ctx.beginPath();
                ctx.moveTo(100, 60);
                ctx.lineTo(105, 75);
                ctx.lineTo(120, 75);
                ctx.lineTo(108, 85);
                ctx.lineTo(113, 100);
                ctx.lineTo(100, 90);
                ctx.lineTo(87, 100);
                ctx.lineTo(92, 85);
                ctx.lineTo(80, 75);
                ctx.lineTo(95, 75);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
            },
            mini_quiz: () => {
                // Draw question mark
                ctx.font = 'bold 40px Comic Neue, cursive';
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.textAlign = 'center';
                ctx.fillText('?', 100, 100);
            }
        };

        if (elements[section]) {
            elements[section]();
        }
    }

    // Get section title for placeholder images
    getSectionTitle(section) {
        const titles = {
            story: '📖 Story Time',
            lesson: '📚 Learning',
            activity: '🎮 Activity',
            fun_fact: '🤯 Amazing Fact',
            mini_quiz: '🧠 Quiz Time'
        };
        return titles[section] || '🤖 AI Learning';
    }

    // Create humanity-focused prompt templates
    createHumanityPrompts() {
        return {
            story: "A warm, diverse scene showing children from different ethnic backgrounds learning about AI in a welcoming environment with friendly robot helpers",
            lesson: "Educational illustration showing diverse students understanding AI concepts with visual aids and supportive robot teachers",
            activity: "Interactive learning scene with children of various backgrounds engaging in AI-related activities with helpful robot companions",
            fun_fact: "Wonder-filled scene showing amazed children from different cultures discovering exciting AI facts with enthusiastic robot guides",
            mini_quiz: "Supportive classroom environment with diverse students enthusiastically participating in an AI knowledge quiz with encouraging robot assistants"
        };
    }

    // Create enhanced fallback images
    createFallbackImages() {
        return {
            story: {
                url: this.createSVGImage('#FF6B6B', '📖 Story', 'Diverse children learning together'),
                description: 'Colorful story illustration with diverse characters'
            },
            lesson: {
                url: this.createSVGImage('#4ECDC4', '📚 Lesson', 'Educational concepts made simple'),
                description: 'Educational diagram with inclusive representation'
            },
            activity: {
                url: this.createSVGImage('#45B7D1', '🎮 Activity', 'Interactive learning fun'),
                description: 'Interactive activity with diverse participants'
            },
            fun_fact: {
                url: this.createSVGImage('#96CEB4', '🤯 Fact', 'Amazing AI discoveries'),
                description: 'Exciting fact illustration with wonder'
            },
            mini_quiz: {
                url: this.createSVGImage('#FFEAA7', '🧠 Quiz', 'Knowledge sharing time'),
                description: 'Quiz illustration with supportive environment'
            }
        };
    }

    // Create SVG image for fallbacks
    createSVGImage(color, emoji, text) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${this.lightenColor(color, 30)};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect fill="url(#grad)" width="400" height="300"/>
                <text x="200" y="120" text-anchor="middle" fill="white" font-family="Comic Neue, cursive" font-size="40">${emoji}</text>
                <text x="200" y="160" text-anchor="middle" fill="white" font-family="Comic Neue, cursive" font-size="18" font-weight="bold">${text}</text>
                <text x="200" y="180" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Comic Neue, cursive" font-size="12">Human-Centered AI Learning</text>
            </svg>
        `;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    // Helper function to lighten colors
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Get fallback image
    getFallbackImage(section) {
        return this.fallbackImages[section] || this.fallbackImages.story;
    }

    // Check if API is configured
    isAPIConfigured() {
        return this.apiProvider === 'openai';
    }

    // Get available providers
    getAvailableProviders() {
        return [
            { id: 'openai', name: 'OpenAI DALL-E (server key)', requiresKey: false },
            { id: 'placeholder', name: 'Enhanced Placeholders', requiresKey: false }
        ];
    }
}

// API Configuration UI
class APIConfigurationUI {
    constructor(imageGenerator) {
        this.imageGenerator = imageGenerator;
        this.modal = null;
    }

    // Show API configuration modal
    showConfigModal() {
        this.createModal();
        this.modal.classList.add('show');
    }

    // Create configuration modal
    createModal() {
        if (this.modal) {
            this.modal.remove();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'api-config-modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎨 Image Generation Settings</h3>
                    <button class="close-btn" onclick="this.closest('.api-config-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Configure image generation to get beautiful, human-relatable illustrations for your AI learning stories!</p>
                    
                    <div class="provider-selection">
                        <label>Choose Image Provider:</label>
                        <select id="provider-select">
                            <option value="placeholder">Enhanced Placeholders (Free)</option>
                            <option value="openai">OpenAI DALL-E (uses server <code>.env</code> key)</option>
                        </select>
                    </div>
                    <p class="voice-helper-text" style="margin-top: 10px; font-size: 12px; opacity: 0.85;">
                        DALL-E requires <code>npm start</code> and <code>OPENAI_API_KEY</code> in <code>.env</code> — explorers never type a key.
                    </p>
                    
                    <div class="preview-section">
                        <h4>What you'll get:</h4>
                        <ul>
                            <li>✅ Diverse, inclusive characters</li>
                            <li>✅ Child-friendly, safe content</li>
                            <li>✅ Educational and inspiring scenes</li>
                            <li>✅ Human-AI collaboration themes</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="this.closest('.api-config-modal').remove()">Cancel</button>
                    <button class="save-btn" onclick="apiConfigUI.saveConfiguration()">Save Settings</button>
                </div>
            </div>
        `;

        const providerSelect = this.modal.querySelector('#provider-select');
        providerSelect.value = this.imageGenerator.apiProvider;

        document.body.appendChild(this.modal);
    }

    // Save configuration
    saveConfiguration() {
        const provider = this.modal.querySelector('#provider-select').value;

        this.imageGenerator.setAPIConfig(provider);

        const message = provider === 'openai'
            ? 'OpenAI DALL-E selected. Ensure the server is running with OPENAI_API_KEY in .env.'
            : 'Enhanced placeholders configured! You\'ll get beautiful placeholder images.';

        app.showNotification(message, 'success');

        this.modal.remove();
    }
}

// Export for use in main app
window.EnhancedImageGenerator = EnhancedImageGenerator;
window.APIConfigurationUI = APIConfigurationUI;
