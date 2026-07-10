import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Zap,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Archive,
  HelpCircle,
  Home,
  Grid,
  Grid3X3,
  Compass,
  Trophy,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowLeft,
  Search,
  MessageSquare,
  Maximize2,
  Minimize2,
  Info
} from "lucide-react";

import { CATEGORIES, BADGES, DEFAULT_QUESTIONS } from "./data";
import { Question, Category, Badge, UserStats } from "./types";
import { playSynthSound } from "./utils/audio";
import { speakText, setSpeechEnabled, getSpeechEnabled, cancelSpeech } from "./utils/speech";

import MysteryBox from "./components/MysteryBox";
import VisualAnchor from "./components/VisualAnchor";
import BadgeCard from "./components/BadgeCard";
import NotificationCenter from "./components/NotificationCenter";
import CategoryIcon from "./components/CategoryIcon";

export default function App() {
  // Splash Screen & Setup
  const [showSplash, setShowSplash] = useState(true);
  const [initPercent, setInitPercent] = useState(0);

  // Layout Controls
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "badges" | "ai_sandbox" | "archive">("home");

  // User Gamified States (loaded from localStorage with safe default fallback)
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem("dlikon_user_stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.discoveredFactTitles) {
          parsed.discoveredFactTitles = [
            "উড়ন্ত হেলিকপ্টার (The Backward Flyer)",
            "নীল রক্তের রাজা (The Blue Blood King)"
          ];
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not read stats from localStorage", e);
    }
    return {
      points: 250, // Start with some momentum points
      streak: 3,   // Daily streak starter
      lastPlayedDate: null,
      discoveredFactsCount: 2,
      unlockedBadges: ["first_discovery"],
      discoveredFactTitles: [
        "উড়ন্ত হেলিকপ্টার (The Backward Flyer)",
        "নীল রক্তের রাজা (The Blue Blood King)"
      ]
    };
  });

  // Persistent Custom Generated Questions State
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_custom_questions");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read custom questions", e);
    }
    return [];
  });

  // Sound Config States
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Active Category / Game Flow States
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [quizState, setQuizState] = useState<"idle" | "hook" | "question" | "answered">("idle");
  const [userAnswerIndex, setUserAnswerIndex] = useState<number | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Dynamic AI Sandbox state
  const [customTopic, setCustomTopic] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Celebratory States
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  const [unlockedBadgeBanner, setUnlockedBadgeBanner] = useState<Badge | null>(null);

  // Knowledge Archive States
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<string | null>(null);
  const [expandedFact, setExpandedFact] = useState<string | null>(null);

  // Save stats to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_user_stats", JSON.stringify(userStats));
    } catch (e) {
      console.warn("Could not save stats to localStorage", e);
    }
  }, [userStats]);

  // Save custom generated questions to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_custom_questions", JSON.stringify(customQuestions));
    } catch (e) {
      console.warn("Could not save custom questions to localStorage", e);
    }
  }, [customQuestions]);

  // Simulate Splash screen loading momentum
  useEffect(() => {
    if (showSplash) {
      const interval = setInterval(() => {
        setInitPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setShowSplash(false);
              playSynthSound("badge"); // Play grand opening sound
            }, 600);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [showSplash]);

  // Check and unlock badges based on user state
  const checkAndUnlockBadges = (newStats: UserStats, newlySolvedCategory?: string) => {
    const newlyUnlocked: string[] = [...newStats.unlockedBadges];
    let showBanner: Badge | null = null;

    // Check Badge: "streak_3"
    if (newStats.streak >= 3 && !newlyUnlocked.includes("streak_3")) {
      newlyUnlocked.push("streak_3");
      const b = BADGES.find((x) => x.id === "streak_3");
      if (b) showBanner = b;
    }

    // Check Badge: "eureka_master" (Total score >= 1000)
    if (newStats.points >= 1000 && !newlyUnlocked.includes("eureka_master")) {
      newlyUnlocked.push("eureka_master");
      const b = BADGES.find((x) => x.id === "eureka_master");
      if (b) showBanner = b;
    }

    // Check category-specific counts
    if (newlySolvedCategory) {
      if (newlySolvedCategory === "science" && !newlyUnlocked.includes("cosmos_pioneer")) {
        newlyUnlocked.push("cosmos_pioneer");
        const b = BADGES.find((x) => x.id === "cosmos_pioneer");
        if (b) showBanner = b;
      }
      if (newlySolvedCategory === "nature" && !newlyUnlocked.includes("nature_whisperer")) {
        newlyUnlocked.push("nature_whisperer");
        const b = BADGES.find((x) => x.id === "nature_whisperer");
        if (b) showBanner = b;
      }
      if (newlySolvedCategory === "history" && !newlyUnlocked.includes("history_decoder")) {
        newlyUnlocked.push("history_decoder");
        const b = BADGES.find((x) => x.id === "history_decoder");
        if (b) showBanner = b;
      }
      if (newlySolvedCategory === "class3_gk" && !newlyUnlocked.includes("class3_scholar")) {
        newlyUnlocked.push("class3_scholar");
        const b = BADGES.find((x) => x.id === "class3_scholar");
        if (b) showBanner = b;
      }
    }

    if (showBanner) {
      setUnlockedBadgeBanner(showBanner);
      playSynthSound("badge");
      setTimeout(() => setUnlockedBadgeBanner(null), 5000);
    }

    return newlyUnlocked;
  };

  // Launch celebratory confetti bursts on correct answers
  const triggerConfettiBlast = () => {
    setShowConfetti(true);
    const newParticles = [];
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // percentage x
        y: -10 - Math.random() * 20, // start above screen
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speedY: Math.random() * 5 + 3,
        speedX: (Math.random() - 0.5) * 4,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    setConfettiParticles(newParticles);

    // Stop confetti after 4 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  // Confetti position updates on interval
  useEffect(() => {
    if (showConfetti && confettiParticles.length > 0) {
      const interval = setInterval(() => {
        setConfettiParticles((prev) =>
          prev.map((p) => ({
            ...p,
            y: p.y + p.speedY,
            x: p.x + p.speedX,
            rotation: p.rotation + p.rotationSpeed
          }))
        );
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showConfetti, confettiParticles]);

  // Handle Mute & Narrator preferences
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      cancelSpeech();
    }
  };

  const toggleVoice = () => {
    const nextVoice = !isVoiceOn;
    setIsVoiceOn(nextVoice);
    setSpeechEnabled(nextVoice);
    if (!nextVoice) {
      cancelSpeech();
    }
  };

  // Sound play wrappers respecting global mute settings
  const playSound = (type: "tap" | "correct" | "incorrect" | "badge" | "notif") => {
    if (!isMuted) {
      playSynthSound(type);
    }
  };

  // Triggered when clicking a specific category profile
  const handleSelectCategory = (category: Category) => {
    playSound("tap");
    setActiveCategory(category);
    // Find a default question from the selected category
    const filtered = DEFAULT_QUESTIONS.filter((q) => q.category === category.id);
    const randomQ = filtered[Math.floor(Math.random() * filtered.length)] || DEFAULT_QUESTIONS[0];
    
    setActiveQuestion(randomQ);
    setQuizState("idle");
    setUserAnswerIndex(null);
  };

  // Start general random Mystery Box
  const handleStartRandomBox = () => {
    playSound("tap");
    const randomQ = DEFAULT_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUESTIONS.length)];
    const categoryProfile = CATEGORIES.find((c) => c.id === randomQ.category) || CATEGORIES[0];
    
    setActiveCategory(categoryProfile);
    setActiveQuestion(randomQ);
    setQuizState("idle");
    setUserAnswerIndex(null);
  };

  // Open Mystery Box & Reveal Curiosity Hook Riddle
  const handleUnwrapBox = () => {
    if (!activeQuestion) return;
    setQuizState("hook");
    
    // Narrate curiosity hook
    if (isVoiceOn) {
      speakText(activeQuestion.curiosityHook, "auto");
    }

    // Auto-advance to Quiz direct question after 5 seconds of suspense
    setTimeout(() => {
      setQuizState("question");
      cancelSpeech();
    }, 4500);
  };

  // User submits their option
  const handleAnswerSubmit = (optionIndex: number) => {
    if (quizState !== "question" || userAnswerIndex !== null || !activeQuestion) return;

    setUserAnswerIndex(optionIndex);
    const correct = optionIndex === activeQuestion.answerIndex;
    setIsCorrectAnswer(correct);

    if (correct) {
      playSound("correct");
      triggerConfettiBlast();

      // Check if this is a custom question to save it
      const isDefault = DEFAULT_QUESTIONS.some((q) => q.factTitle === activeQuestion.factTitle);
      if (!isDefault) {
        setCustomQuestions((prev) => {
          if (prev.some((q) => q.factTitle === activeQuestion.factTitle)) return prev;
          return [...prev, activeQuestion];
        });
      }

      // Grant Points & update stats
      setUserStats((prev) => {
        const nextPoints = prev.points + 100;
        const nextStreak = prev.streak + 1;
        
        const currentTitles = prev.discoveredFactTitles || [];
        const alreadyDiscovered = currentTitles.includes(activeQuestion.factTitle);
        const nextTitles = alreadyDiscovered 
          ? currentTitles 
          : [...currentTitles, activeQuestion.factTitle];
        const nextFactsCount = nextTitles.length;
        
        const tempStats = {
          ...prev,
          points: nextPoints,
          streak: nextStreak,
          discoveredFactsCount: nextFactsCount,
          discoveredFactTitles: nextTitles
        };

        const updatedBadges = checkAndUnlockBadges(tempStats, activeQuestion.category);
        return {
          ...tempStats,
          unlockedBadges: updatedBadges
        };
      });
    } else {
      playSound("incorrect");
      // Gentle streak recovery and low penalty to keep encouragement warm
      setUserStats((prev) => {
        const nextPoints = Math.max(0, prev.points + 25); // still award 25 for courage!
        const tempStats = {
          ...prev,
          points: nextPoints,
          streak: 0 // Break streak gently
        };
        const updatedBadges = checkAndUnlockBadges(tempStats);
        return {
          ...tempStats,
          unlockedBadges: updatedBadges
        };
      });
    }

    setQuizState("answered");

    // Narrate Eureka context explanation
    if (isVoiceOn) {
      setTimeout(() => {
        speakText(activeQuestion.eurekaExplanation, "auto");
      }, 500);
    }
  };

  // Proceed to next Mystery Box
  const handleNextMystery = () => {
    playSound("tap");
    cancelSpeech();

    // Reset flow
    setUserAnswerIndex(null);
    setQuizState("idle");

    if (activeCategory) {
      // Find a different question from same category
      const filtered = DEFAULT_QUESTIONS.filter((q) => q.category === activeCategory.id);
      const randomQ = filtered[Math.floor(Math.random() * filtered.length)] || DEFAULT_QUESTIONS[0];
      setActiveQuestion(randomQ);
    } else {
      handleStartRandomBox();
    }
  };

  // AI Generation Handler (Calling Express API server-side using Gemini 3.5-flash)
  const handleGenerateAIBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    playSound("tap");
    setLoadingAI(true);
    setAiError("");

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic,
          category: activeCategory?.id || "science"
        })
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        // Find suitable category based on theme or default to general
        const matchedCategory = CATEGORIES.find(
          (c) => c.id === resData.data.animationType || resData.data.animationType.includes(c.id)
        ) || CATEGORIES[0];

        setActiveCategory(matchedCategory);
        setActiveQuestion({
          ...resData.data,
          category: matchedCategory.id
        });
        
        setQuizState("idle");
        setUserAnswerIndex(null);
        setCustomTopic("");
        setActiveTab("home"); // Navigate back to home play stage
      } else {
        // Fallback to offline questions to provide seamless UX if API fails
        setAiError(resData.error || "Generation timed out. Initializing pre-curated Mystery Box as a secure fallback!");
        setTimeout(() => {
          handleStartRandomBox();
          setCustomTopic("");
          setActiveTab("home");
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Connection to AI gateway interrupted. Unwrapping pre-curated fallback Mystery Box instead.");
      setTimeout(() => {
        handleStartRandomBox();
        setCustomTopic("");
        setActiveTab("home");
      }, 3000);
    } finally {
      setLoadingAI(false);
    }
  };

  // Quick challenge trigger from notifications
  const handleNotificationChallenge = (categoryName: string) => {
    const matched = CATEGORIES.find((c) => c.id === categoryName) || CATEGORIES[1];
    handleSelectCategory(matched);
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-[#06040a] text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 select-none overflow-x-hidden font-sans relative">
      
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-black pointer-events-none z-0"></div>

      {/* Floating Confetti Particle Layer */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-sm shadow-sm"
              style={{
                left: `${p.x}%`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size * 1.5}px`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
                opacity: 0.85,
                transition: "top 30ms linear, left 30ms linear"
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Dynamic Floating Badge Unlocked Banner */}
      <AnimatePresence>
        {unlockedBadgeBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[99] bg-gradient-to-r from-amber-500/90 to-orange-600/90 border border-amber-300/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 text-black font-sans"
          >
            <div className="p-3 bg-white/20 rounded-xl shadow-inner animate-spin" style={{ animationDuration: "12s" }}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/80">
                Milestone Badge Unlocked • পদক অর্জন!
              </span>
              <h4 className="font-bold text-lg text-white leading-tight mt-0.5">
                {unlockedBadgeBanner.bengaliName}
              </h4>
              <p className="text-xs text-white/90 leading-tight mt-1 font-medium">
                "{unlockedBadgeBanner.bengaliDescription}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Wrapper - Supports simulated phone view vs full-screen */}
      <div
        className={`w-full transition-all duration-500 z-10 flex flex-col ${
          isFullScreen ? "max-w-6xl" : "max-w-[430px]"
        }`}
      >
        {/* Phone Frame Shell Wrapper */}
        <div
          className={`w-full bg-[#0d091a] border-white/10 flex flex-col relative overflow-hidden transition-all duration-300 shadow-[0_0_80px_-15px_rgba(139,92,246,0.3)] ${
            isFullScreen
              ? "rounded-3xl border-2 min-h-[85vh]"
              : "rounded-[40px] border-[6px] min-h-[840px] aspect-[9/19.5]"
          }`}
        >
          
          {/* Top Speaker Notch (Visible in simulated mobile view) */}
          {!isFullScreen && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#000000] rounded-b-2xl z-50 flex items-center justify-center gap-1.5 border-x border-b border-white/5">
              <div className="w-12 h-1 bg-white/10 rounded-full"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-500/40 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Trigger-based Curiosity Notification Center */}
          <NotificationCenter onSelectChallenge={handleNotificationChallenge} />

          {/* SPLASH SCREEN */}
          <AnimatePresence>
            {showSplash && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-[#040207] z-[90] flex flex-col items-center justify-between p-8 text-center"
              >
                <div></div>
                
                <div className="flex flex-col items-center">
                  {/* Dynamic Logo Sphere */}
                  <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-orange-600/20 blur-xl rounded-full"></div>
                    <div className="relative w-32 h-32 bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                      <div className="text-7xl font-display font-black text-slate-700 animate-pulse">?</div>
                      <div className="absolute top-3 left-3 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bengali Display Title */}
                  <h1 className="text-white font-display font-black text-5xl tracking-tighter leading-none bg-gradient-to-r from-orange-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                    ডি-লিকন
                  </h1>
                  <p className="text-orange-400 font-bold text-xs mt-2.5 tracking-widest uppercase font-sans">
                    D-Likon • Tothyer Nana Rong
                  </p>
                  
                  <div className="h-[2px] w-24 bg-orange-500/30 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 w-1/2 animate-infinite-scroll"></div>
                  </div>
                </div>

                <div className="w-full max-w-[280px]">
                  {/* Progress Indicators */}
                  <div className="flex justify-between text-[11px] font-mono text-orange-400/60 mb-2">
                    <span>Unwrapping Curiosity Engine...</span>
                    <span>{initPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 rounded-full transition-all duration-100"
                      style={{ width: `${initPercent}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-white/40 text-[10px] mt-4 font-mono uppercase tracking-wider">
                    A SURPRISE-DRIVEN GK ENGINE
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HEADER / HUD STATUS */}
          <div className="px-5 pt-8 pb-4 bg-gradient-to-b from-black/80 to-transparent border-b border-white/5 flex flex-col gap-3 z-20 relative">
            
            {/* Upper Info Row */}
            <div className="flex items-center justify-between">
              {/* Logo / Branding */}
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  playSound("tap");
                  setActiveCategory(null);
                  setActiveQuestion(null);
                  setQuizState("idle");
                  setActiveTab("home");
                }}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/20 text-black">ডি</div>
                <div>
                  <h2 className="text-white font-black text-lg font-display tracking-tighter leading-none">
                    ডি-লিকন
                  </h2>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block mt-1">
                    Tothyer Nana Rong
                  </span>
                </div>
              </div>

              {/* Utility Panel (Volume, TTS, Layout) */}
              <div className="flex items-center gap-1.5">
                {/* Voice Narration Toggle */}
                <button
                  onClick={toggleVoice}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isVoiceOn
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/5 text-white/40"
                  }`}
                  title={isVoiceOn ? "Voice Narrator: ON" : "Voice Narrator: OFF"}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                {/* Mute toggle */}
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isMuted
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-white/5 border-white/5 text-white/60"
                  }`}
                  title={isMuted ? "Sound: MUTED" : "Sound: ENABLED"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Layout Resize Toggle */}
                <button
                  onClick={() => {
                    playSound("tap");
                    setIsFullScreen(!isFullScreen);
                  }}
                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-white/60 hover:text-white transition-all"
                  title={isFullScreen ? "Mobile Mode" : "Expand Layout"}
                >
                  {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Gamification Status Bar (HUD) */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-inner">
              {/* Momentum Points */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none">Momentum</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {userStats.points} <span className="text-[10px] text-white/60 font-sans">Pts</span>
                  </span>
                </div>
              </div>

              {/* Discovery Streak */}
              <div className="flex items-center gap-2 border-x border-white/5 px-4">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                  <Flame className="w-4 h-4 fill-current animate-bounce" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none">Streak</span>
                  <span className="text-sm font-bold text-pink-500 font-mono">
                    🔥 {userStats.streak} <span className="text-[10px] text-white/60 font-sans">Days</span>
                  </span>
                </div>
              </div>

              {/* Discovered count */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none">Discovered</span>
                  <span className="text-sm font-bold text-orange-400 font-mono">
                    💎 {userStats.discoveredFactsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN PAGE BODY (SCROLLABLE AREA) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 z-10 relative flex flex-col gap-6">
            
            {/* ACTIVE PLAY STAGE (IF QUESTION IS SELECTED) */}
            {activeQuestion ? (
              <div className="flex flex-col gap-5 flex-1 justify-center py-4">
                
                {/* Back to Home CTA */}
                <button
                  onClick={() => {
                    playSound("tap");
                    setActiveQuestion(null);
                    setActiveCategory(null);
                    setQuizState("idle");
                  }}
                  className="self-start flex items-center gap-1.5 text-xs text-orange-400 hover:text-white font-sans bg-orange-500/10 border-2 border-orange-500/20 px-4 py-2 rounded-xl transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>তালিকায় ফিরুন • Leave Play Stage</span>
                </button>

                {/* Theme indicator banner */}
                <div className={`p-4 bg-${activeCategory?.color}-500/5 border-2 border-${activeCategory?.color}-500/20 rounded-2xl flex items-center justify-between shadow-lg shadow-${activeCategory?.color}-500/5`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-${activeCategory?.color}-500/15 text-${activeCategory?.color}-400`}>
                      <CategoryIcon name={activeCategory?.icon || "Orbit"} size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase block leading-none">
                        Active Category • বিষয়
                      </span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {activeCategory?.bengaliName} ({activeCategory?.name})
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono text-${activeCategory?.color}-400 font-bold bg-${activeCategory?.color}-500/15 border border-${activeCategory?.color}-500/20 px-2.5 py-1 rounded-md uppercase`}>
                    {activeCategory?.vibe}
                  </span>
                </div>

                {/* GAME STAGES CONTAINER */}
                <div className="flex-1 flex flex-col justify-center min-h-[400px]">
                  
                  {/* STAGE 1 & 2: IDLE CHEST AND SUSPENSE RIDDLE */}
                  {(quizState === "idle" || quizState === "hook") && (
                    <MysteryBox
                      categoryColor={activeCategory?.color || "indigo"}
                      isOpen={quizState === "hook"}
                      hookText={activeQuestion.curiosityHook}
                      factTitle={activeQuestion.factTitle}
                      onClick={handleUnwrapBox}
                    />
                  )}

                  {/* STAGE 3: THE DIRECT CHALLENGING QUIZ */}
                  {quizState === "question" && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`bg-${activeCategory?.color}-500/5 border-2 border-${activeCategory?.color}-500/20 p-6 rounded-3xl shadow-xl flex flex-col gap-6`}
                    >
                      {/* Riddle Watermark */}
                      <div className="text-center flex flex-col items-center">
                        <span className={`text-[10px] font-mono uppercase text-${activeCategory?.color}-400 tracking-widest font-bold bg-${activeCategory?.color}-500/15 border border-${activeCategory?.color}-500/20 px-3.5 py-1 rounded-full`}>
                          The Core Challenge • মূল প্রশ্ন
                        </span>
                        
                        <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-snug mt-5 text-center px-1">
                          "{activeQuestion.question}"
                        </h3>
                      </div>

                      {/* Options Grid */}
                      <div className="flex flex-col gap-3.5 mt-2">
                        {activeQuestion.options.map((option, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAnswerSubmit(idx)}
                            id={`quiz_option_btn_${idx}`}
                            className={`p-4 rounded-xl text-left font-display font-black text-sm uppercase tracking-wider border-2 transition-all flex items-center justify-between group bg-${activeCategory?.color}-500/5 border-${activeCategory?.color}-500/20 text-white hover:bg-white hover:text-black hover:border-white shadow-md cursor-pointer`}
                          >
                            <span className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/50 group-hover:bg-black group-hover:text-white group-hover:border-black/20 transition-all">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{option}</span>
                            </span>
                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* STAGE 4: THE EUREKA! MOMENT & VISUAL ANCHOR */}
                  {quizState === "answered" && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-5"
                    >
                      {/* Eureka Banner */}
                      <div
                        className={`p-6 rounded-3xl border-2 text-center flex flex-col items-center shadow-xl ${
                          isCorrectAnswer
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-orange-500/5 border-orange-500/20"
                        }`}
                      >
                        <span className={`text-[11px] font-mono uppercase tracking-widest font-extrabold px-3.5 py-1.5 rounded-full ${
                          isCorrectAnswer ? "bg-emerald-500/15 text-emerald-300" : "bg-orange-500/15 text-orange-300"
                        }`}>
                          {isCorrectAnswer ? "🎉 EXCELLENT! CORRECT ANSWER" : "💡 EUREKA! UNLOCKED AN AHA FACT"}
                        </span>
                        
                        <h4 className="text-white font-display font-black text-3xl tracking-tighter uppercase mt-4">
                          {isCorrectAnswer ? "আপনার উত্তর সঠিক হয়েছে! 🎉" : "আহা! একটি নতুন রহস্য উন্মোচন!"}
                        </h4>
                        
                        <p className={`text-white/80 text-xs sm:text-sm mt-3 px-1 leading-relaxed font-sans font-medium text-left border-l-4 pl-4 border-${isCorrectAnswer ? "emerald" : "orange"}-500`}>
                          {activeQuestion.eurekaExplanation}
                        </p>
                      </div>

                      {/* Video Player Reference Visual Anchor */}
                      <VisualAnchor
                        animationType={activeQuestion.animationType}
                        factTitle={activeQuestion.factTitle}
                      />

                      {/* Next Mystery Button */}
                      <button
                        onClick={handleNextMystery}
                        id="next_mystery_box_btn"
                        className="w-full py-4.5 bg-orange-500 hover:bg-orange-600 rounded-2xl text-black font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01]"
                      >
                        <span>পরবর্তী রহস্য উন্মোচন করুন • Unwrap Next Box</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                </div>

              </div>
            ) : (
              // GENERAL DASHBOARD (HOME, CATEGORIES, BADGES, AI SANDBOX)
              <div className="flex flex-col gap-5 flex-1">
                
                {/* DAILY MOMENTUM CHALLENGE HERO */}
                {activeTab === "home" && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-6 rounded-3xl bg-orange-500/10 border-2 border-orange-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4"
                  >
                    {/* Glowing Accent Blur */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold text-orange-400 tracking-wider uppercase">
                        Today's Curiosity • আজকের কৌতূহল
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        কোন পাখিটি পিছন দিকে উড়তে পারে? উড়ন্ত হেলিকপ্টার!
                      </h3>
                      <p className="text-white/60 text-xs mt-3 font-sans leading-relaxed font-medium">
                        Uncover the mystery riddle. The answer might surprise your intellect. Tapping grants bonus +100 Momentum Points!
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectCategory(CATEGORIES[1])}
                      id="unlock_daily_box_btn"
                      className="self-start px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-display font-black uppercase tracking-tighter text-black shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
                    >
                      <span>রহস্য বাক্স খুলুন • Unwrap Box</span>
                    </button>
                  </motion.div>
                )}

                {/* TAB CONTENT 1: HOME DISCOVER */}
                {activeTab === "home" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        Choose Your Path • কৌতূহলের পথ
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        Discover Categories • বিভাগের তালিকা
                      </h3>
                    </div>

                    {/* Category List */}
                    <div className="flex flex-col gap-3.5">
                      {CATEGORIES.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectCategory(category)}
                          className={`p-5 rounded-2xl bg-${category.color}-500/5 border-2 border-${category.color}-500/20 hover:border-${category.color}-500 transition-all group relative overflow-hidden flex items-center justify-between shadow-lg shadow-${category.color}-500/5 hover:shadow-${category.color}-500/15 cursor-pointer`}
                        >
                          <div className="flex items-center gap-4 pl-1">
                            <div className={`p-3 rounded-xl bg-${category.color}-500/15 text-${category.color}-400 group-hover:scale-110 transition-transform`}>
                              <CategoryIcon name={category.icon} size={22} />
                            </div>
                            <div>
                              <h4 className={`font-display font-black text-2xl text-${category.color}-400 group-hover:text-white transition-colors mb-0.5`}>
                                {category.bengaliName}
                              </h4>
                              <span className="text-[11px] font-bold tracking-wider uppercase text-white/50 group-hover:text-white/80 transition-colors">
                                {category.name} • {category.bengaliVibe}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <ChevronRight className={`w-5 h-5 text-${category.color}-400 group-hover:text-white group-hover:translate-x-1 transition-all`} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom general play trigger */}
                    <button
                      onClick={handleStartRandomBox}
                      id="random_play_start_btn"
                      className="w-full py-4.5 bg-orange-500 hover:bg-orange-600 rounded-2xl text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01]"
                    >
                      <Sparkles className="w-5 h-5 fill-current" />
                      <span>রেন্ডম প্রশ্ন খেলুন • Instant Random Play</span>
                    </button>
                  </div>
                )}

                {/* TAB CONTENT 2: DETAILS OF CATEGORIES */}
                {activeTab === "categories" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        Domain Guide • তথ্যের ক্ষেত্র
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        তথ্যের নানা রঙ • Colors of Knowledge
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium">
                        Each domain of knowledge has its own color theme, emotional vibration, and educational vibe.
                      </p>
                    </div>

                    <div className="flex flex-col gap-5 mt-2">
                      {CATEGORIES.map((category) => (
                        <div
                          key={category.id}
                          className={`p-6 rounded-3xl bg-${category.color}-500/5 border-2 border-${category.color}-500/20 relative overflow-hidden flex flex-col gap-4 shadow-xl shadow-${category.color}-500/5`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl bg-${category.color}-500/15 text-${category.color}-400`}>
                                <CategoryIcon name={category.icon} size={22} />
                              </div>
                              <div>
                                <h4 className={`font-display font-black text-2xl text-${category.color}-400`}>
                                  {category.bengaliName}
                                </h4>
                                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block mt-0.5">{category.name}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] px-3 py-1 bg-${category.color}-500/15 text-${category.color}-300 rounded-full font-bold uppercase tracking-wider`}>
                              {category.vibe}
                            </span>
                          </div>

                          <p className={`text-white/80 text-xs sm:text-sm font-sans leading-relaxed border-l-4 border-${category.color}-500 pl-4 py-1`}>
                            {category.bengaliDescription}
                          </p>

                          <button
                            onClick={() => handleSelectCategory(category)}
                            id={`start_category_btn_${category.id}`}
                            className={`w-full py-3 bg-${category.color}-500 hover:bg-${category.color}-600 rounded-xl text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]`}
                          >
                            <span>বিভাগ খেলুন • Explore {category.name}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 3: GAMIFIED BADGES */}
                {activeTab === "badges" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        Achievement Board • অর্জন ও পদক
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        আপনার অর্জন ও পদক • Your Badges
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium">
                        Solve specific categories correctly and gain massive momentum points to unwrap rare milestone badges.
                      </p>
                    </div>

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-1.5">
                      <div className="p-5 rounded-2xl bg-white/[0.02] border-2 border-white/10 text-center flex flex-col justify-center shadow-lg">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Unlocked Badges</span>
                        <span className="text-3xl font-display font-black text-amber-400 mt-1.5">
                          {userStats.unlockedBadges.length} <span className="text-xs text-white/50 font-sans">/ 6</span>
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/[0.02] border-2 border-white/10 text-center flex flex-col justify-center shadow-lg">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Total Score</span>
                        <span className="text-3xl font-display font-black text-emerald-400 mt-1.5">
                          {userStats.points} <span className="text-xs text-white/50 font-sans">Pts</span>
                        </span>
                      </div>
                    </div>

                    {/* Badges Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {BADGES.map((badge) => (
                        <BadgeCard
                          key={badge.id}
                          badge={badge}
                          isUnlocked={userStats.unlockedBadges.includes(badge.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 4: INFINITE AI GENERATOR SANDBOX */}
                {activeTab === "ai_sandbox" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        AI Generator • এআই স্যান্ডবক্স
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        ইউনিক কৌতূহল বক্স • Gemini Sandbox
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium">
                        Type any topic or theme in the world. Our server-side Gemini 3.5 AI engine will dynamically construct a thrilling Mystery Box challenge for you.
                      </p>
                    </div>

                    {/* Form input */}
                    <form onSubmit={handleGenerateAIBox} className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono uppercase text-orange-400 font-bold">
                          Enter Topic / বিষয় লিখুন:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. Black Holes, Dinosaurs, Sundarbans..."
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            disabled={loadingAI}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-white/10 text-white font-sans font-bold placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500 pr-12 transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                            <Search className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Display potential warning/errors */}
                      {aiError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p className="font-sans leading-normal font-medium">{aiError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loadingAI || !customTopic.trim()}
                        className={`w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01] ${
                          loadingAI ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {loadingAI ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Gemini AI is Wrapping Box...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 fill-current" />
                            <span>রহস্য বাক্স তৈরি করুন • Generate AI Mystery Box</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* AI Loading Showcase Suspense Panel */}
                    {loadingAI && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-3xl bg-white/5 border border-purple-500/10 text-center flex flex-col items-center gap-4 mt-2"
                      >
                        {/* Spinning loader */}
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400 animate-spin flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 animate-ping"></div>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">
                            Gemini is researching fascinating facts...
                          </h4>
                          <p className="text-white/40 text-[10px] font-mono mt-1 leading-relaxed">
                            Formulating Curiosity Hook, Scrambling Options, & Drafting Eureka stories
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Quick Suggestions list */}
                    {!loadingAI && (
                      <div className="flex flex-col gap-3 mt-2">
                        <span className="text-[10px] font-mono uppercase text-white/40">Popular AI Topics:</span>
                        <div className="flex flex-wrap gap-2">
                          {["Quantum Mechanics", "Ancient Egypt", "Deep Ocean Beasts", "Space Travel", "spices history"].map((topicStr, index) => (
                            <button
                              key={index}
                              onClick={() => setCustomTopic(topicStr)}
                              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-white/70 hover:text-white font-sans transition-all"
                            >
                              {topicStr}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT 5: KNOWLEDGE ARCHIVE */}
                {activeTab === "archive" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        Knowledge Archive • তথ্যের আর্কাইভ
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase">
                        উন্মোচিত তথ্যের আর্কাইভ • Discovered Facts
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium">
                        Revisit all your solved mysteries, listen to voice explanations, and browse your learned Eureka moments.
                      </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-3 mt-1">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search facts by title, keyword, or description..."
                          value={archiveSearch}
                          onChange={(e) => setArchiveSearch(e.target.value)}
                          className="w-full px-5 py-3.5 pl-11 rounded-2xl bg-slate-950 border-2 border-white/10 text-white font-sans font-bold placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500 transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                          <Search className="w-4 h-4" />
                        </div>
                        {archiveSearch && (
                          <button
                            onClick={() => setArchiveSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-sans font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Horizontal Category Tags */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        <button
                          onClick={() => {
                            playSound("tap");
                            setArchiveCategoryFilter(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition-all whitespace-nowrap border ${
                            archiveCategoryFilter === null
                              ? "bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/10"
                              : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          All ({
                            (() => {
                              const uniqueDiscoveredFactsMap = new Map<string, Question>();
                              (userStats.discoveredFactTitles || []).forEach(t => {
                                const found = DEFAULT_QUESTIONS.find(q => q.factTitle === t);
                                if (found) uniqueDiscoveredFactsMap.set(t, found);
                              });
                              customQuestions.forEach(q => uniqueDiscoveredFactsMap.set(q.factTitle, q));
                              return uniqueDiscoveredFactsMap.size;
                            })()
                          })
                        </button>
                        {CATEGORIES.map((cat) => {
                          const count = (() => {
                            const uniqueDiscoveredFactsMap = new Map<string, Question>();
                            (userStats.discoveredFactTitles || []).forEach(t => {
                              const found = DEFAULT_QUESTIONS.find(q => q.factTitle === t && q.category === cat.id);
                              if (found) uniqueDiscoveredFactsMap.set(t, found);
                            });
                            customQuestions.forEach(q => {
                              if (q.category === cat.id) {
                                uniqueDiscoveredFactsMap.set(q.factTitle, q);
                              }
                            });
                            return uniqueDiscoveredFactsMap.size;
                          })();

                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                playSound("tap");
                                setArchiveCategoryFilter(cat.id);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition-all whitespace-nowrap border flex items-center gap-1 ${
                                archiveCategoryFilter === cat.id
                                  ? `bg-${cat.color}-500 border-${cat.color}-500 text-black shadow-lg`
                                  : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                              }`}
                            >
                              <span>{cat.bengaliName}</span>
                              <span className="text-[10px] opacity-70">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Discovered list container */}
                    <div className="flex flex-col gap-4 mt-2">
                      {(() => {
                        const uniqueDiscoveredFactsMap = new Map<string, Question>();
                        const currentTitles = userStats.discoveredFactTitles || [];
                        
                        DEFAULT_QUESTIONS.forEach(q => {
                          if (currentTitles.includes(q.factTitle)) {
                            uniqueDiscoveredFactsMap.set(q.factTitle, q);
                          }
                        });
                        
                        customQuestions.forEach(q => {
                          uniqueDiscoveredFactsMap.set(q.factTitle, q);
                        });
                        
                        const allDiscovered = Array.from(uniqueDiscoveredFactsMap.values());
                        
                        // Filter by category
                        let filtered = allDiscovered;
                        if (archiveCategoryFilter) {
                          filtered = filtered.filter(q => q.category === archiveCategoryFilter);
                        }
                        
                        // Filter by search text
                        if (archiveSearch.trim()) {
                          const query = archiveSearch.toLowerCase();
                          filtered = filtered.filter(q => 
                            q.factTitle.toLowerCase().includes(query) ||
                            q.question.toLowerCase().includes(query) ||
                            q.eurekaExplanation.toLowerCase().includes(query) ||
                            q.curiosityHook.toLowerCase().includes(query)
                          );
                        }
                        
                        // Sort by category sequence
                        const categoryOrder = ["class3_gk", "science", "nature", "history", "tech", "art"];
                        const sorted = [...filtered].sort((a, b) => {
                          const idxA = categoryOrder.indexOf(a.category);
                          const idxB = categoryOrder.indexOf(b.category);
                          const catDiff = (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                          if (catDiff !== 0) return catDiff;
                          return a.factTitle.localeCompare(b.factTitle, "bn");
                        });

                        if (sorted.length === 0) {
                          return (
                            <div className="p-8 rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/10 text-center flex flex-col items-center gap-4 py-12">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30">
                                <Archive className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-sm">কোনো তথ্য খুঁজে পাওয়া যায়নি!</h4>
                                <p className="text-white/40 text-xs mt-1 leading-relaxed max-w-xs font-sans">
                                  {archiveSearch 
                                    ? "আপনার সার্চের সাথে মিলে যায় এমন কোনো তথ্য এই আর্কাইভে নেই।"
                                    : "আপনি এখনো কোনো রহস্য বাক্স সফলভাবে সমাধান করেননি। কুইজ খেলে নতুন রহস্যগুলো আবিষ্কার করুন!"}
                                </p>
                              </div>
                              {!archiveSearch && (
                                <button
                                  onClick={() => {
                                    playSound("tap");
                                    setActiveTab("home");
                                  }}
                                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-display font-black uppercase text-black transition-all"
                                >
                                  কুইজ শুরু করুন • Play Quizzes
                                </button>
                              )}
                            </div>
                          );
                        }

                        return sorted.map((fact, index) => {
                          const catProfile = CATEGORIES.find(c => c.id === fact.category) || CATEGORIES[0];
                          const isExpanded = expandedFact === fact.factTitle;

                          return (
                            <motion.div
                              key={fact.factTitle}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`rounded-2xl bg-slate-950 border-2 transition-all overflow-hidden ${
                                isExpanded 
                                  ? `border-${catProfile.color}-500/50 shadow-lg shadow-${catProfile.color}-500/5` 
                                  : `border-${catProfile.color}-500/10 hover:border-${catProfile.color}-500/30`
                              }`}
                            >
                              {/* Header Trigger */}
                              <div
                                onClick={() => {
                                  playSound("tap");
                                  setExpandedFact(isExpanded ? null : fact.factTitle);
                                }}
                                className="p-4 flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-${catProfile.color}-500/15 text-${catProfile.color}-400 group-hover:scale-105 transition-transform`}>
                                    <CategoryIcon name={catProfile.icon} size={16} />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-mono tracking-wider uppercase text-white/30 block leading-none mb-0.5">
                                      {catProfile.bengaliName} • {catProfile.name}
                                    </span>
                                    <h4 className="text-white font-bold text-sm leading-tight group-hover:text-orange-400 transition-colors">
                                      {fact.factTitle}
                                    </h4>
                                  </div>
                                </div>

                                <div className="p-1 rounded bg-white/5 text-white/40 group-hover:text-white transition-colors">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>

                              {/* Expandable Eureka details panel */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-white/5 bg-black/40 p-4 flex flex-col gap-3.5"
                                  >
                                    {/* Curiosity Hook Riddle */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-mono uppercase text-orange-400/80 font-bold tracking-wider">
                                        কৌতুহল সূত্র • Curiosity Hook
                                      </span>
                                      <p className="text-xs text-white/70 leading-relaxed font-sans font-medium">
                                        {fact.curiosityHook}
                                      </p>
                                    </div>

                                    {/* Question */}
                                    <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                                      <span className="text-[10px] font-mono uppercase text-cyan-400/80 font-bold tracking-wider">
                                        অনুসন্ধানী প্রশ্ন • Quiz Question
                                      </span>
                                      <p className="text-xs text-white font-bold leading-relaxed font-sans">
                                        {fact.question}
                                      </p>
                                    </div>

                                    {/* Correct Answer badge */}
                                    <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                                        সঠিক উত্তর • Solution:
                                      </span>
                                      <span className="text-xs font-sans font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">
                                        {fact.options[fact.answerIndex]}
                                      </span>
                                    </div>

                                    {/* Full Eureka Explanation */}
                                    <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                                      <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
                                        ইউরেকা ব্যাখ্যা • Eureka Explanation
                                      </span>
                                      <p className="text-xs text-white/90 leading-relaxed font-sans font-medium border-l-2 border-purple-500/30 pl-3 py-0.5">
                                        {fact.eurekaExplanation}
                                      </p>
                                    </div>

                                    {/* Play Narrator button */}
                                    <div className="flex items-center gap-3 border-t border-white/5 pt-3 justify-end">
                                      <button
                                        onClick={() => {
                                          playSound("tap");
                                          cancelSpeech();
                                          speakText(fact.eurekaExplanation, "auto");
                                        }}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-white transition-all text-xs font-sans font-bold"
                                      >
                                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                        <span>আবৃত্তি শুনুন • Play Narration</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          playSound("tap");
                                          cancelSpeech();
                                        }}
                                        className="flex items-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all text-[10px] font-mono uppercase"
                                      >
                                        Stop
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* PERSISTENT FOOTER NAVIGATION TAB BAR */}
          <div className="px-5 py-4 bg-black/90 border-t border-white/5 flex items-center justify-between z-20 relative">
            
            {/* Discover Hub */}
            <button
              onClick={() => {
                playSound("tap");
                setActiveTab("home");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "home" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Discover</span>
            </button>

            {/* Colors Grid */}
            <button
              onClick={() => {
                playSound("tap");
                setActiveTab("categories");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "categories" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Colors</span>
            </button>

            {/* AI Generator Sandbox */}
            <button
              onClick={() => {
                playSound("tap");
                setActiveTab("ai_sandbox");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "ai_sandbox" ? "text-purple-400 animate-pulse" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-current" />
              <span className="text-[9px] font-sans font-bold">AI Sandbox</span>
            </button>

            {/* Badges Screen */}
            <button
              onClick={() => {
                playSound("tap");
                setActiveTab("badges");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "badges" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Badges</span>
            </button>

            {/* Archive Screen */}
            <button
              onClick={() => {
                playSound("tap");
                setActiveTab("archive");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "archive" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Archive className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Archive</span>
            </button>
          </div>

        </div>

        {/* Footer helper links (Only visible on full width screens) */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-white/30 px-2 font-mono">
          <span>D-Likon: তথ্যের নানা রঙ v1.4 • 2026</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gemini 3.5 Powered
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
