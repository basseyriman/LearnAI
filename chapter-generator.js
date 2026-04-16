// Enhanced Chapter Generation System for Unlimited AI Topics
class ChapterGenerator {
    constructor() {
        this.baseChapters = this.getBaseChapters();
        this.additionalTopics = this.getAdditionalTopics();
        this.loadTopicsFromStorage(); // Added missing persistence call
        this.imageGenerator = new ImageGenerator();
    }

    // Base chapters (existing ones)
    getBaseChapters() {
        return [
            "Computer Vision - Teaching Computers to See",
            "Speech Recognition - Teaching Computers to Listen",
            "AI Translation - Breaking Language Barriers",
            "AI Decision Making - Smart Choices",
            "AI in Healthcare - Helping Doctors Help You",
            "AI in Games - Your Smart Playing Partner",
            "Self-Driving Cars - Cars That Drive Themselves"
        ];
    }

    // Extended list of AI topics for unlimited content
    getAdditionalTopics() {
        return [
            "Machine Learning - How Computers Learn",
            "Natural Language Processing - Understanding Human Language",
            "Robotics - AI Bodies in the Real World",
            "Recommendation Systems - AI That Knows What You Like",
            "Facial Recognition - AI That Remembers Faces",
            "Virtual Assistants - AI Friends That Help",
            "AI in Art - Creative Computers",
            "AI in Music - Computers That Compose",
            "AI in Sports - Smart Athletic Analysis",
            "AI in Agriculture - Farming with Intelligence",
            "AI in Weather Prediction - Forecasting the Future",
            "AI in Space Exploration - Robots Among the Stars",
            "AI in Education - Personalized Learning",
            "AI in Transportation - Smart Traffic Systems",
            "AI in Banking - Secure Money Management",
            "AI in Shopping - Smart Retail Experiences",
            "AI in Social Media - Understanding Online Behavior",
            "AI Ethics - Teaching Computers Right from Wrong",
            "AI in Environment - Protecting Our Planet",
            "AI in Manufacturing - Smart Factories",
            "AI in Cybersecurity - Digital Protection",
            "AI in Photography - Smart Camera Features",
            "AI in Food - Recipe Recommendations and Nutrition",
            "AI in Fashion - Style and Trend Prediction",
            "AI in Movies - Special Effects and Animation",
            "Neural Networks - How AI Brains Work",
            "Deep Learning - Advanced AI Thinking",
            "AI Chatbots - Conversational Computers",
            "AI in Emergency Services - Life-Saving Technology",
            "AI in Archaeology - Discovering Ancient Secrets"
        ];
    }

    // Generate a complete chapter for any AI topic
    async generateChapter(topicTitle, childName = "Explorer") {
        console.log(`Generating SMART chapter for: ${topicTitle}`);
        const chapterContent = await this.generateSmartContent(topicTitle, childName);

        const illustrations = await this.generateIllustrations(chapterContent, childName);

        return {
            ...chapterContent,
            illustrations: illustrations,
            generated_at: new Date().toISOString()
        };
    }

    async generateSmartContent(topicTitle, childName) {
        const prompt = `You are an expert children's educational writer. Write a highly engaging, story-driven, interactive lesson about the AI topic: "${topicTitle}".
The target audience is a child named ${childName}, aged 6-12. The tone should be similar to a premium Pixar movie mixed with an inspiring storybook, full of wonder and discovery, while being factually accurate about AI.

Return the result EXACTLY as a valid JSON object with the following structure:
{
  "chapter_title": "${topicTitle}",
  "character": "Invent a cool, child-friendly AI robot or character name (e.g., Data Dan, Logic Leo)",
  "character_image": "You MUST pick exactly one of these: 'assets/characters/robo_prime.png', 'assets/characters/vision_vee.png', 'assets/characters/linky_lex.png', 'assets/characters/logic_leo.png', 'assets/characters/healo_bot.png', 'assets/characters/game_gus.png', 'assets/characters/echo_ed.png', 'assets/characters/drive_dash.png'",
  "story": "A 3-5 sentence story introducing the concept to ${childName} in a cool setting (e.g., a futuristic lab, a digital playground). Make it exciting!",
  "lesson": "A 2-3 sentence clear, easy-to-understand explanation of how the technology works.",
  "activity": "A short, engaging instruction for an activity. It MUST contain the word 'difference', 'match', or 'power' to trigger our mini-games.",
  "activity_emojis": ["A base emoji related to the activity (e.g., 🐶)", "A different 'odd one out' emoji related to the activity (e.g., 🐱)"],
  "activity_matching_pairs": [
    {"word": "Concept 1", "meaning": "Simple Meaning 1"},
    {"word": "Concept 2", "meaning": "Simple Meaning 2"},
    {"word": "Concept 3", "meaning": "Simple Meaning 3"}
  ],
  "fun_fact": "One mind-blowing, true fun fact about this technology that children would love.",
  "mini_quiz": [
    {
      "question": "A simple multiple choice question about the lesson.",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Option 2"
    },
    // add 2 more questions
  ],
  "completion_badge": "A celebratory message for finishing the chapter.",
  "score_award": { "per_quiz_answer": 10, "chapter_completion_bonus": 50 }
}

IMPORTANT: Return ONLY the raw JSON object. Do not wrap in markdown or include any other text. Avoid using quotes inside string values that would break the JSON parsing.
CRITICAL: Do NOT include the word '(Correct)' or any other hints in the quiz options. The 'answer' string must EXACTLY match one of the strings in the 'options' array (including spaces and case) so it can be verified correctly. Do not use choice letters like 'A)' or '1.' inside the option strings unless they are part of the concept. Your output must be pure JSON.`;

        try {
            const response = await fetch('/api/openai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: prompt }],
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI proxy error: ${response.status}`);
            }

            const data = await response.json();
            let contentStr = data.choices[0].message.content;

            // Clean up markdown wrapping if present
            if (contentStr.startsWith("```json")) {
                contentStr = contentStr.replace(/^```json\n/, "").replace(/\n```$/, "");
            } else if (contentStr.startsWith("```")) {
                contentStr = contentStr.replace(/^```\n/, "").replace(/\n```$/, "");
            }

            const content = JSON.parse(contentStr);
            console.log(`Successfully generated smart content for ${topicTitle}`);
            return content;

        } catch (error) {
            console.error("Failed to generate smart content via OpenAI, falling back:", error);
            return this.createTemplateContent(topicTitle, childName);
        }
    }

    // Generic method to generate a short snippet of dynamic text
    async generateDynamicText(promptText) {
        try {
            const response = await fetch('/api/openai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: promptText }],
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI proxy error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Failed to generate dynamic text:", error);
            return null;
        }
    }

    // Generate a highly personalized greeting
    async generateDynamicGreeting(childName) {
        const prompt = `You are Robo Prime, a super enthusiastic and friendly AI guide for children learning about technology. Generate a 2-sentence welcoming greeting for a child named ${childName}. Sound energetic, encouraging, and ready for an adventure. Do not use quotes around the text.`;
        return await this.generateDynamicText(prompt);
    }

    // Generate context-aware praise
    async generateDynamicPraise(childName, context = "getting a quiz question right") {
        const prompt = `You are Robo Prime, an enthusiastic AI tutor. Generate a 1-sentence encouraging praise message for a child named ${childName} who just succeeded in: ${context}. Make it sound high-tech but extremely friendly and rewarding. Do not use quotes around the text.`;
        return await this.generateDynamicText(prompt);
    }

    // Fallback template content creation
    async createTemplateContent(topicTitle, childName) {
        const topicInfo = this.getTopicInfo(topicTitle);

        return {
            chapter_title: topicTitle,
            character: topicInfo.character + " the AI",
            story: this.generateStory(topicInfo, childName),
            lesson: this.generateLesson(topicInfo),
            activity: this.generateActivity(topicInfo),
            fun_fact: this.generateFunFact(topicInfo),
            mini_quiz: this.generateQuiz(topicInfo),
            completion_badge: `Amazing work, ${childName}! You are now a ${topicInfo.expertTitle}!`,
            score_award: {
                per_quiz_answer: 10,
                chapter_completion_bonus: 50
            }
        };
    }

    // Enhanced topic-specific information with dynamic generation
    getTopicInfo(topicTitle) {
        // Defensive check: ensure topicTitle is a string
        if (typeof topicTitle !== 'string') {
            console.warn('⚠️ getTopicInfo called with non-string:', topicTitle);
            topicTitle = String(topicTitle || 'AI Topic');
        }

        // First check predefined topics
        const predefinedTopics = this.getPredefinedTopicMap();
        if (predefinedTopics[topicTitle]) {
            return predefinedTopics[topicTitle];
        }

        // Generate dynamic topic info for custom topics
        return this.generateTopicInfo(topicTitle);
    }

    getPredefinedTopicMap() {
        return {
            "Machine Learning - How Computers Learn": {
                mainConcept: "machine learning",
                character: "Maya",
                setting: "school computer lab",
                expertTitle: "Machine Learning Detective",
                keyWords: ["patterns", "learning", "data", "predictions"],
                realExample: "recommendation systems on streaming platforms",
                funFact: "Machine learning algorithms can learn to play video games better than humans in just a few hours!"
            },
            "Natural Language Processing - Understanding Human Language": {
                mainConcept: "natural language processing",
                character: "Alex",
                setting: "library",
                expertTitle: "Language AI Specialist",
                keyWords: ["words", "sentences", "meaning", "understanding"],
                realExample: "chatbots and virtual assistants",
                funFact: "NLP systems can now understand sarcasm and jokes in text messages!"
            },
            "Robotics - AI Bodies in the Real World": {
                mainConcept: "robotics",
                character: "Sam",
                setting: "robotics workshop",
                expertTitle: "Robotics Engineer",
                keyWords: ["movement", "sensors", "actions", "physical"],
                realExample: "robot vacuum cleaners",
                funFact: "Some robots can now do backflips and dance better than many humans!"
            },
            "AI in Art - Creative Computers": {
                mainConcept: "AI art generation",
                character: "Luna",
                setting: "art studio",
                expertTitle: "Digital Art Pioneer",
                keyWords: ["creativity", "images", "styles", "generation"],
                realExample: "AI-generated paintings and digital art",
                funFact: "AI can now create artwork in the style of famous painters like Van Gogh in seconds!"
            },
            "AI in Music - Computers That Compose": {
                mainConcept: "AI music composition",
                character: "Diego",
                setting: "music studio",
                expertTitle: "AI Music Composer",
                keyWords: ["melody", "rhythm", "composition", "harmony"],
                realExample: "AI-generated background music for videos",
                funFact: "AI has composed symphonies that professional musicians can't tell apart from human compositions!"
            },
            "AI in Agriculture - Farming with Intelligence": {
                mainConcept: "AI in agriculture",
                character: "Rosa",
                setting: "smart farm",
                expertTitle: "Smart Farming Expert",
                keyWords: ["crops", "monitoring", "optimization", "sustainability"],
                realExample: "drone crop monitoring systems",
                funFact: "AI can predict crop diseases days before farmers can see them with their eyes!"
            },
            "AI in Hospitality Food Business": {
                mainConcept: "AI in hospitality and food service",
                character: "Chef Marco",
                setting: "smart restaurant kitchen",
                expertTitle: "Culinary AI Specialist",
                keyWords: ["recipes", "preferences", "inventory", "service"],
                realExample: "AI-powered menu recommendations",
                funFact: "AI can predict what food you'll love based on your past orders with 95% accuracy!"
            },
            "AI Chatbots - Conversational Computers": {
                mainConcept: "AI chatbots and conversational AI",
                character: "Chatter Bot",
                setting: "vibrant communication hub",
                expertTitle: "Chatbot Architect",
                keyWords: ["conversation", "replies", "questions", "meaning"],
                realExample: "customer support agents and virtual friends",
                funFact: "The first chatbot, ELIZA, was created way back in 1966!"
            },
            "AI in Emergency Services - Life-Saving Technology": {
                mainConcept: "AI in emergency response",
                character: "Rescue Rob",
                setting: "futuristic command center",
                expertTitle: "Emergency Tech Hero",
                keyWords: ["rescue", "sirens", "helping", "safety"],
                realExample: "AI drones for finding lost hikers",
                funFact: "AI can help firefighters see through thick smoke using special thermal cameras!"
            },
            "AI in Archaeology - Discovering Ancient Secrets": {
                mainConcept: "AI in archaeology and history",
                character: "Digger Dash",
                setting: "ancient pyramid dig site",
                expertTitle: "Digital Archaeologist",
                keyWords: ["artifacts", "history", "scanning", "discovery"],
                realExample: "using AI to find hidden temples in the jungle",
                funFact: "AI recently helped discover thousands of new ancient sites in the Amazon rainforest!"
            }
        };
    }

    // Generate topic info for custom topics
    generateTopicInfo(topicTitle) {
        const children = ["Alex", "Maya", "Sam", "Luna", "Diego", "Rosa", "Kai", "Zara", "Omar", "Nia"];
        const robotNames = ["Spark", "Bolt", "Glow", "Nexus", "Orion", "Pixel", "Nova", "Flux", "Titan", "Aura"];
        const settings = ["tech lab", "smart office", "innovation center", "research facility", "community center", "modern classroom", "digital workshop", "floating sky-station", "crystal garden"];

        // Extract key concepts from topic title
        const titleLower = topicTitle.toLowerCase();
        let mainConcept = "artificial intelligence";
        let keyWords = ["smart", "learning", "helpful", "technology"];
        let realExample = "smart assistants";
        let funFact = "AI is revolutionizing this field in amazing ways!";
        let setting = settings[Math.floor(Math.random() * settings.length)];
        let expertTitle = "AI Specialist";
        let robotCharacter = robotNames[Math.floor(Math.random() * robotNames.length)];

        // Customize based on topic keywords
        if (titleLower.includes('food') || titleLower.includes('restaurant') || titleLower.includes('hospitality')) {
            mainConcept = "AI in food and hospitality";
            keyWords = ["recipes", "preferences", "service", "quality"];
            realExample = "smart menu recommendations";
            funFact = "AI can create new recipes by analyzing thousands of flavor combinations!";
            setting = "smart restaurant";
            expertTitle = "Culinary AI Expert";
        } else if (titleLower.includes('health') || titleLower.includes('medical')) {
            mainConcept = "AI in healthcare";
            keyWords = ["diagnosis", "treatment", "monitoring", "care"];
            realExample = "medical imaging analysis";
            funFact = "AI can detect diseases in medical scans faster than human doctors!";
            setting = "medical center";
            expertTitle = "Medical AI Specialist";
        } else if (titleLower.includes('education') || titleLower.includes('learning')) {
            mainConcept = "AI in education";
            keyWords = ["personalized", "adaptive", "tutoring", "assessment"];
            realExample = "adaptive learning platforms";
            funFact = "AI tutors can adapt to each student's learning style in real-time!";
            setting = "smart classroom";
            expertTitle = "Educational AI Expert";
        } else if (titleLower.includes('art') || titleLower.includes('creative')) {
            mainConcept = "AI in creative arts";
            keyWords = ["creativity", "generation", "style", "inspiration"];
            realExample = "AI-generated artwork";
            funFact = "AI can create art in any style by learning from thousands of masterpieces!";
            setting = "digital art studio";
            expertTitle = "Creative AI Artist";
        } else if (titleLower.includes('business') || titleLower.includes('finance')) {
            mainConcept = "AI in business";
            keyWords = ["automation", "analytics", "efficiency", "insights"];
            realExample = "business intelligence systems";
            funFact = "AI can predict market trends and help businesses make smarter decisions!";
            setting = "smart office";
            expertTitle = "Business AI Analyst";
        } else if (titleLower.includes('space') || titleLower.includes('universe') || titleLower.includes('star')) {
            mainConcept = "AI in space exploration";
            keyWords = ["navigation", "planets", "astronomy", "discovery"];
            realExample: "Mars rover autonomous navigation";
            funFact = "AI helps telescopes find new planets in faraway solar systems by looking at tiny changes in starlight!";
            setting = "space station";
            expertTitle = "Galactic AI Explorer";
        } else if (titleLower.includes('sport') || titleLower.includes('soccer') || titleLower.includes('game')) {
            mainConcept = "AI in sports and athletics";
            keyWords = ["performance", "tactics", "tracking", "improvement"];
            realExample: "smart player tracking systems";
            funFact = "AI can analyze an athlete's movement 1,000 times per second to help them get better!";
            setting = "smart stadium";
            expertTitle = "Sports AI Coach";
        } else if (titleLower.includes('animal') || titleLower.includes('nature') || titleLower.includes('vet')) {
            mainConcept = "AI in animal care and nature";
            keyWords = ["behavior", "wildlife", "conservation", "health"];
            realExample: "wildlife tracking collars";
            funFact = "AI can identify individual animals in the wild just by looking at their unique markings!";
            setting = "nature sanctuary";
            expertTitle = "Wildlife AI Guardian";
        } else if (titleLower.includes('music') || titleLower.includes('song') || titleLower.includes('sound')) {
            mainConcept = "AI in music and sound";
            keyWords = ["rhythm", "melody", "composition", "harmony"];
            realExample: "AI song generator";
            funFact = "AI can listen to a few notes and finish a whole song in the style of any famous composer!";
            setting = "digital music studio";
            expertTitle = "AI Maestro";
        } else if (titleLower.includes('fashion') || titleLower.includes('clothes') || titleLower.includes('style')) {
            mainConcept = "AI in fashion and style";
            keyWords = ["trends", "design", "shopping", "outfits"];
            realExample: "personalized style assistants";
            funFact = "AI can predict which clothes will be popular next year by looking at millions of photos!";
            setting = "future fashion house";
            expertTitle = "AI Style Icon";
        }

        return {
            mainConcept,
            character: robotCharacter, // This is the mascot
            childExplorer: children[Math.floor(Math.random() * children.length)],
            setting,
            expertTitle,
            keyWords,
            realExample,
            funFact
        };
    }

    // Generate engaging, topic-specific story
    generateStory(topicInfo, childName) {
        const storyTemplates = [
            `Meet ${topicInfo.character}, a curious student just like you! One day at the ${topicInfo.setting}, ${topicInfo.character} discovered something amazing about ${topicInfo.mainConcept}. While exploring, they noticed how computers could ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]} in ways that seemed almost magical. "How does this work?" ${topicInfo.character} wondered aloud. Suddenly, Robo appeared with a friendly smile, ready to explain this incredible technology. "Great question!" said Robo. "This is ${topicInfo.mainConcept} - it's like giving computers special abilities to ${topicInfo.keyWords[2]} and ${topicInfo.keyWords[3]}! You use this technology every day with ${topicInfo.realExample}. Want to learn how it works?" ${topicInfo.character} nodded excitedly, ready to discover the secrets of AI!`,

            `${childName}, imagine if you could teach a computer to be as smart as your best friend! That's exactly what ${topicInfo.character} thought when they first learned about ${topicInfo.mainConcept} at the ${topicInfo.setting}. While working on a project, ${topicInfo.character} realized that computers could actually ${topicInfo.keyWords[0]} from examples, just like how you learn to ride a bike or play a game. Robo popped up on the screen, wearing a tiny graduation cap. "You're thinking like a real AI scientist!" Robo cheered. "${topicInfo.mainConcept} is all about teaching computers to ${topicInfo.keyWords[1]} and make ${topicInfo.keyWords[2]} decisions. It's the same technology that powers ${topicInfo.realExample}!" ${topicInfo.character} was amazed at how AI was already part of their daily life.`,

            `At the ${topicInfo.setting}, ${topicInfo.character} was working on an exciting project about ${topicInfo.mainConcept}. "${childName}, look at this!" ${topicInfo.character} called out excitedly. "I just learned that computers can help with ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]} in ways I never imagined!" Robo materialized beside them, his LED eyes glowing with enthusiasm. "That's right!" Robo explained. "${topicInfo.mainConcept} is revolutionizing how we approach ${topicInfo.keyWords[2]} and ${topicInfo.keyWords[3]}. Just look at ${topicInfo.realExample} - it's changing everything!" ${topicInfo.character} couldn't wait to learn more about this amazing technology.`
        ];

        return storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    }

    // Generate simple lesson
    generateLesson(topicInfo) {
        return `${topicInfo.mainConcept} is teaching computers to ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]}, helping them make smart decisions just like humans do.`;
    }

    // Generate interactive activity
    generateActivity(topicInfo) {
        const activities = [
            `Let's play "${topicInfo.keyWords[0]} Detective"! Look at the patterns and examples below, then predict what comes next - just like how ${topicInfo.mainConcept} learns from data!`,
            `Try the "Smart ${topicInfo.keyWords[1]} Challenge"! Help the AI make decisions by choosing the best options from the examples shown.`,
            `Play "Pattern Master"! Identify the ${topicInfo.keyWords[2]} in these examples to understand how ${topicInfo.mainConcept} works.`
        ];

        return activities[Math.floor(Math.random() * activities.length)];
    }

    // Generate fun fact
    generateFunFact(topicInfo) {
        return topicInfo.funFact;
    }

    // Generate quiz questions
    generateQuiz(topicInfo) {
        return [
            {
                question: `What is ${topicInfo.mainConcept}?`,
                options: [
                    `Teaching computers to ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]}`,
                    "Making computers faster",
                    "Building bigger computers",
                    "Connecting computers to the internet"
                ],
                answer: `Teaching computers to ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]}`
            },
            {
                question: `True or False: ${topicInfo.mainConcept} helps computers make smart decisions.`,
                options: ["True", "False"],
                answer: "True"
            },
            {
                question: `Which of these uses ${topicInfo.mainConcept}?`,
                options: [
                    topicInfo.realExample,
                    "Paper books",
                    "Wooden chairs",
                    "Glass windows"
                ],
                answer: topicInfo.realExample
            }
        ];
    }

    // Generate proper illustration prompts for each section
    async generateIllustrations(chapterData, playerName = "") {
        const topicInfo = this.getTopicInfo(chapterData.chapter_title);

        return [
            {
                section: "story",
                description: `A warm, diverse scene showing ${topicInfo.character}, a child with curly hair and bright clothes, at a ${topicInfo.setting} with modern computers and friendly robot assistants. The setting includes diverse children in the background, natural lighting, and colorful, welcoming environment. The robot has expressive LED eyes and a helpful posture.`,
                prompt: this.createIllustrationPrompt("story", topicInfo, chapterData.story, playerName),
                storyText: chapterData.story
            },
            {
                section: "lesson",
                description: `An educational diagram showing diverse children of different ethnicities working alongside friendly AI robots. The scene depicts ${topicInfo.keyWords[0]} and ${topicInfo.keyWords[1]} concepts through colorful, simple visual metaphors that children can understand. Include speech bubbles and thought clouds.`,
                prompt: this.createIllustrationPrompt("lesson", topicInfo, chapterData.lesson, playerName),
                storyText: chapterData.lesson
            },
            {
                section: "activity",
                description: `An interactive game interface showing children from different backgrounds participating in a ${topicInfo.keyWords[2]} activity. The scene includes game elements, progress indicators, and collaborative learning with both human children and robot helpers in a playground or classroom setting.`,
                prompt: this.createIllustrationPrompt("activity", topicInfo, chapterData.activity, playerName),
                storyText: chapterData.activity
            },
            {
                section: "fun_fact",
                description: `A wonder-filled illustration showing amazed children of various ethnicities looking at impressive demonstrations of ${topicInfo.mainConcept}. Include floating fact bubbles, sparkles, and expressions of awe and curiosity. The robot guide points to amazing examples with enthusiasm.`,
                prompt: this.createIllustrationPrompt("fun_fact", topicInfo, chapterData.fun_fact, playerName),
                storyText: chapterData.fun_fact
            },
            {
                section: "mini_quiz",
                description: `A classroom scene with diverse students raising hands enthusiastically while a friendly robot teacher conducts a quiz about ${topicInfo.mainConcept}. Include question marks, light bulbs for ideas, and a supportive learning environment with children helping each other.`,
                prompt: this.createIllustrationPrompt("mini_quiz", topicInfo, `Quiz about ${topicInfo.mainConcept}`, playerName),
                storyText: `Quiz time! Test your knowledge about ${topicInfo.mainConcept}`
            }
        ];
    }

    // Create detailed illustration prompts for image generation
    createIllustrationPrompt(section, topicInfo, content, playerName = "") {
        const baseStyle = "Soft 3D/2.5D cartoon style, Pixar-like warmth, rounded shapes, expressive faces, big friendly eyes. ";
        const themeFusion = "Bible storybook illustration meets futuristic AI lab. Magical glowing atmosphere. ";
        const childName = playerName ? playerName : "the child";
        const characterDetail = `${childName}, a diverse explorer (6-12 yrs) in curious pose, wearing AI accessories (hologram wristband, smart backpack). `;
        const robotDetail = `The AI mascot, ${topicInfo.character}, is a smooth metallic robot with a digital LED face showing child-friendly emotions, projecting a glowing hologram. `;
        const environmentDetail = `A futuristic setting with holographic data trees, floating code symbols, and soft cinematic lighting. `;

        const context = content ? content.substring(0, 300) : "";

        switch (section) {
            case "story":
                return baseStyle + themeFusion + characterDetail + robotDetail + environmentDetail +
                    `Scene: ${topicInfo.character} is welcoming and guiding the learner. ${context}.`;

            case "lesson":
                return baseStyle + themeFusion + robotDetail + environmentDetail +
                    `Educational scene: The robot teacher transforms into a learning tool to explain ${topicInfo.mainConcept}. ${context}.`;

            case "activity":
                return baseStyle + themeFusion + characterDetail + robotDetail + environmentDetail +
                    `Interactive activity: The child and robot work together in an AI playground. ${context}.`;

            case "fun_fact":
                return baseStyle + themeFusion + characterDetail + robotDetail + environmentDetail +
                    `Amazing discovery: Glowing sparks of information fly around as ${topicInfo.character} shows a holographic example. ${context}.`;

            case "mini_quiz":
                return baseStyle + themeFusion + robotDetail + environmentDetail +
                    `Quiz time: A supportive learning environment with floating lightbulbs and question marks.`;

            default:
                return baseStyle + themeFusion + characterDetail + robotDetail + environmentDetail + `General adventure scene for ${topicInfo.mainConcept}.`;
        }
    }

    // Get all available topics (base + additional)
    getAllTopics() {
        return [...this.baseChapters, ...this.additionalTopics];
    }

    // Add custom topic
    addCustomTopic(topicTitle) {
        if (!this.additionalTopics.includes(topicTitle)) {
            this.additionalTopics.push(topicTitle);
            this.saveTopicsToStorage();
        }
    }

    // Save topics to local storage
    saveTopicsToStorage() {
        localStorage.setItem('customAITopics', JSON.stringify(this.additionalTopics));
    }

    // Load topics from local storage
    loadTopicsFromStorage() {
        const saved = localStorage.getItem('customAITopics');
        if (saved) {
            try {
                const savedTopics = JSON.parse(saved);
                // Deduplicate while merging
                savedTopics.forEach(topic => {
                    if (!this.additionalTopics.includes(topic)) {
                        this.additionalTopics.push(topic);
                    }
                });
            } catch (e) {
                console.error("Failed to load custom topics:", e);
                localStorage.removeItem('customAITopics'); // Clear corrupted data
            }
        }
    }
}

// Image Generation Integration
class ImageGenerator {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/images/generations'; // Example endpoint
        this.fallbackImages = this.createFallbackImages();
    }

    // Generate image using AI service
    async generateImage(prompt, section) {
        try {
            // In a real implementation, you would call an actual image generation API
            // For now, we'll simulate with a placeholder system
            return await this.simulateImageGeneration(prompt, section);
        } catch (error) {
            console.warn('Image generation failed, using fallback:', error);
            return this.getFallbackImage(section);
        }
    }

    // Simulate image generation (replace with real API call)
    async simulateImageGeneration(prompt, section) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return a data URL for a colored rectangle as placeholder
        // In production, this would return the actual generated image URL
        const colors = {
            story: '#FF6B6B',
            lesson: '#4ECDC4',
            activity: '#45B7D1',
            fun_fact: '#96CEB4',
            mini_quiz: '#FFEAA7'
        };

        const color = colors[section] || '#DDD';
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.lightenColor(color, 20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Comic Neue, cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Generated Illustration', 200, 140);
        ctx.font = '12px Comic Neue, cursive';
        ctx.fillText(prompt.substring(0, 50) + '...', 200, 170);

        return {
            url: canvas.toDataURL(),
            prompt: prompt,
            generated: true
        };
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

    // Create fallback images for when generation fails
    createFallbackImages() {
        return {
            story: {
                url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23FF6B6B" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">Story Scene</text></svg>',
                description: 'Colorful story illustration placeholder'
            },
            lesson: {
                url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%234ECDC4" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">Learning Diagram</text></svg>',
                description: 'Educational diagram placeholder'
            },
            activity: {
                url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%2345B7D1" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">Activity Game</text></svg>',
                description: 'Interactive activity placeholder'
            },
            fun_fact: {
                url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%2396CEB4" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">Amazing Fact</text></svg>',
                description: 'Fun fact illustration placeholder'
            },
            mini_quiz: {
                url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23FFEAA7" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">Quiz Time</text></svg>',
                description: 'Quiz illustration placeholder'
            }
        };
    }

    // Get fallback image
    getFallbackImage(section) {
        return this.fallbackImages[section] || this.fallbackImages.story;
    }
}

// Export for use in main app
window.ChapterGenerator = ChapterGenerator;
window.ImageGenerator = ImageGenerator;
