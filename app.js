// Young AI Explorers - Enhanced Application Logic with Unlimited Chapters
class AILearningApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.playerName = '';
        this.totalScore = 0;
        this.currentChapter = null;
        this.currentSection = 0;
        this.chapterScore = 0;
        this.completedChapters = new Set();
        this.unlockedRobots = new Set();
        this.quizAnswers = [];
        this.sections = ['story', 'lesson', 'activity', 'funfact', 'quiz', 'completion'];
        this.chapterGenerator = new ChapterGenerator();
        this.generatedChapters = new Map();
        this.isGeneratingChapter = false;
        this.enhancedImageGenerator = new EnhancedImageGenerator();

        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadCompletedChapters();
        this.updateTotalScore();
        this.updateTopicCounter();

        // Initialize voice-to-text for name input after DOM is ready
        setTimeout(() => {
            if (window.voiceSystem) {
                window.voiceSystem.enhanceNameInput();
            }
        }, 100);
    }

    bindEvents() {
        // Welcome screen events
        document.getElementById('start-adventure').addEventListener('click', () => {
            this.startAdventure();
        });

        document.getElementById('child-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startAdventure();
            }
        });

        // Greeting screen events
        document.getElementById('continue-to-menu').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Menu screen events
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showMenu();
        });
    }

    async startAdventure() {
        const name = document.getElementById('child-name').value.trim();
        if (name) {
            this.playerName = name;
            this.saveProgress();

            this.showGreeting();
        } else {
            // AI speaks the error message - high priority
            if (window.voiceSystem) {
                window.voiceSystem.speak('Oops! I need to know your name first. Please enter your name in the text box or click the microphone to speak it!', 'warning', 'high');
            } else {
                alert('Please enter your name first! 😊');
            }
        }
    }

    async showGreeting() {
        this.switchScreen('greeting');
        const greetingCharacter = document.getElementById('greeting-character-img');
        if (greetingCharacter) {
            greetingCharacter.src = 'assets/characters/robo_prime.png';
        }

        // Use smart dynamic content generation for the greeting
        let text = `Hi ${this.playerName}! I'm Robo Prime, your lead AI explorer! I'm so excited to help you discover how AI works. Are you ready to see some amazing things?`;

        try {
            document.getElementById('greeting-text').innerHTML = `<span style="opacity: 0.5;">Robo Prime is thinking of a special greeting for you...</span>`;
            const dynamicGreeting = await this.chapterGenerator.generateDynamicGreeting(this.playerName);
            if (dynamicGreeting) {
                text = dynamicGreeting;
            }
        } catch (e) {
            console.error("Failed to generate dynamic greeting:", e);
        }

        this.typeSyncWithVoice(text, 'greeting-text');
    }

    typeSyncWithVoice(displayText, elementId, speechText = null) {
        const textToSpeak = speechText || displayText;
        if (window.voiceSystem && window.voiceSystem.settings.ttsEnabled) {
            // Start speaking, and when audio starts, sync typing to duration
            window.voiceSystem.speak(textToSpeak, 'chat', 'normal', this.currentChapter?.character, (duration) => {
                this.typeText(elementId, displayText, duration, true);
            });
        } else {
            // Fallback: regular typing if voice is off
            this.typeText(elementId, displayText, 30);
        }
    }

    showMainMenu() {
        this.showMenu();
    }

    showMenu() {
        this.switchScreen('menu');

        // Update player name and score display
        document.getElementById('player-name').textContent = this.playerName;
        document.getElementById('total-score').textContent = this.totalScore;

        // AI introduces the menu
        if (window.voiceSystem) {
            window.voiceSystem.speak(`Welcome to the main menu, ${this.playerName}! Here you can see all the amazing AI topics available to explore.`, 'info');
        }

        // Render Robot Rewards!
        this.renderRobotRewards();

        // Load chapters
        this.loadChapters();
    }

    loadChapters() {
        const chaptersGrid = document.getElementById('chapters-grid');
        chaptersGrid.innerHTML = '';

        // Load base chapters from original data
        const baseChapters = getAllChapters();
        baseChapters.forEach((chapter, index) => {
            const chapterCard = this.createChapterCard(chapter, index, 'base');
            chaptersGrid.appendChild(chapterCard);
        });

        // Load unlimited additional topics
        const additionalTopics = this.chapterGenerator.getAllTopics().slice(7); // Skip first 7 (base chapters)
        additionalTopics.forEach((topicTitle, index) => {
            const chapterCard = this.createDynamicChapterCard(topicTitle, index + 7);
            chaptersGrid.appendChild(chapterCard);
        });

        // Add "Create New Topic" card
        const createCard = this.createNewTopicCard();
        chaptersGrid.appendChild(createCard);
    }

    createChapterCard(chapter, index, type = 'base') {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        if (type === 'dynamic') card.classList.add('dynamic-chapter');

        if (this.completedChapters.has(index)) {
            card.classList.add('completed');
        }

        const thumb = this.getTopicThumbnail(chapter.chapter_title);
        const img = thumb || chapter.character_image || 'assets/characters/robo_prime.png';

        card.innerHTML = `
            <img src="${img}" alt="${chapter.character}" class="card-buddy-img" style="border-radius: 15px; object-fit: cover;">
            <h3>${chapter.chapter_title}</h3>
            <p class="chapter-description">${chapter.lesson.substring(0, 100)}...</p>
            ${this.completedChapters.has(index) ? '<p class="chapter-status">✅ Completed!</p>' : ''}
            <div class="generation-indicator hidden" id="gen-base-${index}">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="progress-fill-base-${index}"></div>
                </div>
                <p id="progress-text-base-${index}">Initializing AI Core...</p>
            </div>
        `;

        card.addEventListener('click', () => {
            if (type === 'base') {
                this.startDynamicChapter(chapter.chapter_title, `base-${index}`);
            } else {
                this.startChapter(index, type);
            }
        });

        return card;
    }

    createDynamicChapterCard(topicTitle, index) {
        const card = document.createElement('div');
        card.className = 'chapter-card dynamic-chapter';

        if (this.completedChapters.has(index)) {
            card.classList.add('completed');
        }

        let cardImageHTML = '';
        const isGenerated = this.generatedChapters.has(index);

        if (isGenerated) {
            const chap = this.generatedChapters.get(index);
            if (chap.illustrations && chap.illustrations.length > 0) {
                const img = chap.illustrations[0].imageUrl;
                cardImageHTML = `<img src="${img}" id="img-topic-${index}" alt="AI Buddy" class="card-buddy-img" style="border-radius: 15px; object-fit: cover;">`;
            }
        }

        if (!cardImageHTML) {
            const thumbnailPath = this.getTopicThumbnail(topicTitle);
            if (thumbnailPath) {
                cardImageHTML = `<img src="${thumbnailPath}" id="img-topic-${index}" alt="${topicTitle}" class="card-buddy-img" style="border-radius: 15px; object-fit: cover;">`;
            } else {
                // Use premium shimmer placeholder for new topics while they generate
                cardImageHTML = `<div class="card-placeholder" id="placeholder-topic-${index}"></div>`;

                // Immediately generate a local placeholder with the correct topic colors/icons
                // This will be replaced by the DALL-E image later if available
                setTimeout(async () => {
                    const topicInfo = this.chapterGenerator.getTopicInfo(topicTitle);
                    const placeholder = await this.enhancedImageGenerator.generatePlaceholderImage("", "story", topicInfo);
                    const el = document.getElementById(`placeholder-topic-${index}`);
                    if (el) {
                        const img = document.createElement('img');
                        img.src = placeholder.url;
                        img.className = 'card-buddy-img';
                        img.id = `img-topic-${index}`;
                        img.style.borderRadius = '15px';
                        img.style.objectFit = 'cover';
                        el.parentNode.replaceChild(img, el);
                    }
                }, 0);
            }
        }

        card.innerHTML = `
            ${cardImageHTML}
            <h3>${topicTitle}</h3>
            <p class="chapter-description">Explore this exciting AI topic with personalized content!</p>
            ${this.completedChapters.has(index) ? '<p class="chapter-status">✅ Completed!</p>' : ''}
            <div class="generation-indicator hidden" id="gen-${index}">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="progress-fill-${index}"></div>
                </div>
                <p id="progress-text-${index}">Initializing AI Core...</p>
            </div>
        `;

        card.addEventListener('click', () => {
            this.startDynamicChapter(topicTitle, index);
        });

        return card;
    }

    createNewTopicCard() {
        const card = document.createElement('div');
        card.className = 'chapter-card new-topic-card';

        card.innerHTML = `
            <div class="chapter-icon" style="filter: grayscale(100%) opacity(50%);">➕</div>
            <h3>Create New Topic</h3>
            <p class="chapter-description">Add your own AI topic to explore!</p>
            <input type="text" class="new-topic-input" placeholder="Enter AI topic..." maxlength="50">
            <button class="add-topic-btn">Add Topic 🚀</button>
        `;

        const input = card.querySelector('.new-topic-input');
        const button = card.querySelector('.add-topic-btn');

        button.addEventListener('click', () => {
            this.addNewTopic(input.value.trim());
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewTopic(input.value.trim());
            }
        });

        return card;
    }

    getChapterDescription(index) {
        const descriptions = [
            'helps computers see and understand images',
            'enables computers to understand human speech',
            'breaks down language barriers worldwide',
            'makes smart decisions and choices',
            'assists doctors in caring for patients',
            'creates intelligent gaming experiences',
            'powers self-driving vehicles'
        ];
        return descriptions[index] || 'works in amazing ways';
    }

    getRobotForIndex(index) {
        const robots = [
            'assets/thumbnails/machine_learning.png',
            'assets/thumbnails/computer_vision.png',
            'assets/thumbnails/speech_recognition.png',
            'assets/thumbnails/ai_translation.png',
            'assets/thumbnails/ai_decision_making.png',
            'assets/thumbnails/ai_healthcare.png',
            'assets/thumbnails/ai_games.png',
            'assets/thumbnails/self_driving_cars.png'
        ];
        return robots[index % robots.length];
    }

    async startChapter(chapterIndex, type = 'base') {
        // If type is base, we shouldn't even reach here anymore since we rerouted to startDynamicChapter
        // but just in case:
        if (type === 'base') {
            this.currentChapter = getChapter(chapterIndex);
        } else {
            // For dynamic chapters (including rerouted base), we load the fully generated content
            this.currentChapter = this.generatedChapters.get(chapterIndex);
        }

        this.currentSection = 0;
        this.chapterScore = 0;
        this.quizAnswers = [];

        if (!this.currentChapter) {
            alert('Chapter not found!');
            return;
        }

        // Sanitize quiz options to remove "(Correct)" hints so children learn by doing!
        if (this.currentChapter.mini_quiz) {
            this.currentChapter.mini_quiz.forEach(q => {
                if (q.options) {
                    q.options = q.options.map(opt => String(opt).replace(/\(Correct\)/gi, '').trim());
                }
                if (q.answer) {
                    q.answer = String(q.answer).replace(/\(Correct\)/gi, '').trim();
                }
                if (q.correct_answer) {
                    q.correct_answer = String(q.correct_answer).replace(/\(Correct\)/gi, '').trim();
                }
            });
        }

        // Ensure illustrations exist and have images for base chapters
        const needsImages = type !== 'dynamic' && (!this.currentChapter.illustrations ||
            this.currentChapter.illustrations.length < 5 ||
            this.currentChapter.illustrations.some(ill => !ill.imageUrl));

        if (needsImages) {
            console.log('🖼️ Illustrations incomplete or missing images, generating on the fly...');
            try {
                this.currentChapter.illustrations = await this.chapterGenerator.generateIllustrations(this.currentChapter, this.playerName);
            } catch (error) {
                console.error('🖼️ Failed to generate illustrations:', error);
                // Fallback empty illustrations to prevent crash
                this.currentChapter.illustrations = [
                    { section: 'story', description: 'Story Illustration' },
                    { section: 'lesson', description: 'Lesson Illustration' },
                    { section: 'activity', description: 'Activity Illustration' },
                    { section: 'fun_fact', description: 'Fun Fact Illustration' },
                    { section: 'quiz', description: 'Quiz Illustration' }
                ];
            }
        }

        this.switchScreen('chapter');
        document.getElementById('chapter-title').textContent = this.currentChapter.chapter_title;

        const headerMascot = document.getElementById('chapter-character-img');
        if (headerMascot) {
            headerMascot.src = this.currentChapter.character_image || 'assets/characters/robo_prime.png';
        }

        this.updateProgress();

        console.log('📖 Current chapter set to:', this.currentChapter.chapter_title);

        // AI introduces the chapter
        if (window.voiceSystem) {
            window.voiceSystem.speak(`Great choice, ${this.playerName}! Let's explore ${this.currentChapter.chapter_title} together.`, 'greeting');
        }

        this.showSection(0, true); // true = skip speech stop so the intro can play or queue
    }

    async startDynamicChapter(topicTitle, index) {
        // Check if we already have generated content for this topic
        if (this.generatedChapters.has(index)) {
            this.currentChapter = this.generatedChapters.get(index);
            this.startChapter(index, 'dynamic');
            return;
        }

        // --- IMMEDIATE UX FEEDBACK ---
        if (window.voiceSystem) {
            window.voiceSystem.speak(`Awesome! I'm crafting a custom adventure about ${topicTitle}. Hang tight!`, 'info', 'high');
        }

        this.showNotification(`Generating smart tutorial for "${topicTitle}"... 🧠🚀`);

        // Show loading indicator
        const indicator = document.getElementById(`gen-${index}`);
        const progressFill = document.getElementById(`progress-fill-${index}`) || document.getElementById(`progress-fill-base-${index}`);
        const progressText = document.getElementById(`progress-text-${index}`) || document.getElementById(`progress-text-base-${index}`);

        if (indicator) {
            indicator.classList.remove('hidden');
            if (progressFill) progressFill.style.width = '5%';
            if (progressText) progressText.textContent = 'Initializing AI Core...';
        }

        // Disable clicks while generating so the user doesn't spam
        const chaptersGrid = document.getElementById('chapters-grid');
        if (chaptersGrid) chaptersGrid.style.pointerEvents = 'none';
        document.body.style.cursor = 'wait';

        this.isGeneratingChapter = true;

        // Start a smart progress bar interval simulating thought process
        let progress = 5;
        const stages = [
            { p: 20, t: 'Brainstorming amazing ideas... 💡' },
            { p: 40, t: 'Writing a fun story... ✍️' },
            { p: 60, t: 'Adding interactive games... 🎮' },
            { p: 80, t: 'Perfecting the lesson... ✨' },
            { p: 90, t: 'Getting everything ready... 🚀' }
        ];

        let currentStageIndex = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 8; // Random burst of progress
                if (progress > 90) progress = 90;
                if (progressFill) progressFill.style.width = `${progress}%`;

                // Find the highest stage reached
                for (let i = stages.length - 1; i >= 0; i--) {
                    if (progress >= stages[i].p) {
                        if (currentStageIndex !== i) {
                            currentStageIndex = i;
                            if (progressText) progressText.textContent = stages[i].t;
                        }
                        break;
                    }
                }
            }
        }, 500);

        try {
            // Generate new chapter content
            const generatedChapter = await this.chapterGenerator.generateChapter(topicTitle, this.playerName);
            const topicInfo = this.chapterGenerator.getTopicInfo(topicTitle);

            // Transition to the chapter screen IMMEDIATELY after text is ready
            // Images will load in the background
            clearInterval(progressInterval);
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = 'Adventure Ready! 🎉';

            // Wait just a tiny moment so they see the 100%
            await new Promise(resolve => setTimeout(resolve, 300));

            // Store generated chapter
            this.generatedChapters.set(index, generatedChapter);
            this.currentChapter = generatedChapter;

            // Restore UX
            if (indicator) indicator.classList.add('hidden');
            if (chaptersGrid) chaptersGrid.style.pointerEvents = 'auto';
            document.body.style.cursor = 'default';

            this.isGeneratingChapter = false;
            this.startChapter(index, 'dynamic');
            this.generateDynamicImagesInBackground(generatedChapter, topicTitle, 0, index);
        } catch (error) {
            console.error('Failed to generate chapter:', error);
            alert('Sorry, there was an error generating this chapter. Please try again!');

            clearInterval(progressInterval);
            if (indicator) indicator.classList.add('hidden');
            if (chaptersGrid) chaptersGrid.style.pointerEvents = 'auto';
            document.body.style.cursor = 'default';

            this.isGeneratingChapter = false;
        }
    }

    // Generate heavy DALL-E images in the background so the UI doesn't freeze
    async generateDynamicImagesInBackground(generatedChapter, topicTitle, startIndex = 0, globalIndex = null) {
        const topicInfo = this.chapterGenerator.getTopicInfo(topicTitle);

        // Parallelize but with a staggered delay to prevent hitting OpenAI concurrency limits too hard
        for (let i = startIndex; i < generatedChapter.illustrations.length; i++) {
            // Wait slightly longer for each subsequent image to avoid 429 errors
            const staggeredDelay = i * 2000;

            (async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, staggeredDelay));
                    const illustration = generatedChapter.illustrations[i];
                    if (illustration.imageUrl) return; // Skip if already done

                    const storyText = illustration.storyText || illustration.prompt;
                    const imageData = await this.enhancedImageGenerator.generateImage(storyText, illustration.section, topicInfo);

                    illustration.imageUrl = imageData.url;
                    illustration.generated = imageData.generated;
                    illustration.provider = imageData.provider;

                    // LIVE UPDATE: If this is the first image (thumbnail), update the main menu card!
                    if (i === 0 && globalIndex !== null) {
                        const placeholder = document.getElementById(`placeholder-topic-${globalIndex}`);
                        const existingImg = document.getElementById(`img-topic-${globalIndex}`);

                        if (placeholder) {
                            const newImg = document.createElement('img');
                            newImg.src = imageData.url;
                            newImg.id = `img-topic-${globalIndex}`;
                            newImg.alt = topicTitle;
                            newImg.className = 'card-buddy-img';
                            newImg.style.borderRadius = '15px';
                            newImg.style.objectFit = 'cover';
                            placeholder.parentNode.replaceChild(newImg, placeholder);
                        } else if (existingImg) {
                            existingImg.src = imageData.url;
                        }
                    }

                    // If we are currently looking at this section, refresh the illustration
                    if (this.currentChapter === generatedChapter && this.currentSection === i) {
                        this.loadIllustration(`${this.sections[i]}-illustration`, illustration);
                    }
                } catch (error) {
                    console.error(`Background image generation failed for section ${i}:`, error);
                }
            })();
        }
    }

    addNewTopic(topicTitle) {
        if (!topicTitle || topicTitle.length < 3) {
            alert('Please enter a valid AI topic (at least 3 characters)');
            return;
        }

        // Add to generator
        this.chapterGenerator.addCustomTopic(topicTitle);

        // Refresh the chapters display
        this.loadChapters();

        // Update topic counter
        this.updateTopicCounter();

        // Find the index of the newly added topic in the total list
        const topicIndex = this.chapterGenerator.baseChapters.length + this.chapterGenerator.additionalTopics.length - 1;
        this.startDynamicChapter(topicTitle, topicIndex);
    }

    // Update topic counter display
    updateTopicCounter() {
        const counter = document.getElementById('topic-counter');
        if (counter) {
            const totalTopics = this.chapterGenerator.getAllTopics().length;
            counter.textContent = `${totalTopics}+ Topics Available`;
        }
    }

    showSection(sectionIndex, skipStop = false) {
        // Stop any current speech when moving to a new section, unless skipped
        if (window.voiceSystem && !skipStop) {
            window.voiceSystem.stopSpeaking();
        }

        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.add('hidden'));

        // Show current section
        const sectionName = this.sections[sectionIndex];
        const sectionElement = document.getElementById(`${sectionName}-section`);

        if (sectionElement) {
            sectionElement.classList.remove('hidden');
            this.loadSectionContent(sectionName, sectionIndex);
        }

        this.updateProgress();
    }

    loadSectionContent(sectionName, sectionIndex) {
        if (!this.currentChapter) {
            console.warn('⚠️ No chapter loaded for section:', sectionName);
            return;
        }

        // Ensure illustrations exists
        if (!this.currentChapter.illustrations) {
            console.warn('⚠️ No illustrations found for chapter:', this.currentChapter.chapter_title);
            // Don't crash, just proceed without illustrations if possible or show fallback
            this.currentChapter.illustrations = [];
        }

        const illustrations = this.currentChapter.illustrations;

        switch (sectionName) {
            case 'story':
                const storyText = this.currentChapter.story || '';
                this.typeSyncWithVoice(storyText, 'story-text');
                this.loadIllustration('story-illustration', illustrations[0]);
                break;

            case 'lesson':
                const lessonText = this.currentChapter.lesson || '';
                this.typeSyncWithVoice(lessonText, 'lesson-text');
                this.loadIllustration('lesson-illustration', illustrations[1]);
                break;

            case 'activity':
                const activityText = this.currentChapter.activity || '';
                this.typeSyncWithVoice(activityText, 'activity-text');
                this.loadIllustration('activity-illustration', illustrations[2]);
                this.createActivityInterface();
                break;

            case 'funfact':
                const ffText = this.currentChapter.fun_fact || '';
                this.typeSyncWithVoice(ffText, 'funfact-text', `Did you know? ${ffText}`);
                this.loadIllustration('funfact-illustration', illustrations[3]);
                break;

            case 'quiz':
                this.loadIllustration('quiz-illustration', illustrations[4]);
                this.displayQuizQuestion();
                break;
        }
    }

    loadIllustration(elementId, illustration) {
        const element = document.getElementById(elementId);
        if (element && illustration) {
            if (illustration.imageUrl) {
                // If the user wants to see the short description as a caption, we can use it, but NOT the full prompt.
                // For a cleaner look, let's omit the caption to avoid spilling text into the layout.
                element.innerHTML = `
                    <img src="${illustration.imageUrl}" alt="AI Illustration" class="generated-illustration" />
                `;
            } else {
                element.innerHTML = `
                    <div class="glowing-placeholder">
                        <div class="spinner" style="width:30px;height:30px;border-width:3px;margin-bottom:15px;display:block;"></div>
                        Generating Art...
                    </div>
                `;
            }
        }
    }

    createActivityInterface() {
        const activityArea = document.getElementById('activity-area');
        const activityText = (this.currentChapter.activity || '').toLowerCase();

        this.activityState = {}; // Reset state

        let activityHtml = `<h4>🎯 Interactive Activity</h4>`;

        if (activityText.includes('difference') || activityText.includes('two pictures') || activityText.includes('pixel')) {
            let baseIcon = '🌟';
            let oddIcon = '⭐';

            // Use the SMART dynamically generated emojis from AI if available
            if (this.currentChapter.activity_emojis && this.currentChapter.activity_emojis.length >= 2) {
                baseIcon = this.currentChapter.activity_emojis[0];
                oddIcon = this.currentChapter.activity_emojis[1];
            } else {
                const icons = ['🤖', '💻', '🔍', '⚙️', '🌟'];
                baseIcon = icons[Math.floor(Math.random() * icons.length)];
                oddIcon = baseIcon + '✨';
            }

            let grid = [];
            for (let i = 0; i < 5; i++) grid.push({ icon: baseIcon, isOdd: false });
            grid.push({ icon: oddIcon, isOdd: true });
            grid.sort(() => Math.random() - 0.5);

            activityHtml += `
                <div class="spot-difference-activity">
                    <p style="margin-bottom: 15px; font-weight: 600; color: #6c5ce7;">Can you spot the unique AI element?</p>
                    <div class="activity-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        ${grid.map(item => `
                            <div class="activity-item-box" onclick="app.checkDifferenceItem(${item.isOdd}, this)">
                                ${item.icon}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (activityText.includes('match') || activityText.includes('connect')) {
            let pairs = [{ word: 'AI', meaning: 'Smart Brains' }, { word: 'Data', meaning: 'Information' }, { word: 'Robot', meaning: 'Helper' }];
            const title = this.currentChapter.chapter_title.toLowerCase();

            // Use SMART dynamically generated matching pairs from AI!
            if (this.currentChapter.activity_matching_pairs && this.currentChapter.activity_matching_pairs.length >= 3) {
                // Takes the top 3 items to make the game fit the screen nicely
                pairs = this.currentChapter.activity_matching_pairs.slice(0, 3);
            } else if (title.includes('vision')) {
                pairs = [{ word: 'Vision', meaning: 'Seeing' }, { word: 'Pixel', meaning: 'Dot' }, { word: 'Camera', meaning: 'Eye' }];
            } else if (title.includes('speech')) {
                pairs = [{ word: 'Speech', meaning: 'Talking' }, { word: 'Microphone', meaning: 'Listening' }, { word: 'Sound', meaning: 'Wave' }];
            } else if (title.includes('translation')) {
                pairs = [{ word: 'Translate', meaning: 'Convert' }, { word: 'Language', meaning: 'Words' }, { word: 'Bridge', meaning: 'Connect' }];
            }

            let leftCol = pairs.map((p, i) => ({ text: p.word, id: i })).sort(() => Math.random() - 0.5);
            let rightCol = pairs.map((p, i) => ({ text: p.meaning, id: i })).sort(() => Math.random() - 0.5);

            this.activityState = { totalPairs: pairs.length, matchedPairs: 0, selectedLeft: null, selectedRight: null };

            activityHtml += `
                <div class="matching-activity">
                    <p>Match the Concepts!</p>
                    <div class="match-columns" style="display: flex; gap: 20px; margin-top: 20px;">
                        <div class="match-col" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                            ${leftCol.map(item => `<button class="match-btn left-btn" data-id="${item.id}" onclick="app.selectMatchItem(this, 'left')" style="padding: 15px; border-radius: 10px; border: 2px solid #6c5ce7; background: white; cursor: pointer; font-family: inherit; font-size: 1rem; transition: 0.2s;">${item.text}</button>`).join('')}
                        </div>
                        <div class="match-col" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                            ${rightCol.map(item => `<button class="match-btn right-btn" data-id="${item.id}" onclick="app.selectMatchItem(this, 'right')" style="padding: 15px; border-radius: 10px; border: 2px solid #6c5ce7; background: white; cursor: pointer; font-family: inherit; font-size: 1rem; transition: 0.2s;">${item.text}</button>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            this.activityState = { clicksNeeded: 5, currentClicks: 0 };
            activityHtml += `
                <div class="challenge-activity" style="text-align: center;">
                    <p>Power up the AI Core!</p>
                    <div style="width: 100%; height: 30px; background: rgba(0,0,0,0.1); border-radius: 15px; margin: 20px 0; overflow: hidden; border: 2px solid rgba(255,255,255,0.5);">
                        <div id="ai-power-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00b894, #00cec9); transition: width 0.3s;"></div>
                    </div>
                    <button class="quiz-option" onclick="app.powerUpAI(this)" style="font-size: 1.2em; padding: 15px 30px;">Tap to Power Up! ⚡</button>
                </div>
            `;
        }

        activityArea.innerHTML = activityHtml;
    }

    checkDifferenceItem(isCorrect, element) {
        if (isCorrect) {
            element.classList.add('correct');
            if (window.voiceSystem) window.voiceSystem.speak('You found it! Great eye!', 'success', 'normal', this.currentChapter.character);
            this.showNotification("Great eye! You found it! 🔍", "success");
            setTimeout(() => this.completeActivity(), 1500);
        } else {
            element.classList.add('wrong');
            setTimeout(() => {
                element.classList.remove('wrong');
            }, 500);
        }
    }

    selectMatchItem(element, side) {
        if (element.classList.contains('matched')) return;

        // Clear previous selection on the same side
        document.querySelectorAll(`.match-btn.${side}-btn:not(.matched)`).forEach(btn => {
            btn.classList.remove('selected', 'wrong');
        });

        // Highlight new selection
        element.classList.add('selected');

        if (side === 'left') this.activityState.selectedLeft = element;
        if (side === 'right') this.activityState.selectedRight = element;

        // Check for match
        if (this.activityState.selectedLeft && this.activityState.selectedRight) {
            const leftId = this.activityState.selectedLeft.getAttribute('data-id');
            const rightId = this.activityState.selectedRight.getAttribute('data-id');

            if (leftId === rightId) {
                // Match
                this.activityState.selectedLeft.classList.replace('selected', 'matched');
                this.activityState.selectedRight.classList.replace('selected', 'matched');

                if (window.voiceSystem) window.voiceSystem.speak('Great match!', 'success', 'normal', this.currentChapter.character);

                this.activityState.matchedPairs++;
                if (this.activityState.matchedPairs >= this.activityState.totalPairs) {
                    this.showNotification("Perfect matching! You're an expert! 🎓", "success");
                    setTimeout(() => this.completeActivity(), 1500);
                }
            } else {
                // No match
                const l = this.activityState.selectedLeft;
                const r = this.activityState.selectedRight;
                l.classList.add('wrong');
                r.classList.add('wrong');

                setTimeout(() => {
                    l.classList.remove('selected', 'wrong');
                    r.classList.remove('selected', 'wrong');
                }, 800);
            }

            // Reset selection state
            this.activityState.selectedLeft = null;
            this.activityState.selectedRight = null;
        }
    }

    powerUpAI(btn) {
        this.activityState.currentClicks++;
        const percent = (this.activityState.currentClicks / this.activityState.clicksNeeded) * 100;
        document.getElementById('ai-power-bar').style.width = `${percent}%`;

        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);

        if (this.activityState.currentClicks >= this.activityState.clicksNeeded) {
            btn.disabled = true;
            btn.textContent = 'Fully Powered! 🌟';
            btn.style.background = '#00b894';
            setTimeout(() => this.completeActivity(), 1500);
        }
    }

    async completeActivity() {
        let message = `Great job ${this.playerName}! You completed the activity!`;

        try {
            const dynamicPraise = await this.chapterGenerator.generateDynamicPraise(this.playerName, "completing the hands-on activity");
            if (dynamicPraise) {
                message = dynamicPraise;
            }
        } catch (e) {
            console.error("Failed to generate dynamic praise:", e);
        }

        // AI celebrates activity completion
        if (window.voiceSystem && window.voiceSystem.settings.ttsEnabled) {
            window.voiceSystem.speak(`${message} You're doing amazing! Ready for the next section?`, 'success');
        } else {
            alert(`${message} 🎉`);
        }
        // In a real implementation, this would handle specific activities
    }

    // Enhanced quiz handling with scoring and voice support
    submitQuizAnswer(selectedLetter) {
        const currentQuestion = this.currentChapter.mini_quiz[this.quizAnswers.length];

        // Derive the selected option text from the letter (A => index 0, B => index 1)
        const optionIndex = selectedLetter.charCodeAt(0) - 65;
        const selectedOptionText = currentQuestion.options[optionIndex] || selectedLetter;

        // More robust matching: check full text, then check if answer is just the letter
        const correctAnswerText = String(currentQuestion.answer || currentQuestion.correct_answer || '').trim().toLowerCase();
        const selectedText = String(selectedOptionText || '').trim().toLowerCase();
        
        // Standard check: Does the selected text match the answer text?
        let isCorrect = selectedText === correctAnswerText;
        
        // Fallback check: Did the AI provide the answer as a letter (e.g., "A")?
        if (!isCorrect && correctAnswerText.length === 1) {
            isCorrect = selectedLetter.toLowerCase() === correctAnswerText;
        }
        
        // Final fuzzy check: Does the answer text contain the option text or vice versa?
        if (!isCorrect && correctAnswerText.length > 3) {
            isCorrect = correctAnswerText.includes(selectedText) || selectedText.includes(correctAnswerText);
        }

        this.quizAnswers.push({
            question: currentQuestion.question,
            selected: selectedOptionText,
            correct: currentQuestion.answer || currentQuestion.correct_answer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            this.chapterScore += this.currentChapter.score_award.per_quiz_answer;
            this.totalScore += this.currentChapter.score_award.per_quiz_answer;
        }

        this.displayQuizResult(isCorrect, currentQuestion.answer || currentQuestion.correct_answer);
        this.updateTotalScore();
    }

    // Handle voice quiz answer
    handleVoiceQuizAnswer(spokenAnswer, originalTranscript) {
        const currentQuestion = this.currentChapter.mini_quiz[this.quizAnswers.length];
        const options = currentQuestion.options;

        // Try to match spoken answer to quiz options
        let selectedAnswer = null;

        // Check for exact matches first
        for (let i = 0; i < options.length; i++) {
            if (options[i].toLowerCase().includes(spokenAnswer) ||
                spokenAnswer.includes(options[i].toLowerCase())) {
                selectedAnswer = String.fromCharCode(65 + i); // Convert to A, B, C
                break;
            }
        }

        // Check for letter answers (A, B, C)
        if (!selectedAnswer) {
            const letterMatch = spokenAnswer.match(/[abc]/i);
            if (letterMatch) {
                selectedAnswer = letterMatch[0].toUpperCase();
            }
        }

        // Check for number answers (1, 2, 3)
        if (!selectedAnswer) {
            const numberMatch = spokenAnswer.match(/[123]/);
            if (numberMatch) {
                const num = parseInt(numberMatch[0]);
                if (num >= 1 && num <= 3) {
                    selectedAnswer = String.fromCharCode(64 + num); // Convert 1,2,3 to A,B,C
                }
            }
        }

        if (selectedAnswer) {
            // Highlight the selected option
            const optionIndex = selectedAnswer.charCodeAt(0) - 65;
            const optionButtons = document.querySelectorAll('.quiz-option');
            if (optionButtons[optionIndex]) {
                optionButtons[optionIndex].classList.add('selected');
            }

            // Show confirmation and submit
            if (window.voiceSystem) {
                window.voiceSystem.showNotification(`You selected: ${options[optionIndex]}`, 'success');
            }

            setTimeout(() => {
                this.submitQuizAnswer(selectedAnswer);
            }, 1500);
        } else {
            // Could not match the answer
            if (window.voiceSystem) {
                window.voiceSystem.showNotification(`Could not match "${originalTranscript}". Please try again or click an option.`, 'warning');
            }
        }
    }

    // Display current quiz question with voice support
    displayQuizQuestion() {
        const question = this.currentChapter.mini_quiz[this.quizAnswers.length];

        const quizContainer = document.getElementById('quiz-container');

        if (!quizContainer) {
            console.error('❌ quiz-container not found!');
            return;
        }

        quizContainer.innerHTML = `
            <div class="quiz-question">
            <h4>Question ${this.quizAnswers.length + 1} of ${this.currentChapter.mini_quiz.length}</h4>
            <p>${question.question}</p>
            <div class="quiz-options">
                ${question.options.map((option, index) =>
            `<button class="quiz-option" onclick="app.submitQuizAnswer('${String.fromCharCode(65 + index)}')">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </button>`
        ).join('')}
            </div>
        </div>
        `;

        // AI reads the question aloud
        if (window.voiceSystem) {
            const questionText = `Question ${this.quizAnswers.length + 1}: ${question.question}. Your options are: ${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}, ${opt}`).join('. ')}.`;
            window.voiceSystem.speak(questionText, 'info');
        }

        // Add voice input button if voice system is available and enabled
        if (window.voiceSystem && window.voiceSystem.isAvailable().stt) {
            const questionContainer = quizContainer.querySelector('.quiz-question');
            window.voiceSystem.enhanceQuizInput(questionContainer, (spokenAnswer, originalTranscript) => {
                this.handleVoiceQuizAnswer(spokenAnswer, originalTranscript);
            });
        }
    }

    async displayQuizResult(isCorrect, correctAnswer) {
        const resultContainer = document.getElementById('quiz-results');
        if (!resultContainer) {
            // Fallback if quiz-container needs specific result div
            const quizArea = document.getElementById('quiz-container');
            if (quizArea) {
                const resDiv = document.createElement('div');
                resDiv.id = 'quiz-results';
                quizArea.appendChild(resDiv);
            }
        }

        const finalResultContainer = document.getElementById('quiz-results');

        if (isCorrect) {
            finalResultContainer.innerHTML = `
                <div class="quiz-result correct">
                    <h4>🎉 Correct!</h4>
                    <p>Great job! You earned ${this.currentChapter.score_award.per_quiz_answer} points!</p>
                    <p id="quiz-ai-feedback" style="font-style: italic; color: #00b894; margin-top: 10px;"></p>
                </div>
            `;

            let celebration = `Excellent work, ${this.playerName}! That's absolutely correct!`;
            try {
                const dynamicPraise = await this.chapterGenerator.generateDynamicPraise(this.playerName, "getting a quiz question absolutely correct");
                if (dynamicPraise) celebration = dynamicPraise;
            } catch (e) {
                console.error("Failed to generate quiz praise:", e);
            }
            
            this.typeSyncWithVoice(celebration, 'quiz-ai-feedback');

        } else {
            finalResultContainer.innerHTML = `
                <div class="quiz-result incorrect">
                    <h4>❌ Not quite!</h4>
                    <p>The correct answer was: <strong>${correctAnswer}</strong></p>
                    <p id="quiz-ai-feedback" style="font-style: italic; color: #e17055; margin-top: 10px;"></p>
                </div>
            `;

            let encouragement = `That's okay, ${this.playerName}! The correct answer was ${correctAnswer}. Learning is all about trying!`;
            try {
                const dynamicEncourage = await this.chapterGenerator.generateDynamicPraise(this.playerName, "trying really hard but missing a quiz question. Tell them the correct answer is " + correctAnswer);
                if (dynamicEncourage) encouragement = dynamicEncourage;
            } catch (e) {
                console.error("Failed to generate quiz encouragement:", e);
            }
            
            this.typeSyncWithVoice(encouragement, 'quiz-ai-feedback');
        }

        // Show next question or complete quiz
        setTimeout(() => {
            if (this.quizAnswers.length < this.currentChapter.mini_quiz.length) {
                this.displayQuizQuestion();
            } else {
                // Check if displayQuizComplete exists, if not use finishQuiz
                if (typeof this.displayQuizComplete === 'function') {
                    this.displayQuizComplete();
                } else {
                    this.finishQuiz();
                }
            }
        }, 3000);
    }

    completeChapter() {
        // Add completion bonus
        const bonus = this.currentChapter.score_award.chapter_completion_bonus || 50;
        this.chapterScore += bonus;
        this.totalScore += bonus;

        // Mark chapter as completed
        // Find index of current chapter in base data if it exists
        const baseChapters = getAllChapters();
        const chapterIndex = baseChapters.findIndex(ch => ch.chapter_title === this.currentChapter.chapter_title);

        let badgeIdentifier = null;

        if (chapterIndex !== -1) {
            this.completedChapters.add(chapterIndex);

            // Unlock gamification robot for completing the base chapter
            badgeIdentifier = this.currentChapter.character_image;
        } else {
            // It's a dynamic chapter, let's unlock based on its index
            let dynamicIndex = null;
            for (let [key, val] of this.generatedChapters.entries()) {
                if (val === this.currentChapter) {
                    dynamicIndex = key;
                    break;
                }
            }
            if (dynamicIndex !== null) {
                this.completedChapters.add(dynamicIndex);

                // Grant them the generated DALL-E image if it exists, otherwise grab our premium local thumbnail
                if (this.currentChapter.illustrations && this.currentChapter.illustrations.length > 0) {
                    badgeIdentifier = this.currentChapter.illustrations[0].imageUrl;
                } else {
                    const titleFallback = this.currentChapter.chapter_title || "AI Topic";
                    badgeIdentifier = this.getTopicThumbnail(titleFallback);

                    // Final fallback to DiceBear if not in premium set
                    if (!badgeIdentifier) {
                        const seed = encodeURIComponent(titleFallback);
                        badgeIdentifier = `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}&radius=20&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
                    }
                }
            }
        }

        if (badgeIdentifier && !this.unlockedRobots.has(badgeIdentifier)) {
            this.unlockedRobots.add(badgeIdentifier);
            this.showNotification(`You unlocked a new Reward Badge! 🏆`, 'success');
        }

        // Show the user the physical badge on the completion screen!
        setTimeout(() => {
            const badgeImg = document.getElementById('completion-badge-img');
            const badgeEmoji = document.getElementById('completion-badge-emoji');
            const badgeTrophy = document.getElementById('completion-trophy');

            if (badgeIdentifier) {
                if (badgeTrophy) badgeTrophy.style.display = 'none';

                if (badgeIdentifier.startsWith('EMOJI:')) {
                    if (badgeEmoji) {
                        badgeEmoji.textContent = badgeIdentifier.replace('EMOJI:', '');
                        badgeEmoji.style.display = 'block';
                    }
                    if (badgeImg) badgeImg.style.display = 'none';
                } else {
                    if (badgeImg) {
                        badgeImg.src = badgeIdentifier;
                        badgeImg.style.display = 'block';
                    }
                    if (badgeEmoji) badgeEmoji.style.display = 'none';
                }
            }
        }, 50);

        // Save progress
        this.saveProgress();
        this.updateTotalScore();

        // Show completion section
        this.showSection(5); // Completion section

        // Load completion content
        const badgeText = document.getElementById('badge-text');
        if (badgeText) {
            badgeText.textContent = this.currentChapter.completion_badge.replace('{name}', this.playerName) || `Amazing work, ${this.playerName}!`;
        }

        const cScore = document.getElementById('chapter-score');
        if (cScore) cScore.textContent = this.chapterScore;

        const totalScoreDisplay = document.getElementById('updated-total-score');
        if (totalScoreDisplay) totalScoreDisplay.textContent = this.totalScore;

        // AI celebrates
        if (window.voiceSystem) {
            window.voiceSystem.speak(`Congratulations ${this.playerName}! You've completed ${this.currentChapter.chapter_title} and earned a new badge! You're now one step closer to becoming an AI master!`, 'success');
        }
    }

    nextSection() {
        this.currentSection++;
        if (this.currentSection < this.sections.length) {
            this.showSection(this.currentSection);
        }
    }

    returnToMenu() {
        this.showMenu();
    }

    updateProgress() {
        const progressFill = document.getElementById('chapter-progress');
        const progress = ((this.currentSection + 1) / 6) * 100; // 6 total sections including completion
        progressFill.style.width = `${progress}%`;
    }

    switchScreen(screenName) {
        // Stop any current speech when switching screens
        if (window.voiceSystem) {
            window.voiceSystem.stopSpeaking();
        }

        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }

    typeText(elementId, text, speedOrDuration = 50, isDuration = false) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Abort any existing typing on this element
        if (element._typingInterval) clearInterval(element._typingInterval);
        
        element.textContent = '';

        let i = 0;
        let speed = speedOrDuration;
        
        if (isDuration && speedOrDuration > 0) {
            // Calculate speed to match duration (duration is in seconds)
            // We subtract a small buffer (500ms) to ensure text finish slightly before audio
            const totalMs = Math.max(100, (speedOrDuration * 1000) - 200);
            speed = totalMs / text.length;
        }

        element._typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(element._typingInterval);
            }
        }, speed);
    }

    saveProgress() {
        console.log('💾 Saving progress...');
        const progress = {
            playerName: this.playerName,
            totalScore: this.totalScore,
            completedChapters: Array.from(this.completedChapters),
            generatedChapters: Array.from(this.generatedChapters.entries()),
            unlockedRobots: Array.from(this.unlockedRobots)
        };
        localStorage.setItem('aiLearningProgress', JSON.stringify(progress));
    }
    updateTotalScore() {
        const scoreElements = document.querySelectorAll('#total-score, #updated-total-score');
        scoreElements.forEach(element => {
            if (element) {
                element.textContent = this.totalScore;
            }
        });
    }

    // Show notification messages
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Enhanced load progress
    loadCompletedChapters() {
        const saved = localStorage.getItem('aiLearningProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.playerName = progress.playerName || '';
            this.totalScore = progress.totalScore || 0;
            this.completedChapters = new Set(progress.completedChapters || []);
            this.unlockedRobots = new Set(progress.unlockedRobots || []);

            // Load generated chapters
            if (progress.generatedChapters) {
                this.generatedChapters = new Map(progress.generatedChapters);
            }
        }
    }

    renderRobotRewards() {
        const container = document.getElementById('rewards-container');
        if (!container) return;

        // Give it a fresh render
        container.innerHTML = '';

        if (this.unlockedRobots.size === 0) {
            container.innerHTML = `<span style="opacity: 0.5; font-size: 0.9em;">Complete chapters to unlock robots!</span>`;
            return;
        }

        // Sort them for consistent display based off filename just for visual order
        const sortedRobots = Array.from(this.unlockedRobots).sort();

        sortedRobots.forEach(badgePath => {
            if (badgePath.startsWith('EMOJI:')) {
                const span = document.createElement('div');
                span.className = 'robot-badge';
                span.style.display = 'flex';
                span.style.alignItems = 'center';
                span.style.justifyContent = 'center';
                span.style.fontSize = '1.5em';
                span.textContent = badgePath.replace('EMOJI:', '');
                span.title = "A super cool topic you mastered!";
                container.appendChild(span);
            } else {
                const img = document.createElement('img');
                img.src = badgePath;
                img.className = 'robot-badge';
                img.title = "A super cool robot you unlocked!";
                container.appendChild(img);
            }
        });
    }

    // Helper to get the premium local thumbnail for a topic
    getTopicThumbnail(topicTitle) {
        const title = topicTitle.toLowerCase();

        const mapping = {
            "computer vision": "assets/thumbnails/computer_vision.png",
            "speech recognition": "assets/thumbnails/speech_recognition.png",
            "translation": "assets/thumbnails/ai_translation.png",
            "decision making": "assets/thumbnails/ai_decision_making.png",
            "healthcare": "assets/thumbnails/ai_healthcare.png",
            "medical": "assets/thumbnails/ai_healthcare.png",
            "games": "assets/thumbnails/ai_games.png",
            "gaming": "assets/thumbnails/ai_games.png",
            "self-driving": "assets/thumbnails/self_driving_cars.png",
            "cars": "assets/thumbnails/self_driving_cars.png",
            "chatbot": "assets/thumbnails/ai_chatbots.png",
            "conversation": "assets/thumbnails/ai_chatbots.png",
            "emergency": "assets/thumbnails/ai_emergency_services.png",
            "rescue": "assets/thumbnails/ai_emergency_services.png",
            "archaeology": "assets/thumbnails/ai_archaeology.png",
            "history": "assets/thumbnails/ai_archaeology.png",
            "ethics": "assets/thumbnails/ai_ethics.png",
            "environment": "assets/thumbnails/ai_environment.png",
            "planet": "assets/thumbnails/ai_environment.png",
            "manufacturing": "assets/thumbnails/ai_manufacturing.png",
            "factory": "assets/thumbnails/ai_manufacturing.png",
            "cybersecurity": "assets/thumbnails/ai_cybersecurity.png",
            "security": "assets/thumbnails/ai_cybersecurity.png",
            "photography": "assets/thumbnails/ai_photography.png",
            "camera": "assets/thumbnails/ai_photography.png",
            "food": "assets/thumbnails/ai_food.png",
            "cooking": "assets/thumbnails/ai_food.png",
            "fashion": "assets/thumbnails/ai_fashion.png",
            "style": "assets/thumbnails/ai_fashion.png",
            "movies": "assets/thumbnails/ai_movies.png",
            "animation": "assets/thumbnails/ai_movies.png",
            "neural network": "assets/thumbnails/neural_networks.png",
            "deep learning": "assets/thumbnails/deep_learning.png",
            "machine learning": "assets/thumbnails/machine_learning.png",
            "robotics": "assets/thumbnails/robotics.png",
            "assistant": "assets/thumbnails/virtual_assistants.png",
            "art": "assets/thumbnails/ai_art.png",
            "music": "assets/thumbnails/ai_music.png",
            "sports": "assets/thumbnails/ai_sports.png",
            "agriculture": "assets/thumbnails/ai_agriculture.png",
            "farming": "assets/thumbnails/ai_agriculture.png",
            "weather": "assets/thumbnails/ai_weather.png",
            "space": "assets/thumbnails/ai_space.png",
            "education": "assets/thumbnails/ai_education.png",
            "transportation": "assets/thumbnails/ai_transportation.png",
            "banking": "assets/thumbnails/ai_banking.png",
            "finance": "assets/thumbnails/ai_banking.png",
            "shopping": "assets/thumbnails/ai_shopping.png",
            "social media": "assets/thumbnails/ai_social_media.png"
        };

        // Try fuzzy keyword match
        for (const [keyword, path] of Object.entries(mapping)) {
            if (title.includes(keyword)) {
                return path;
            }
        }

        return null;
    }
}

// Global functions for HTML onclick events
function nextSection() {
    app.nextSection();
}

function completeChapter() {
    app.completeChapter();
}

function returnToMenu() {
    app.returnToMenu();
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AI Learning App...');
    try {
        app = new AILearningApp();
        console.log('✅ AI Learning App initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize AI Learning App:', error);
    }
});

// Add some fun sound effects (optional)
function playSound(type) {
    // In a full implementation, you could add sound effects here
    console.log(`Playing ${type} sound effect`);
}

// Utility function for celebrations
function celebrate() {
    // Add confetti or celebration animation
    document.body.style.animation = 'celebration 1s ease-in-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 1000);
}
