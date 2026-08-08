"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Printer, CheckCircle, 
  Sparkles, PenTool, Brain, Award, PlayCircle, BookOpen, Trash2, Plus
} from "lucide-react";
import { NavBar } from "@/components/NavBar";

// ----------------------------------------------------
// Word Search Pre-Generated Grid (15x15)
// Contains: ALGORITHM, CHATBOT, COMPUTER, DATA, DRONE, LEARN, MACHINE, MODEL, ROBOT, SMART, VOICE, VISION
// ----------------------------------------------------
const WORD_SEARCH_GRID = [
  ["A", "L", "G", "O", "R", "I", "T", "H", "M", "X", "Y", "Z", "D", "A", "T"],
  ["C", "H", "A", "T", "B", "O", "T", "P", "Q", "R", "S", "M", "A", "R", "T"],
  ["O", "U", "V", "C", "O", "M", "P", "U", "T", "E", "R", "W", "X", "Y", "Z"],
  ["M", "A", "C", "H", "I", "N", "E", "A", "B", "C", "D", "E", "F", "G", "H"],
  ["P", "L", "E", "A", "R", "N", "I", "J", "K", "L", "M", "N", "O", "P", "Q"],
  ["U", "R", "S", "T", "U", "V", "W", "X", "Y", "V", "I", "S", "I", "O", "N"],
  ["T", "D", "R", "O", "N", "E", "Z", "A", "B", "C", "D", "E", "F", "G", "H"],
  ["E", "M", "O", "D", "E", "L", "I", "J", "K", "L", "M", "N", "O", "P", "Q"],
  ["R", "R", "S", "T", "U", "V", "W", "X", "Y", "R", "O", "B", "O", "T", "Z"],
  ["W", "V", "O", "I", "C", "E", "A", "B", "C", "D", "E", "F", "G", "H", "I"],
  ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"],
  ["Y", "Z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "A", "B"],
  ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"],
  ["R", "S", "T", "U", "V", "W", "X", "Y", "Z", "A", "B", "C", "D", "E", "F"]
];

const SEARCH_WORDS = [
  "ALGORITHM", "CHATBOT", "COMPUTER", "DATA", "DRONE",
  "LEARN", "MACHINE", "MODEL", "ROBOT", "SMART", "VOICE", "VISION"
];

export default function ActivityPackPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 13;

  // ----------------------------------------------------
  // Interactive Activity States
  // ----------------------------------------------------
  
  // Page 4: Quick Review
  const [p4Answers, setP4Answers] = useState({ q1: "", q2: "" });
  const [p4Checks, setP4Checks] = useState<Record<string, boolean>>({
    smart_speaker: false,
    bicycle: false,
    self_driving_car: false,
    calculator: false,
    voice_assistant: false,
    washing_machine: false,
  });

  // Page 5: Multiple Choice
  const [p5Answers, setP5Answers] = useState<Record<number, string>>({});
  const p5Correct = { 1: "B", 2: "B", 3: "B", 4: "A" };

  // Page 6: True or False
  const [p6Answers, setP6Answers] = useState<Record<number, string>>({});
  const p6Correct = { 1: "True", 2: "False", 3: "True", 4: "True", 5: "False" };

  // Page 7: Fill in the Blanks
  const [p7Answers, setP7Answers] = useState<Record<number, string>>({});
  const p7Correct = { 1: "AI", 2: "Learn", 3: "Data", 4: "Computer", 5: "Smart" };

  // Page 8: Matching
  const [p8Matches, setP8Matches] = useState<Record<string, string>>({});
  const p8Correct = {
    "AI": "Artificial Intelligence",
    "Robot": "A machine that can carry out tasks automatically",
    "Data": "Information used to teach computers",
    "Voice Assistant": "A program that answers questions using your voice",
    "Algorithm": "A set of step-by-step instructions for solving a problem"
  };
  const [p8Challenge, setP8Challenge] = useState("");

  // Page 9: AI Around My Home
  const [p9Rows, setP9Rows] = useState([
    { item: "Smart Speaker", does: "Plays music and answers questions", isAI: true },
    { item: "", does: "", isAI: false },
    { item: "", does: "", isAI: false },
    { item: "", does: "", isAI: false }
  ]);
  const [p9Reflection, setP9Reflection] = useState("");

  // Page 10: Dream Robot Designer
  const [p10Name, setP10Name] = useState("");
  const [p10Jobs, setP10Jobs] = useState<Record<string, boolean>>({
    homework: false,
    clean: false,
    doctors: false,
    animals: false,
    meals: false,
    space: false,
  });
  const [p10OtherJob, setP10OtherJob] = useState("");
  const [p10Special, setP10Special] = useState("");
  const [p10DrawColor, setP10DrawColor] = useState("#4A2D6E");
  const [p10DrawingCanvas, setP10DrawingCanvas] = useState<string | null>(null);

  // Page 11: Word Search
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [p11Sentence, setP11Sentence] = useState("");

  // Page 12: Crossword Grid Input States
  const [p12Answers, setP12Answers] = useState({
    across1: "", across2: "", across3: "",
    down1: "", down2: "", down3: ""
  });
  const p12Correct = {
    across1: "DATA", across2: "ROBOT", across3: "LEARN",
    down1: "INTELLIGENCE", down2: "ASSISTANT", down3: "ALGORITHM"
  };
  const [p12Clue, setP12Clue] = useState("");
  const [p12Answer, setP12Answer] = useState("");

  // Page 13: Mission Planner
  const [p13Problem, setP13Problem] = useState("");
  const [p13Who, setP13Who] = useState("");
  const [p13How, setP13How] = useState("");
  const [p13Name, setP13Name] = useState("");

  // ----------------------------------------------------
  // Helper Actions
  // ----------------------------------------------------
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleCellClick = (r: number, c: number) => {
    const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
    let newSelection = [...selectedCells];
    if (isSelected) {
      newSelection = newSelection.filter(cell => !(cell.r === r && cell.c === c));
    } else {
      newSelection.push({ r, c });
    }
    setSelectedCells(newSelection);

    // Check if the selected letters form a word from our search list
    const letters = newSelection.map(cell => WORD_SEARCH_GRID[cell.r][cell.c]).join("");
    const reversedLetters = letters.split("").reverse().join("");
    
    const matchedWord = SEARCH_WORDS.find(
      word => (letters === word || reversedLetters === word) && !foundWords.includes(word)
    );

    if (matchedWord) {
      setFoundWords([...foundWords, matchedWord]);
      setSelectedCells([]); // Reset active selection path
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient dark:bg-brand-gradient-dark text-brand-purple dark:text-brand-cream pb-12 print:pb-0">
      <NavBar />

      {/* Main Layout Container */}
      <main className="container mx-auto px-6 pt-32 max-w-4xl print:pt-0">
        
        {/* Navigation / Control Panel (Hidden on Print) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-brand-surface dark:bg-brand-purple-dark/80 border border-brand-purple/10 dark:border-brand-gold/15 p-4 rounded-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-full hover:bg-brand-purple/5 dark:hover:bg-brand-gold/5 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Activity Pack: Book 1</h1>
              <p className="text-xs text-brand-purple/50 dark:text-brand-cream/50">Inspired by Young AI Explorers · Ages 9-12</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-brand-purple/10 hover:bg-brand-purple/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-brand-purple/10 hover:bg-brand-purple/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              <Printer className="h-3.5 w-3.5" /> Print Booklet
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            THE WORKBOOK CONTAINER (Designed like paper sheets)
           ---------------------------------------------------- */}
        <div className="relative bg-white border border-brand-purple/15 p-10 md:p-16 rounded-sm shadow-xl min-h-[900px] flex flex-col justify-between text-brand-purple print:shadow-none print:border-none print:p-0">
          
          {/* Top Sheet Margin Bindings (Doodles) */}
          <div className="absolute top-0 inset-x-0 h-4 flex justify-around pointer-events-none print:hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-4 h-6 bg-brand-warm/30 rounded-t-full border-t border-x border-brand-purple/10 -mt-2"></div>
            ))}
          </div>

          {/* PAGE CONTENT RENDERING ENGINE */}
          <div className="flex-1 flex flex-col justify-between">
            
            {/* PAGE 1: COVER */}
            {currentPage === 1 && (
              <div className="flex-1 flex flex-col justify-between items-center text-center py-10">
                <div className="space-y-4">
                  <Award className="h-20 w-20 text-brand-gold mx-auto animate-pulse" strokeWidth={1} />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-purple/50 bg-brand-purple/5 px-4 py-1.5 rounded-full">Official Workbook</span>
                </div>
                <div className="space-y-6 max-w-xl my-10">
                  <h1 className="text-4xl md:text-5.55xl font-heading font-extrabold tracking-tight leading-tight text-brand-purple">
                    Young AI Explorers <span className="text-brand-gold font-serif italic font-normal block mt-2">Activity Pack</span>
                  </h1>
                  <p className="text-base md:text-lg text-brand-purple/65 font-medium leading-relaxed">
                    Fun Activities, Challenges, Quizzes and Games Inspired by the Young AI Explorers Book.
                  </p>
                </div>
                <div className="space-y-2 border-t border-brand-purple/10 pt-8 w-full max-w-sm">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40">Target Audience</p>
                  <p className="text-sm font-bold text-brand-purple">Ages 9–12</p>
                  <p className="text-[10px] text-brand-purple/40 mt-1">Written by Bassey Riman</p>
                </div>
              </div>
            )}

            {/* PAGE 2: WELCOME */}
            {currentPage === 2 && (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-brand-gold font-semibold uppercase tracking-wider text-xs">
                  <Sparkles className="h-4 w-4" /> Part 1 – Welcome
                </div>
                <h2 className="text-3xl font-heading font-extrabold">Welcome, AI Explorer!</h2>
                <div className="w-16 h-1 bg-brand-gold"></div>
                <p className="text-base leading-relaxed text-brand-purple/75 pt-4">
                  Hello, Explorer!
                </p>
                <p className="text-base leading-relaxed text-brand-purple/75">
                  Congratulations on taking another exciting step into the world of Artificial Intelligence (AI). Whether you&apos;ve already read *Young AI Explorers* or you&apos;re just beginning your journey, this activity pack is designed to help you learn through fun, creativity, and problem-solving.
                </p>
                <p className="text-base leading-relaxed text-brand-purple/75">
                  Inside, you&apos;ll discover exciting puzzles, quizzes, drawing activities, coding challenges, and real-life AI missions that will help you think like an AI inventor.
                </p>
                <p className="text-base leading-relaxed text-brand-purple/75 font-semibold italic">
                  Remember, there are no silly questions. Every great inventor started by being curious. So grab a pencil, have fun, and let your imagination lead the way.
                </p>
                <p className="text-base leading-relaxed text-brand-purple/75 pt-4">
                  Let&apos;s begin your next AI adventure!
                </p>
              </div>
            )}

            {/* PAGE 3: HOW TO USE */}
            {currentPage === 3 && (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-heading font-extrabold">How to Use This Pack</h2>
                <p className="text-base leading-relaxed text-brand-purple/70 mb-6">
                  This activity pack is divided into different sections to help you discover AI in multiple ways:
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { emoji: "📖", label: "Learn", desc: "Review key computer science and AI concepts." },
                    { emoji: "✏️", label: "Write", desc: "Answer challenges and fill out quiz questions." },
                    { emoji: "🎨", label: "Create", desc: "Draw, sketch, and design your own intelligent creations." },
                    { emoji: "🧩", label: "Solve", desc: "Crack crossword puzzles, word searches, and algorithmic riddles." },
                    { emoji: "🏆", label: "Achieve", desc: "Earn certificates as you complete each section!" }
                  ].map((sec) => (
                    <div key={sec.label} className="flex gap-4 p-4 rounded-xl border border-brand-purple/5 bg-brand-warm/10 items-start">
                      <span className="text-2xl shrink-0">{sec.emoji}</span>
                      <div>
                        <h4 className="font-bold text-base text-brand-purple">{sec.label}</h4>
                        <p className="text-sm text-brand-purple/65 mt-0.5">{sec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 4: QUICK REVIEW */}
            {currentPage === 4 && (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-brand-gold font-semibold uppercase tracking-wider text-xs">
                  <Sparkles className="h-4 w-4" /> Part 2 — Chapter 1
                </div>
                <h2 className="text-3xl font-heading font-extrabold">Quick Review</h2>
                <p className="text-sm text-brand-purple/55">Answer the review questions below directly on this sheet.</p>

                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold block">1. What does AI stand for?</label>
                    <input 
                      type="text" 
                      value={p4Answers.q1}
                      onChange={(e) => setP4Answers({ ...p4Answers, q1: e.target.value })}
                      placeholder="Type your answer here..."
                      className="w-full border-b border-brand-purple/20 py-2 text-sm focus:outline-none focus:border-brand-gold text-brand-purple"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold block">2. Name three places where you have seen or interacted with AI:</label>
                    <input 
                      type="text" 
                      value={p4Answers.q2}
                      onChange={(e) => setP4Answers({ ...p4Answers, q2: e.target.value })}
                      placeholder="e.g. smart assistant, video recommendation..."
                      className="w-full border-b border-brand-purple/20 py-2 text-sm focus:outline-none focus:border-brand-gold text-brand-purple"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-bold block">3. Circle (click) the items below that use AI:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.keys(p4Checks).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setP4Checks({ ...p4Checks, [item]: !p4Checks[item] })}
                          className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                            p4Checks[item]
                              ? "bg-brand-purple/10 border-brand-gold text-brand-purple"
                              : "border-brand-purple/10 bg-transparent text-brand-purple/60 hover:bg-brand-purple/5"
                          }`}
                        >
                          {item.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 5: MULTIPLE CHOICE */}
            {currentPage === 5 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">Multiple Choice</h2>
                <p className="text-sm text-brand-purple/55">Circle the correct answer option below.</p>

                <div className="space-y-6 pt-4">
                  {[
                    { id: 1, q: "AI stands for:", choices: { A: "Artificial Ice", B: "Artificial Intelligence", C: "Automatic Internet", D: "Amazing Information" } },
                    { id: 2, q: "Which of these is most likely to use AI?", choices: { A: "A wooden chair", B: "A smart assistant", C: "A pencil", D: "A notebook" } },
                    { id: 3, q: "AI helps computers to:", choices: { A: "Sleep", B: "Learn and make decisions", C: "Eat food", D: "Grow taller" } },
                    { id: 4, q: "Which of these is an example of AI?", choices: { A: "A robot vacuum", B: "A spoon", C: "A football", D: "A ruler" } }
                  ].map((question) => (
                    <div key={question.id} className="space-y-2">
                      <h4 className="text-sm font-bold">{question.id}. {question.q}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(question.choices).map(([key, val]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setP5Answers({ ...p5Answers, [question.id]: key })}
                            className={`p-2.5 text-xs text-left rounded-lg border transition-all ${
                              p5Answers[question.id] === key
                                ? "bg-brand-purple/10 border-brand-gold font-bold text-brand-purple"
                                : "border-brand-purple/10 bg-transparent text-brand-purple/70 hover:bg-brand-purple/5"
                            }`}
                          >
                            <span className="font-extrabold mr-2">{key}.</span> {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 6: TRUE OR FALSE */}
            {currentPage === 6 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">True or False</h2>
                <p className="text-sm text-brand-purple/55">Write or select True or False for each statement.</p>

                <div className="space-y-5 pt-6">
                  {[
                    { id: 1, statement: "AI can help doctors diagnose illnesses." },
                    { id: 2, statement: "AI is only used inside physical walking robots." },
                    { id: 3, statement: "AI can recognize human voices and languages." },
                    { id: 4, statement: "AI is used to recommend films and music." },
                    { id: 5, statement: "AI systems can never make errors or mistakes." }
                  ].map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-brand-purple/5 bg-brand-warm/5">
                      <span className="text-sm font-medium text-brand-purple/80">{item.id}. {item.statement}</span>
                      <div className="flex gap-2">
                        {["True", "False"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setP6Answers({ ...p6Answers, [item.id]: opt })}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              p6Answers[item.id] === opt
                                ? "bg-brand-purple/15 border-brand-gold text-brand-purple"
                                : "border-brand-purple/10 bg-transparent text-brand-purple/50 hover:bg-brand-purple/5"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 7: FILL IN THE BLANKS */}
            {currentPage === 7 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">Fill in the Blanks</h2>
                <p className="text-sm text-brand-purple/55 font-medium mb-4">Choose the correct word from the word bank to complete the sentences.</p>

                {/* Word Bank Container */}
                <div className="p-4 rounded-xl border border-dashed border-brand-purple/20 bg-brand-warm/10 text-center mb-6">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-brand-purple/40 block mb-2">Word Bank</span>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {["Computer", "Learn", "Data", "Smart", "AI"].map((word) => (
                      <span key={word} className="px-3.5 py-1.5 rounded-lg bg-white border border-brand-purple/10 shadow-sm text-xs font-bold text-brand-purple">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  {[
                    { id: 1, before: "", after: " stands for Artificial Intelligence.", label: "1" },
                    { id: 2, before: "AI can ", after: " from input information and labels.", label: "2" },
                    { id: 3, before: "AI models use ", after: " to make decisions.", label: "3" },
                    { id: 4, before: "A ", after: " is required to run AI programs.", label: "4" },
                    { id: 5, before: "AI helps make many daily devices ", after: ".", label: "5" }
                  ].map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-brand-purple/5 bg-brand-warm/5">
                      <div className="flex flex-wrap items-baseline gap-x-1 text-sm font-medium text-brand-purple/85 leading-loose">
                        <span className="font-extrabold text-brand-purple/40 mr-1">{item.label}.</span>
                        {item.before && <span>{item.before}</span>}
                        <input
                          type="text"
                          value={p7Answers[item.id] || ""}
                          onChange={(e) => setP7Answers({ ...p7Answers, [item.id]: e.target.value })}
                          placeholder="________"
                          className="inline-block border-b-2 border-brand-purple/30 focus:border-brand-gold focus:outline-none text-center text-sm font-extrabold text-brand-gold w-28 bg-transparent placeholder:text-brand-purple/20 placeholder:font-normal"
                        />
                        {item.after && <span>{item.after}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* PAGE 8: MATCH THE WORDS */}
            {currentPage === 8 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">Match the AI Words</h2>
                <p className="text-sm text-brand-purple/55">Link each word on the left to its meaning on the right.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Words */}
                  <div className="space-y-4">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40 block">AI Terms</span>
                    {Object.keys(p8Correct).map((term) => (
                      <div key={term} className="space-y-2">
                        <label className="text-sm font-bold block">{term}</label>
                        <select
                          value={p8Matches[term] || ""}
                          onChange={(e) => setP8Matches({ ...p8Matches, [term]: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-brand-purple/15 bg-transparent text-xs font-semibold focus:outline-none focus:border-brand-gold"
                        >
                          <option value="">-- Choose Meaning --</option>
                          {Object.values(p8Correct).map((meaning) => (
                            <option key={meaning} value={meaning}>{meaning}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Meanings Reference list */}
                  <div className="space-y-3 bg-brand-warm/5 border border-brand-purple/5 p-4 rounded-xl">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40 block mb-2">Meaning Reference</span>
                    {Object.values(p8Correct).map((meaning, idx) => (
                      <div key={idx} className="text-xs text-brand-purple/75 leading-relaxed p-2.5 bg-white rounded-lg border border-brand-purple/5">
                        • {meaning}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <label className="text-sm font-bold block">💡 Challenge Question: Can you think of another AI word you know?</label>
                  <input
                    type="text"
                    value={p8Challenge}
                    onChange={(e) => setP8Challenge(e.target.value)}
                    placeholder="Type your word here..."
                    className="w-full border-b border-brand-purple/20 py-2 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            )}

            {/* PAGE 9: AI AROUND MY HOME */}
            {currentPage === 9 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">AI Around My Home</h2>
                <p className="text-sm text-brand-purple/55 leading-relaxed">
                  AI is all around us! Look around your house or school and document 3 examples you find.
                </p>

                <div className="overflow-x-auto pt-4">
                  <table className="w-full border-collapse border border-brand-purple/10 text-left text-xs">
                    <thead>
                      <tr className="bg-brand-warm/10 border-b border-brand-purple/10">
                        <th className="p-3 font-extrabold uppercase tracking-wider">Item Name</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider">What does it do?</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider text-center">Is it AI?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p9Rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-brand-purple/5">
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.item}
                              disabled={idx === 0}
                              onChange={(e) => {
                                const newRows = [...p9Rows];
                                newRows[idx].item = e.target.value;
                                setP9Rows(newRows);
                              }}
                              placeholder={idx === 0 ? "" : "e.g. Smart TV"}
                              className="w-full bg-transparent p-1.5 focus:outline-none border-b border-transparent focus:border-brand-gold font-semibold disabled:opacity-75"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.does}
                              disabled={idx === 0}
                              onChange={(e) => {
                                const newRows = [...p9Rows];
                                newRows[idx].does = e.target.value;
                                setP9Rows(newRows);
                              }}
                              placeholder={idx === 0 ? "" : "e.g. Recommends shows"}
                              className="w-full bg-transparent p-1.5 focus:outline-none border-b border-transparent focus:border-brand-gold font-medium disabled:opacity-75"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={row.isAI}
                              disabled={idx === 0}
                              onChange={(e) => {
                                const newRows = [...p9Rows];
                                newRows[idx].isAI = e.target.checked;
                                setP9Rows(newRows);
                              }}
                              className="h-4.5 w-4.5 rounded border-brand-purple/10 text-brand-gold focus:ring-brand-gold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-6">
                  <label className="text-sm font-bold block">🤔 Reflection: Which AI tool do you think helps your family the most?</label>
                  <textarea
                    value={p9Reflection}
                    onChange={(e) => setP9Reflection(e.target.value)}
                    placeholder="Type your explanation here..."
                    rows={3}
                    className="w-full border border-brand-purple/15 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>
              </div>
            )}

            {/* PAGE 10: DESIGN YOUR DREAM ROBOT */}
            {currentPage === 10 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">Design Your Dream AI Robot</h2>
                <p className="text-sm text-brand-purple/55">Be an inventor! Draw and customize your very own helper robot.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Drawing Area (Mock canvas / design space) */}
                  <div className="border-2 border-dashed border-brand-purple/20 bg-brand-warm/5 rounded-2xl h-64 md:h-80 flex flex-col justify-between p-4 relative group hover:border-brand-gold/45 transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-purple/35 block">Robot Design Canvas</span>
                    
                    {/* Simplified Sketch Tool / Click to add parts mock UI */}
                    <div className="flex-1 flex items-center justify-center">
                      {p10DrawingCanvas ? (
                        <div className="text-center font-bold text-sm text-brand-purple animate-in fade-in duration-300">
                          🤖 {p10DrawingCanvas} Robot Base Added!
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <PenTool className="h-8 w-8 text-brand-purple/25 mx-auto" />
                          <div className="text-xs text-brand-purple/40 font-semibold">Choose a base shape to start design:</div>
                          <div className="flex justify-center gap-2">
                            {["Circular", "Humanoid", "Octopus", "Rolling"].map((shape) => (
                              <button
                                key={shape}
                                type="button"
                                onClick={() => setP10DrawingCanvas(shape)}
                                className="px-3 py-1 bg-white border border-brand-purple/10 rounded-lg text-[10px] font-bold shadow-sm hover:border-brand-gold"
                              >
                                {shape}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-brand-purple/45">
                      <span>Interactive Blueprint Area</span>
                      {p10DrawingCanvas && (
                        <button 
                          onClick={() => setP10DrawingCanvas(null)}
                          className="hover:text-red-500 font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-brand-purple/40 block">Robot Name</label>
                      <input
                        type="text"
                        value={p10Name}
                        onChange={(e) => setP10Name(e.target.value)}
                        placeholder="e.g. Helper Bot 2000"
                        className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-brand-purple/40 block">What jobs can your robot do?</label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        {[
                          { key: "homework", label: "Help with homework" },
                          { key: "clean", label: "Clean the house" },
                          { key: "doctors", label: "Help doctors" },
                          { key: "animals", label: "Protect animals" },
                          { key: "meals", label: "Cook meals" },
                          { key: "space", label: "Explore space" },
                        ].map((job) => (
                          <label key={job.key} className="flex items-center gap-2 p-2 rounded bg-brand-warm/10 border border-transparent hover:border-brand-purple/10 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p10Jobs[job.key] || false}
                              onChange={(e) => setP10Jobs({ ...p10Jobs, [job.key]: e.target.checked })}
                              className="h-4 w-4 rounded border-brand-purple/10 text-brand-gold focus:ring-brand-gold"
                            />
                            <span>{job.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-brand-purple/40 block">What makes your robot special?</label>
                      <input
                        type="text"
                        value={p10Special}
                        onChange={(e) => setP10Special(e.target.value)}
                        placeholder="e.g. Equipped with solar-powered wings..."
                        className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 11: WORD SEARCH */}
            {currentPage === 11 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">AI Word Search</h2>
                <p className="text-sm text-brand-purple/55">Click and select cells in the letter grid to find all 12 AI words below.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
                  {/* Grid */}
                  <div className="md:col-span-2 flex justify-center">
                    <div 
                      className="p-3 border border-brand-purple/10 rounded-2xl bg-brand-warm/5 select-none max-w-full"
                      style={{ display: "grid", gridTemplateColumns: "repeat(15, minmax(0, 1fr))", gap: "0.25rem" }}
                    >
                      {WORD_SEARCH_GRID.map((row, r) => 
                        row.map((letter, c) => {
                          const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
                          return (
                            <button
                              key={`${r}-${c}`}
                              type="button"
                              onClick={() => handleCellClick(r, c)}
                              className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold rounded transition-all ${
                                isSelected
                                  ? "bg-brand-gold text-brand-purple-dark scale-105 shadow-sm"
                                  : "bg-white hover:bg-brand-purple/5 border border-brand-purple/5 text-brand-purple"
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Word List status */}
                  <div className="space-y-4 bg-brand-warm/5 border border-brand-purple/5 p-4 rounded-xl">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40 block">Words to Find ({foundWords.length}/12)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      {SEARCH_WORDS.map((word) => {
                        const isFound = foundWords.includes(word);
                        return (
                          <span 
                            key={word} 
                            className={`p-1.5 rounded text-center border ${
                              isFound 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 line-through" 
                                : "bg-white border-brand-purple/5 text-brand-purple/65"
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <label className="text-sm font-bold block">🚀 Bonus Challenge: Can you use three of these words in one sentence?</label>
                  <input
                    type="text"
                    value={p11Sentence}
                    onChange={(e) => setP11Sentence(e.target.value)}
                    placeholder="Type your sentence here..."
                    className="w-full border-b border-brand-purple/20 py-2 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            )}

            {/* PAGE 12: CROSSWORD CHALLENGE */}
            {currentPage === 12 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold">AI Crossword Challenge</h2>
                <p className="text-sm text-brand-purple/55">Input the correct answers for the clues below.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Clues */}
                  <div className="space-y-4">
                    <div className="space-y-3 bg-brand-warm/5 border border-brand-purple/5 p-4 rounded-xl">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40 block">Across</span>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="font-bold">1. Information used to teach AI (4 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.across1}
                            onChange={(e) => setP12Answers({ ...p12Answers, across1: e.target.value.toUpperCase() })}
                            maxLength={4}
                            className="ml-2 w-24 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                        <div>
                          <label className="font-bold">2. A machine that can perform tasks (5 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.across2}
                            onChange={(e) => setP12Answers({ ...p12Answers, across2: e.target.value.toUpperCase() })}
                            maxLength={5}
                            className="ml-2 w-24 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                        <div>
                          <label className="font-bold">3. AI helps computers ______ (5 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.across3}
                            onChange={(e) => setP12Answers({ ...p12Answers, across3: e.target.value.toUpperCase() })}
                            maxLength={5}
                            className="ml-2 w-24 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-brand-warm/5 border border-brand-purple/5 p-4 rounded-xl">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple/40 block">Down</span>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="font-bold">1. Artificial __________ (12 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.down1}
                            onChange={(e) => setP12Answers({ ...p12Answers, down1: e.target.value.toUpperCase() })}
                            maxLength={12}
                            className="ml-2 w-32 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                        <div>
                          <label className="font-bold">2. A voice helper on a phone (9 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.down2}
                            onChange={(e) => setP12Answers({ ...p12Answers, down2: e.target.value.toUpperCase() })}
                            maxLength={9}
                            className="ml-2 w-32 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                        <div>
                          <label className="font-bold">3. Instructions for solving a problem (9 letters):</label>
                          <input
                            type="text"
                            value={p12Answers.down3}
                            onChange={(e) => setP12Answers({ ...p12Answers, down3: e.target.value.toUpperCase() })}
                            maxLength={9}
                            className="ml-2 w-32 border-b border-brand-purple/20 focus:outline-none focus:border-brand-gold font-bold px-1 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Super Challenge creator */}
                  <div className="space-y-4 p-5 rounded-2xl border border-brand-gold/15 bg-brand-warm/5">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold block">⭐ Super Challenge</span>
                    <p className="text-xs text-brand-purple/65">Create your own AI crossword clue for a friend!</p>
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-purple/45">Clue</label>
                        <input
                          type="text"
                          value={p12Clue}
                          onChange={(e) => setP12Clue(e.target.value)}
                          placeholder="e.g. A computer system modeled on the human brain..."
                          className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-purple/45">Answer</label>
                        <input
                          type="text"
                          value={p12Answer}
                          onChange={(e) => setP12Answer(e.target.value)}
                          placeholder="e.g. NEURAL NETWORK"
                          className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 13: DESIGN MISSION */}
            {currentPage === 13 && (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-brand-gold font-semibold uppercase tracking-wider text-xs">
                  <Sparkles className="h-4 w-4" /> Final Mission
                </div>
                <h2 className="text-3xl font-heading font-extrabold">Mission 1: Invent an AI That Solves a Problem</h2>
                <p className="text-sm text-brand-purple/55 leading-relaxed">
                  Great inventors solve real-world problems. Think about something that could be improved at home, in school, or in your community, and document your invention.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold block">1. What problem do you want to solve?</label>
                    <input
                      type="text"
                      value={p13Problem}
                      onChange={(e) => setP13Problem(e.target.value)}
                      placeholder="e.g. Too much plastic waste in the school canteen..."
                      className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block">2. Who would your AI help?</label>
                    <input
                      type="text"
                      value={p13Who}
                      onChange={(e) => setP13Who(e.target.value)}
                      placeholder="e.g. School cleaning staff and students..."
                      className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block">3. How would your AI work?</label>
                    <input
                      type="text"
                      value={p13How}
                      onChange={(e) => setP13How(e.target.value)}
                      placeholder="e.g. Cameras detect trash and robot сортирует пластик от бумаги..."
                      className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block">4. What would you call your AI invention?</label>
                    <input
                      type="text"
                      value={p13Name}
                      onChange={(e) => setP13Name(e.target.value)}
                      placeholder="e.g. EcoSort AI Bot"
                      className="w-full border-b border-brand-purple/20 py-1.5 focus:outline-none focus:border-brand-gold text-sm font-bold text-brand-gold"
                    />
                  </div>
                </div>

                {/* Draw Box / Sandbox */}
                <div className="border-2 border-dashed border-brand-purple/20 bg-brand-warm/5 rounded-2xl p-6 text-center mt-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-purple/35 block mb-4">Invention Design Box</span>
                  <p className="text-xs text-brand-purple/50">Your custom invention will compile into your student profile automatically upon submission!</p>
                </div>
              </div>
            )}

          </div>

          {/* Sheet Footer Details */}
          <div className="border-t border-brand-purple/10 pt-6 mt-10 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-purple/40 print:border-none print:mt-4">
            <span className="font-semibold">© RimansTech Publishing · Young AI Explorers</span>
            <span className="font-bold font-serif italic text-brand-gold">A Kid&apos;s Guide to the Future</span>
            <span className="font-mono">Page {currentPage} of {totalPages}</span>
          </div>

        </div>

      </main>

      {/* ----------------------------------------------------
          PRINT STYLING SHEET OVERRIDES
         ---------------------------------------------------- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background: #white !important;
              color: #000 !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            header, .print\\:hidden, nav, .NavBar {
              display: none !important;
            }
            .container {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
            }
            .bg-white {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              min-height: auto !important;
            }
            /* Force print page break per page view if user prints direct from dialog */
            .workbook-page {
              page-break-after: always;
            }
          }
        `
      }} />

    </div>
  );
}
