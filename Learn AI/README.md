<div align="center">
  <img src="https://raw.githubusercontent.com/basseyriman/LearnAI/main/assets/characters/robo_prime.png" alt="Young AI Explorers Logo" width="200"/>
  
  # ✨ Young AI Explorers

  **Helping the Next Generation Understand Artificial Intelligence**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-FCE300)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![AI Powered](https://img.shields.io/badge/AI_Powered-OpenAI_GPT--4o--mini-4AA08E)](https://openai.com/)

  [Try the Interactive Demo](http://localhost:3000/young-ai-explorers) | [View the Landing Page](landing.html)

  ---
</div>

## 🚀 The Platform Goal

**Young AI Explorers** is an interactive, voice-first educational web application built from the ground up to break complex artificial intelligence concepts into engaging, digestible adventures for children aged 8–14. 

Built as a showcase of modern educational technology, it serves to demonstrate product innovation, scalable UI/UX architecture, and the intersection of Generative AI with structured learning pathways.

## ✨ Core Features & Technical Innovation

### 🧠 1. Dynamic AI-Generated Learning (OpenAI API)
The platform uses the **OpenAI `gpt-4o-mini` API** to dynamically generate educational chapters in real-time. Instead of static, hardcoded lessons, the system dynamically spins up infinite learning pathways based on the child's curiosity—whether they want to learn about "Neural Networks", "AI in Robotics", or "AI in Space Exploration".
* **Personalized Context:** Chapters intelligently weave the user's name right into the generated stories and praise mechanisms.

### 🗣️ 2. Voice-First Interaction (STT & TTS)
* **Text-to-Speech (TTS):** Premium integration with OpenAI's Advanced Speech API pairs specific voices (Nova, Echo, Onyx) to different animated UI mascots.
* **Speech-to-Text (STT):** Full browser microphone capability (via `webkitSpeechRecognition`) allowing children to answer questions and navigate totally hands-free.

### 🎮 3. Gamified & Persistent State
Children earn points, unlock achievements, and gain titles (e.g., *Digital Archaeologist*, *Machine Learning Detective*) structured around a rigorous 5-step pedagogical model:
1. **Storyline**
2. **Core Lesson**
3. **Interactive Mini-Game**
4. **Mind-Blowing Fun Fact**
5. **Knowledge Quiz**

*(Progress is managed efficiently via robust `localStorage` state architectures)*

### 📱 4. Premium Modern Frontend Architecture
* **Landing Page:** A world-class, responsive marketing landing page (`landing.html`) built with pure HTML/CSS/JS, featuring glassmorphism, intersecting scroll observers, custom CSS variables, and sophisticated gradient topography.
* **Proxy Server:** A Node/Express CORS proxy server efficiently managing the secure handshakes between the frontend client and OpenAI's endpoints.

---

## 🛠️ Architecture & Setup

### Prerequisites
- Node.js (v14+)
- An OpenAI API Key

### Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/basseyriman/LearnAI.git
   cd LearnAI
   ```

2. **Start the Proxy Server:**
   The application requires a secure intermediary to interface with OpenAI (specifically for dynamic image generations).
   ```bash
   npm install
   npm start
   ```
   *The proxy will spin up on `localhost:3001`.*

3. **Launch the Application:**
   Open the application in any modern web browser:
   * **Landing Page Showcase:** `landing.html`
   * **Main Application:** `index.html`

*(Note: For the best experience, run the front-end via a live server like VS Code's "Live Server" extension).*

---

## 🎨 Design Philosophy & UX

The application is heavily inspired by modern AI startup aesthetics, heavily customized to maintain approachability for young learners:
* **Typography:** `Outfit` (Headings) & `Inter` (Body)
* **Visuals:** Deep dark-mode themes juxtaposed with vibrant neon cyan and pink accents.
* **Interactions:** Buttery smooth CSS transitions, floating animations, and contextual sound waves representing active system listening.

---

## 🌌 Future Expansion Roadmap

1. **AI-Generated Assets:** Hooking directly into DALL-E 3 for live, session-specific illustration creation.
2. **Classroom Integration:** Exportable progress analytics and dashboards for educators.
3. **Multiplayer Capabilities:** Real-time group problem solving.

---

<div align="center">
  <i>Empowering the next generation of technologists and innovators.</i><br>
  <b>Designed for the Global Talent Initiative</b>
</div>
