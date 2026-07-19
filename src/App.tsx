import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
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
  Info,
  Users,
  Upload,
  Printer,
  Plus,
  Trash2,
  UserPlus,
  Calendar,
  X,
  Crown,
  Timer,
  Settings,
  Mic,
  Tv,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

import { CATEGORIES, BADGES, DEFAULT_QUESTIONS } from "./data";
import { Question, Category, Badge, UserStats, EventParticipant, EventSession } from "./types";
import { playSynthSound } from "./utils/audio";
import { speakText, setSpeechEnabled, getSpeechEnabled, cancelSpeech } from "./utils/speech";
// @ts-ignore
import dLikonLogo from "./assets/images/d_likon_logo_1783768017322.jpg";

import MysteryBox from "./components/MysteryBox";
import VisualAnchor from "./components/VisualAnchor";
import BadgeCard from "./components/BadgeCard";
import NotificationCenter from "./components/NotificationCenter";
import CategoryIcon from "./components/CategoryIcon";

const PRESET_AVATARS = [
  { id: "avatar1", emoji: "🎓", label: "Scholar Boy" },
  { id: "avatar2", emoji: "🎒", label: "Scholar Girl" },
  { id: "avatar3", emoji: "🚀", label: "Little Scientist" },
  { id: "avatar4", emoji: "🎨", label: "Little Artist" },
  { id: "avatar5", emoji: "🦁", label: "Little Lion" },
  { id: "avatar6", emoji: "⚡", label: "Super Kid" },
];

export default function App() {
  // Splash Screen & Setup
  const [showSplash, setShowSplash] = useState(true);
  const [initPercent, setInitPercent] = useState(0);

  // Set browser title on mount
  useEffect(() => {
    document.title = "ডিলিকন জিনিয়াস কুইক কুইজ";
  }, []);

  // Layout Controls
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "badges" | "ai_sandbox" | "archive" | "event" | "leaderboard" | "host">("home");

  // Perspective Mode: GK (General Knowledge) or SK (Special Knowledge)
  const [activityPerspective, setActivityPerspective] = useState<"gk" | "sk">(() => {
    try {
      const saved = localStorage.getItem("dlikon_activity_perspective");
      if (saved === "gk" || saved === "sk") return saved;
    } catch (e) {
      console.warn("Could not read activity perspective", e);
    }
    return "sk"; // Default to "Special Knowledge" per user's prompt ("This is the era of Special Knowledge")
  });

  // Save selected perspective to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_activity_perspective", activityPerspective);
    } catch (e) {
      console.warn("Could not save activity perspective", e);
    }
  }, [activityPerspective]);

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

  // Soundpack select state
  const [soundPack, setSoundPack] = useState<"classic" | "retro" | "zen" | "synth">(() => {
    try {
      const saved = localStorage.getItem("dlikon_sound_pack");
      if (saved === "classic" || saved === "retro" || saved === "zen" || saved === "synth") {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read sound pack", e);
    }
    return "classic";
  });

  // Save selected sound pack to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_sound_pack", soundPack);
    } catch (e) {
      console.warn("Could not save sound pack to localStorage", e);
    }
  }, [soundPack]);

  // Difficulty level config state
  const [quizDifficulty, setQuizDifficulty] = useState<"beginner" | "intermediate" | "advanced">(() => {
    try {
      const saved = localStorage.getItem("dlikon_difficulty");
      if (saved === "beginner" || saved === "intermediate" || saved === "advanced") {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read difficulty", e);
    }
    return "beginner";
  });

  // Save selected difficulty to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_difficulty", quizDifficulty);
    } catch (e) {
      console.warn("Could not save difficulty to localStorage", e);
    }
  }, [quizDifficulty]);

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

  // Leaderboard States
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardClassFilter, setLeaderboardClassFilter] = useState<string>("All");
  const [leaderboardEventFilter, setLeaderboardEventFilter] = useState<string>("All");
  const [leaderboardSubTab, setLeaderboardSubTab] = useState<"leaderboard" | "performance">("leaderboard");
  const [selectedPerformanceParticipant, setSelectedPerformanceParticipant] = useState<string>("");

  // Event Zone Management States
  const [events, setEvents] = useState<EventSession[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_event_sessions");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read events from localStorage", e);
    }
    return [
      {
        id: "event-pre-1",
        title: "প্রথম ট্রাইমেস্টার কুইজ ২০২৬ (First Trimester Quiz 2026)",
        date: "2026-03-15",
        isActive: false,
        participants: [
          {
            id: "p-pre-1-1",
            name: "সাদিয়া রহমান (Sadia Rahman)",
            className: "৩য় (Class 3)",
            roll: "০৫",
            photoUrl: "avatar2",
            score: 200,
            solvedCount: 2,
            totalAttempted: 5,
            joinedAt: "2026-03-15T09:00:00.000Z"
          },
          {
            id: "p-pre-1-2",
            name: "আরিফ বিল্লাহ (Arif Billah)",
            className: "৩য় (Class 3)",
            roll: "১২",
            photoUrl: "avatar3",
            score: 300,
            solvedCount: 3,
            totalAttempted: 5,
            joinedAt: "2026-03-15T09:05:00.000Z"
          },
          {
            id: "p-pre-1-3",
            name: "তাহসিন হাসান (Tahsin Hasan)",
            className: "৩য় (Class 3)",
            roll: "০২",
            photoUrl: "avatar1",
            score: 400,
            solvedCount: 4,
            totalAttempted: 5,
            joinedAt: "2026-03-15T09:10:00.000Z"
          }
        ]
      },
      {
        id: "event-pre-2",
        title: "অর্ধ-বার্ষিক প্রস্তুতি পরীক্ষা ২০২৬ (Mid-term Prep Quiz 2026)",
        date: "2026-05-20",
        isActive: false,
        participants: [
          {
            id: "p-pre-2-1",
            name: "সাদিয়া রহমান (Sadia Rahman)",
            className: "৩য় (Class 3)",
            roll: "০৫",
            photoUrl: "avatar2",
            score: 300,
            solvedCount: 3,
            totalAttempted: 5,
            joinedAt: "2026-05-20T09:00:00.000Z"
          },
          {
            id: "p-pre-2-2",
            name: "আরিফ বিল্লাহ (Arif Billah)",
            className: "৩য় (Class 3)",
            roll: "১২",
            photoUrl: "avatar3",
            score: 450,
            solvedCount: 4,
            totalAttempted: 5,
            joinedAt: "2026-05-20T09:05:00.000Z"
          },
          {
            id: "p-pre-2-3",
            name: "তাহসিন হাসান (Tahsin Hasan)",
            className: "৩য় (Class 3)",
            roll: "০২",
            photoUrl: "avatar1",
            score: 200,
            solvedCount: 2,
            totalAttempted: 5,
            joinedAt: "2026-05-20T09:10:00.000Z"
          }
        ]
      },
      {
        id: "event-1",
        title: "বার্ষিক কুইজ উৎসব ২০২৬ (Annual Quiz 2026)",
        date: "2026-07-10",
        isActive: true,
        participants: [
          {
            id: "p-1",
            name: "সাদিয়া রহমান (Sadia Rahman)",
            className: "৩য় (Class 3)",
            roll: "০৫",
            photoUrl: "avatar2",
            score: 400,
            solvedCount: 4,
            totalAttempted: 5,
            joinedAt: new Date().toISOString()
          },
          {
            id: "p-2",
            name: "আরিফ বিল্লাহ (Arif Billah)",
            className: "৩য় (Class 3)",
            roll: "১২",
            photoUrl: "avatar3",
            score: 500,
            solvedCount: 5,
            totalAttempted: 5,
            joinedAt: new Date().toISOString()
          },
          {
            id: "p-3",
            name: "তাহসিন হাসান (Tahsin Hasan)",
            className: "৩য় (Class 3)",
            roll: "০২",
            photoUrl: "avatar1",
            score: 300,
            solvedCount: 3,
            totalAttempted: 5,
            joinedAt: new Date().toISOString()
          }
        ]
      }
    ];
  });

  const [activeEventId, setActiveEventId] = useState<string | null>("event-1");
  const [currentEventPlayerId, setCurrentEventPlayerId] = useState<string | null>(null);
  const [eventQuizQuestions, setEventQuizQuestions] = useState<Question[]>([]);
  const [eventQuizIndex, setEventQuizIndex] = useState<number>(0);
  const [eventQuizScore, setEventQuizScore] = useState<number>(0);
  const [eventQuizState, setEventQuizState] = useState<"idle" | "playing" | "summary">("idle");
  const [eventQuizSelectedAnswer, setEventQuizSelectedAnswer] = useState<number | null>(null);
  const [eventTimeAttack, setEventTimeAttack] = useState<boolean>(false);
  const [eventTimeLeft, setEventTimeLeft] = useState<number>(10);
  
  // Certificate and Winner display states
  const [selectedCertificateParticipant, setSelectedCertificateParticipant] = useState<EventParticipant | null>(null);
  const [certificateEventName, setCertificateEventName] = useState<string>("বার্ষিক কুইজ উৎসব ২০২৬ (Annual Quiz 2026)");
  const [eventShareCopied, setEventShareCopied] = useState<boolean>(false);

  // Event Form States
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantClass, setNewParticipantClass] = useState("৩য় (Class 3)");
  const [newParticipantRoll, setNewParticipantRoll] = useState("");
  const [newParticipantPhoto, setNewParticipantPhoto] = useState("avatar1"); // base64 string OR preset avatar ID

  // Host Stage & Projector Mode States
  const [hostSelectedParticipant, setHostSelectedParticipant] = useState<string>("সাদিয়া রহমান (Sadia Rahman)");
  const [hostSelectedQuestion, setHostSelectedQuestion] = useState<Question | null>(null);
  const [hostParticipants, setHostParticipants] = useState<string[]>([
    "সাদিয়া রহমান (Sadia Rahman)",
    "আরিফ বিল্লাহ (Arif Billah)",
    "তাহসিন হাসান (Tahsin Hassan)",
    "নুসরাত জাহান (Nusrat Jahan)",
    "সাইমন ইসলাম (Saimon Islam)"
  ]);
  const [hostStateStatus, setHostStateStatus] = useState<"idle" | "assigned" | "correct" | "incorrect">("idle");
  const [hostIsProjectorMode, setHostIsProjectorMode] = useState<boolean>(false);
  const [hostNewParticipantName, setHostNewParticipantName] = useState("");

  // Time Attack Mode Countdown Timer
  useEffect(() => {
    if (eventQuizState === "playing" && eventTimeAttack && eventQuizSelectedAnswer === null) {
      setEventTimeLeft(10);
      const timer = setInterval(() => {
        setEventTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setEventQuizSelectedAnswer(-1);
            playSound("incorrect");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [eventQuizState, eventQuizIndex, eventTimeAttack, eventQuizSelectedAnswer]);

  // Save event sessions to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem("dlikon_event_sessions", JSON.stringify(events));
    } catch (e) {
      console.warn("Could not save events to localStorage", e);
    }
  }, [events]);

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

  // 1. Add participant to active event
  const handleAddParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantRoll.trim()) {
      alert("দয়া করে নাম এবং রোল ইনপুট দিন!");
      return;
    }
    
    playSound("tap");
    
    const newParticipant: EventParticipant = {
      id: `p-${Date.now()}`,
      name: newParticipantName.trim(),
      className: newParticipantClass.trim(),
      roll: newParticipantRoll.trim(),
      photoUrl: newParticipantPhoto,
      score: 0,
      solvedCount: 0,
      totalAttempted: 0,
      joinedAt: new Date().toISOString()
    };

    setEvents(prev => prev.map(evt => {
      if (evt.id === activeEventId) {
        return {
          ...evt,
          participants: [...evt.participants, newParticipant]
        };
      }
      return evt;
    }));

    // Reset inputs
    setNewParticipantName("");
    setNewParticipantRoll("");
    setNewParticipantPhoto("avatar1");
    
    playSound("correct");
  };

  // 2. Remove participant from event
  const handleRemoveParticipant = (participantId: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই অংশগ্রহণকারীকে মুছে ফেলতে চান?")) {
      playSound("tap");
      setEvents(prev => prev.map(evt => {
        if (evt.id === activeEventId) {
          return {
            ...evt,
            participants: evt.participants.filter(p => p.id !== participantId)
          };
        }
        return evt;
      }));
    }
  };

  // 3. Start event quiz for a participant
  const handleStartEventQuiz = (participantId: string) => {
    playSound("tap");
    const activeEvt = events.find(e => e.id === activeEventId);
    const participant = activeEvt?.participants.find(p => p.id === participantId);
    if (!participant) return;

    // Filter questions by selected perspective (GK vs SK)
    const pool = DEFAULT_QUESTIONS.filter(q => {
      if (activityPerspective === "gk") {
        return q.category === "class3_gk";
      } else {
        return q.category !== "class3_gk";
      }
    });

    // Get 5 random questions from matching chosen difficulty
    let filtered = pool.filter((q) => q.difficulty === quizDifficulty);
    if (filtered.length < 5) {
      const extra = pool.filter((q) => q.difficulty !== quizDifficulty);
      filtered = [...filtered, ...extra];
    }
    // Final fallback if filtered pool is empty
    if (filtered.length === 0) {
      filtered = pool.length > 0 ? pool : DEFAULT_QUESTIONS;
    }
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    setCurrentEventPlayerId(participantId);
    setEventQuizQuestions(selected);
    setEventQuizIndex(0);
    setEventQuizScore(0);
    setEventQuizSelectedAnswer(null);
    setEventTimeLeft(10);
    setEventQuizState("playing");
  };

  // 4. Submit answer in event quiz
  const handleEventAnswerSubmit = (optionIndex: number) => {
    if (eventQuizSelectedAnswer !== null) return; // already answered

    setEventQuizSelectedAnswer(optionIndex);
    const currentQ = eventQuizQuestions[eventQuizIndex];
    const isCorrect = optionIndex === currentQ.answerIndex;

    if (isCorrect) {
      playSound("correct");
      setEventQuizScore(prev => prev + 100);
      triggerConfettiBlast();
    } else {
      playSound("incorrect");
    }
  };

  // 5. Advance or Finish event quiz
  const handleNextEventQuestion = () => {
    playSound("tap");
    if (eventQuizIndex < 4) {
      setEventQuizIndex(prev => prev + 1);
      setEventQuizSelectedAnswer(null);
    } else {
      // Last question completed! Save score!
      setEvents(prev => prev.map(evt => {
        if (evt.id === activeEventId) {
          return {
            ...evt,
            participants: evt.participants.map(p => {
              if (p.id === currentEventPlayerId) {
                return {
                  ...p,
                  score: eventQuizScore,
                  solvedCount: eventQuizScore / 100,
                  totalAttempted: 5
                };
              }
              return p;
            })
          };
        }
        return evt;
      }));

      setEventQuizState("summary");
      playSound("badge");
      triggerConfettiBlast();
    }
  };

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
      playSynthSound(type, soundPack);
    }
  };

  // Triggered when clicking a specific category profile
  const handleSelectCategory = (category: Category) => {
    playSound("tap");
    setActiveCategory(category);
    // Find a default question from the selected category matching chosen difficulty
    let filtered = DEFAULT_QUESTIONS.filter((q) => q.category === category.id && q.difficulty === quizDifficulty);
    if (filtered.length === 0) {
      filtered = DEFAULT_QUESTIONS.filter((q) => q.category === category.id);
    }
    const randomQ = filtered[Math.floor(Math.random() * filtered.length)] || DEFAULT_QUESTIONS[0];
    
    setActiveQuestion(randomQ);
    setQuizState("idle");
    setUserAnswerIndex(null);
  };

  // Start general random Mystery Box
  const handleStartRandomBox = () => {
    playSound("tap");
    let filtered = DEFAULT_QUESTIONS.filter((q) => q.difficulty === quizDifficulty);
    if (filtered.length === 0) {
      filtered = DEFAULT_QUESTIONS;
    }
    const randomQ = filtered[Math.floor(Math.random() * filtered.length)];
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
      // Find a different question from same category matching chosen difficulty
      let filtered = DEFAULT_QUESTIONS.filter((q) => q.category === activeCategory.id && q.difficulty === quizDifficulty);
      if (filtered.length === 0) {
        filtered = DEFAULT_QUESTIONS.filter((q) => q.category === activeCategory.id);
      }
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
          category: activeCategory?.id || "science",
          difficulty: quizDifficulty
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
          category: matchedCategory.id,
          difficulty: resData.data.difficulty || quizDifficulty
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
        className={`w-full transition-all duration-500 z-10 flex flex-col print:hidden ${
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
                  <img
                    src={dLikonLogo}
                    alt="D-Likon Logo"
                    className="w-24 h-24 rounded-full border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 mb-4 object-cover"
                    referrerPolicy="no-referrer"
                  />
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
                <img
                  src={dLikonLogo}
                  alt="D-Likon Logo"
                  className="w-10 h-10 rounded-xl border border-orange-500/30 shadow-lg shadow-orange-500/10 object-cover"
                  referrerPolicy="no-referrer"
                />
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

                {/* Host Mode Toggle */}
                <button
                  onClick={() => {
                    playSound("tap");
                    setActiveTab(activeTab === "host" ? "home" : "host");
                    setActiveQuestion(null);
                    setQuizState("idle");
                  }}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                    activeTab === "host"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold"
                      : "bg-white/5 border-white/5 text-amber-400/80 hover:text-amber-400"
                  }`}
                  title="Host & Projector Mode • সঞ্চালক ও প্রজেক্টর"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[9px] font-sans font-bold hidden sm:inline">STAGE</span>
                </button>

                {/* Settings Toggle */}
                <button
                  onClick={() => {
                    playSound("tap");
                    setActiveTab(activeTab === "settings" ? "home" : "settings");
                    setActiveQuestion(null);
                    setQuizState("idle");
                  }}
                  className={`p-1.5 rounded-lg border transition-all ${
                    activeTab === "settings"
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
                      : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                  }`}
                  title="Settings & Soundboard • সেটিংস"
                >
                  <Settings className="w-3.5 h-3.5" />
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
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                    {activeQuestion.difficulty && (
                      <span className={`text-[10px] font-mono text-white/80 font-bold bg-white/10 border border-white/20 px-2.5 py-1 rounded-md uppercase`}>
                        {activeQuestion.difficulty === "beginner" ? "সহজ • Beginner" : activeQuestion.difficulty === "intermediate" ? "মধ্যম • Intermediate" : "কঠিন • Advanced"}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono text-${activeCategory?.color}-400 font-bold bg-${activeCategory?.color}-500/15 border border-${activeCategory?.color}-500/20 px-2.5 py-1 rounded-md uppercase`}>
                      {activeCategory?.vibe}
                    </span>
                  </div>
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
                
                {/* DUAL PERSPECTIVE SELECTION PANELS */}
                {activeTab === "home" && (
                  <motion.div
                    initial={{ y: -15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-1 shadow-2xl relative overflow-hidden"
                  >
                    {/* GK Button */}
                    <button
                      onClick={() => {
                        playSound("tap");
                        setActivityPerspective("gk");
                      }}
                      className={`flex-1 flex flex-col items-center justify-center py-3.5 px-2.5 rounded-xl transition-all duration-300 relative select-none cursor-pointer ${
                        activityPerspective === "gk"
                          ? "bg-amber-500 text-black shadow-lg font-black"
                          : "text-white/40 hover:text-white/60 font-bold"
                      }`}
                      style={{ minHeight: "52px" }}
                    >
                      <div className="flex items-center gap-1.5 justify-center">
                        <Award className={`w-4 h-4 ${activityPerspective === "gk" ? "fill-current" : ""}`} />
                        <span className="text-xs uppercase tracking-wider font-display">১। GK জেনারেল নলেজ</span>
                      </div>
                      <span className="text-[9px] mt-0.5 opacity-80 font-sans tracking-tight block">কন্টেস্ট ও মেধা মূল্যায়ন জোন</span>
                      {activityPerspective === "gk" && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" />
                      )}
                    </button>

                    {/* Divider Line */}
                    <div className="h-8 w-[1px] bg-white/10" />

                    {/* SK Button */}
                    <button
                      onClick={() => {
                        playSound("tap");
                        setActivityPerspective("sk");
                      }}
                      className={`flex-1 flex flex-col items-center justify-center py-3.5 px-2.5 rounded-xl transition-all duration-300 relative select-none cursor-pointer ${
                        activityPerspective === "sk"
                          ? "bg-indigo-500 text-white shadow-lg font-black"
                          : "text-white/40 hover:text-white/60 font-bold"
                      }`}
                      style={{ minHeight: "52px" }}
                    >
                      <div className="flex items-center gap-1.5 justify-center">
                        <Sparkles className={`w-4 h-4 ${activityPerspective === "sk" ? "fill-current" : ""}`} />
                        <span className="text-xs uppercase tracking-wider font-display">২। SK স্পেশাল নলেজ</span>
                      </div>
                      <span className="text-[9px] mt-0.5 opacity-80 font-sans tracking-tight block">রহস্য বাক্স ও কৌতূহলের পথ</span>
                      {activityPerspective === "sk" && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                      )}
                    </button>
                  </motion.div>
                )}

                {/* GK PERSPECTIVE CONTENT */}
                {activeTab === "home" && activityPerspective === "gk" && (
                  <div className="flex flex-col gap-5">
                    
                    {/* GK Contest Hero Card */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col gap-4"
                    >
                      {/* Gold Accent Blur */}
                      <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase">
                          GK Contest Center • সাধারণ জ্ঞান উৎসব
                        </span>
                      </div>

                      <div>
                        <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-tight uppercase">
                          কুইজ কন্টেস্ট তৈরী ও পরিচালনা করুন!
                        </h3>
                        <p className="text-white/60 text-xs mt-2 font-sans leading-relaxed font-medium">
                          ঐতিহ্যবাহী সাধারণ জ্ঞান প্রতিযোগিতা এবং কুইজ উৎসবের কন্টেস্ট তৈরি করুন। সঞ্চালকের ভূমিকা নিয়ে বড় পর্দায় শিক্ষার্থীদের সঠিক উত্তর চিহ্নিত করার অভিনব প্রযুক্তি।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-1.5 font-sans">
                        <button
                          onClick={() => {
                            playSound("tap");
                            setActiveTab("event");
                          }}
                          className="px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-black font-display font-black text-xs uppercase tracking-tighter text-center shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          🏆 কন্টেস্ট তৈরি করুন
                        </button>
                        <button
                          onClick={() => {
                            playSound("tap");
                            setActiveTab("host");
                          }}
                          className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-display font-black text-xs uppercase tracking-tighter text-center border border-white/10 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          🎙️ সঞ্চালক উইন্ডো
                        </button>
                      </div>
                    </motion.div>

                    {/* Individual GK Play Zone Title */}
                    <div className="flex flex-col mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-1">
                        Individual Study • একক মূল্যায়ন
                      </span>
                      <h3 className="text-white font-display font-black text-2xl tracking-tighter leading-none uppercase">
                        পাঠ্যবই ভিত্তিক সাধারণ জ্ঞান
                      </h3>
                    </div>

                    {/* Class 3 GK category Card */}
                    {CATEGORIES.filter(c => c.id === "class3_gk").map((category) => (
                      <motion.div
                        key={category.id}
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectCategory(category)}
                        className={`p-6 rounded-3xl bg-amber-500/5 border-2 border-amber-500/30 hover:border-amber-500 transition-all group relative overflow-hidden flex items-center justify-between shadow-lg shadow-amber-500/5 cursor-pointer`}
                      >
                        <div className="flex items-center gap-4 pl-1">
                          <div className={`p-3.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform`}>
                            <CategoryIcon name={category.icon} size={24} />
                          </div>
                          <div>
                            <h4 className={`font-display font-black text-2xl text-amber-400 group-hover:text-white transition-colors mb-0.5`}>
                              {category.bengaliName}
                            </h4>
                            <span className="text-xs font-bold tracking-wider uppercase text-white/50 group-hover:text-white/80 transition-colors">
                              {category.name} • {category.bengaliVibe}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-5 h-5 text-amber-400 group-hover:text-white group-hover:translate-x-1 transition-all`} />
                        </div>
                      </motion.div>
                    ))}

                    {/* Easy Guide banner */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left flex gap-3.5 items-start mt-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs leading-relaxed font-sans text-white/60">
                        <strong className="text-white block mb-0.5 font-bold">💡 কুইজ মডারেটর টিপস:</strong>
                        সঞ্চালক বড় পর্দায় শিক্ষার্থীদের নাম ধরে অভিনন্দন জানাতে প্রথমে <span className="text-amber-400 font-bold">Contest</span> ট্যাবে গিয়ে শিক্ষার্থীদের তালিকাযুক্ত করুন। এরপর <span className="text-amber-400 font-bold">Host</span> স্টেজ থেকে প্রশ্ন বরাদ্দ করে কুইজ পরিচালনা শুরু করুন!
                      </div>
                    </div>

                  </div>
                )}

                {/* DAILY MOMENTUM CHALLENGE HERO */}
                {activeTab === "home" && activityPerspective === "sk" && (
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
                      className="self-start px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-display font-black uppercase tracking-tighter text-black shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>রহস্য বাক্স খুলুন • Unwrap Box</span>
                    </button>
                  </motion.div>
                )}

                {/* TAB CONTENT 1: HOME DISCOVER */}
                {activeTab === "home" && activityPerspective === "sk" && (
                  <div className="flex flex-col gap-6">
                    {/* DIFFICULTY LEVEL SELECTOR */}
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-5 rounded-3xl bg-white/5 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-orange-400 block leading-none">
                          Challenge Intensity • কুইজের মান
                        </span>
                        <h4 className="text-white font-sans font-black text-lg mt-1.5 block">
                          Set Quiz Difficulty Level
                        </h4>
                      </div>
                      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
                        {(["beginner", "intermediate", "advanced"] as const).map((level) => {
                          const isActive = quizDifficulty === level;
                          const labelBn = level === "beginner" ? "সহজ" : level === "intermediate" ? "মধ্যম" : "কঠিন";
                          const labelEn = level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced";
                          const activeColorClass = level === "beginner" ? "bg-emerald-500 text-black font-black" : level === "intermediate" ? "bg-orange-500 text-black font-black" : "bg-red-500 text-black font-black";
                          return (
                            <button
                              key={level}
                              onClick={() => {
                                playSound("tap");
                                setQuizDifficulty(level);
                              }}
                              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                isActive ? activeColorClass : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span className="block leading-none text-center font-bold">{labelBn}</span>
                              <span className="block text-[8px] opacity-75 mt-0.5 text-center leading-none font-bold">{labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>

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
                      {CATEGORIES.filter((category) => category.id !== "class3_gk").map((category) => (
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
                      onClick={() => {
                        playSound("tap");
                        // Pick random question from Special Knowledge only
                        const pool = DEFAULT_QUESTIONS.filter(q => q.category !== "class3_gk" && q.difficulty === quizDifficulty);
                        const randomQ = pool[Math.floor(Math.random() * pool.length)] || DEFAULT_QUESTIONS[0];
                        const categoryProfile = CATEGORIES.find((c) => c.id === randomQ.category) || CATEGORIES[0];
                        setActiveCategory(categoryProfile);
                        setActiveQuestion(randomQ);
                        setQuizState("idle");
                        setUserAnswerIndex(null);
                      }}
                      id="random_play_start_btn"
                      className="w-full py-4.5 bg-orange-500 hover:bg-orange-600 rounded-2xl text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.01] cursor-pointer"
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

                {/* TAB CONTENT 6: EVENT ZONE */}
                {activeTab === "event" && (
                  <div className="flex flex-col gap-5 flex-1">
                    
                    {/* Header */}
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-1 animate-pulse">
                        Event Zone • স্কুলের কুইজ উৎসব
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase text-left">
                        ইভেন্ট জোন ও মেধা মূল্যায়ন
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium text-left">
                        সহজেই স্কুলের কুইজ ইভেন্ট পরিচালনা করুন। অংশগ্রহণকারীদের তালিকা তৈরি করুন, লাইভ স্কোর ট্র্যাক করুন এবং সর্বোচ্চ স্কোরধারীর জন্য মেধা প্রশংসাপত্র (Certificate) জেনারেট করুন!
                      </p>
                    </div>

                    {/* EVENT QUIZ GAMEPLAY CONTROLLER (ACTIVE GAME MODE) */}
                    {eventQuizState === "playing" && currentEventPlayerId && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-5 rounded-3xl bg-slate-950 border-2 flex flex-col gap-5 relative overflow-hidden text-left transition-all duration-300 ${
                          eventTimeAttack
                            ? eventTimeLeft <= 3 && eventQuizSelectedAnswer === null
                              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                              : "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                            : "border-purple-500/30"
                        }`}
                      >
                        {/* Background subtle neon glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                        
                        {/* Player Header Card */}
                        {(() => {
                          const activeEvt = events.find(e => e.id === activeEventId);
                          const player = activeEvt?.participants.find(p => p.id === currentEventPlayerId);
                          if (!player) return null;
                          const isPreset = (player.photoUrl || "").startsWith("avatar");
                          return (
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-left gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl overflow-hidden font-bold">
                                  {isPreset ? (
                                    <span className="text-2xl">
                                      {player.photoUrl === "avatar1" ? "🎓" :
                                       player.photoUrl === "avatar2" ? "🎒" :
                                       player.photoUrl === "avatar3" ? "🚀" :
                                       player.photoUrl === "avatar4" ? "🎨" :
                                       player.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                    </span>
                                  ) : (
                                    <img src={player.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block leading-none mb-1 text-left">
                                    Active Player • কুইজ খেলছে
                                  </span>
                                  <h4 className="text-white font-bold text-base leading-none text-left">{player.name}</h4>
                                  <span className="text-[10px] text-white/50 block mt-1 text-left">শ্রেণি: {player.className} • রোল: {player.roll}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {eventTimeAttack && (
                                  <div id="event-timer-badge" className={`px-3 py-1.5 rounded-xl text-center border transition-all duration-300 ${
                                    eventQuizSelectedAnswer !== null 
                                      ? "bg-white/5 border-white/5 text-white/40"
                                      : eventTimeLeft <= 3 
                                        ? "bg-red-500/15 border-red-500/30 text-red-400 animate-pulse" 
                                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  }`}>
                                    <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-0.5">Time Left</span>
                                    <span className="text-xs font-mono font-black flex items-center justify-center gap-1">
                                      ⏱️ {eventQuizSelectedAnswer === -1 ? "0s" : `${eventTimeLeft}s`}
                                    </span>
                                  </div>
                                )}
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-center">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold leading-none mb-0.5">Event Score</span>
                                  <span className="text-sm font-mono font-black text-emerald-400">{eventQuizScore} Pts</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Current Question Block */}
                        {eventQuizQuestions.length > 0 && (
                          <div className="flex flex-col gap-4 text-left">
                            
                            {/* Time Attack Progress Bar */}
                            {eventTimeAttack && (
                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5 relative">
                                <motion.div
                                  initial={{ width: "100%" }}
                                  animate={{ width: eventQuizSelectedAnswer !== null ? "100%" : `${(eventTimeLeft / 10) * 100}%` }}
                                  transition={{ duration: eventQuizSelectedAnswer !== null ? 0.3 : 1, ease: "linear" }}
                                  className={`h-full transition-colors duration-300 ${
                                    eventQuizSelectedAnswer !== null
                                      ? "bg-purple-500"
                                      : eventTimeLeft <= 3 
                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" 
                                        : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                  }`}
                                />
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs font-mono text-purple-400 text-left">
                              <span>প্রশ্ন {eventQuizIndex + 1}/৫ (Question {eventQuizIndex + 1}/5)</span>
                              <span className="bg-purple-500/15 px-2.5 py-0.5 rounded-full font-bold">
                                {CATEGORIES.find(c => c.id === eventQuizQuestions[eventQuizIndex].category)?.bengaliName || "সাধারণ জ্ঞান"}
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center my-1 min-h-[100px] flex items-center justify-center">
                              <h4 className="text-white font-display font-black text-lg md:text-xl tracking-tight leading-snug">
                                "{eventQuizQuestions[eventQuizIndex].question}"
                              </h4>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col gap-2.5">
                              {eventQuizQuestions[eventQuizIndex].options.map((option, idx) => {
                                const isAnswered = eventQuizSelectedAnswer !== null;
                                const isSelected = eventQuizSelectedAnswer === idx;
                                const isCorrect = idx === eventQuizQuestions[eventQuizIndex].answerIndex;
                                
                                let optStyle = "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/10";
                                if (isAnswered) {
                                  if (isCorrect) {
                                    optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                  } else if (isSelected) {
                                    optStyle = "bg-red-500/20 border-red-500 text-red-400";
                                  } else {
                                    optStyle = "bg-white/5 border-white/5 text-white/20 opacity-50";
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    disabled={isAnswered}
                                    onClick={() => handleEventAnswerSubmit(idx)}
                                    className={`p-3.5 rounded-xl text-left font-sans font-bold text-xs border-2 transition-all flex items-center justify-between group ${optStyle}`}
                                  >
                                    <span className="flex items-center gap-3">
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs ${
                                        isAnswered && isCorrect ? "bg-emerald-500 text-black" :
                                        isAnswered && isSelected ? "bg-red-500 text-white" : "bg-white/5 border border-white/10 text-white/40"
                                      }`}>
                                        {String.fromCharCode(65 + idx)}
                                      </span>
                                      <span>{option}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Actions / Feedback */}
                            {eventQuizSelectedAnswer !== null && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-4 text-left"
                              >
                                <p className="text-xs text-white/70 leading-relaxed font-sans font-medium text-center">
                                  {eventQuizSelectedAnswer === -1 ? (
                                    <span className="text-red-400 font-bold font-sans animate-pulse flex items-center justify-center gap-1.5">
                                      ⏰ সময় শেষ! সঠিক উত্তরটি ছিল: <span className="underline">{eventQuizQuestions[eventQuizIndex].options[eventQuizQuestions[eventQuizIndex].answerIndex]}</span>
                                    </span>
                                  ) : eventQuizSelectedAnswer === eventQuizQuestions[eventQuizIndex].answerIndex ? (
                                    <span className="text-emerald-400 font-bold">🎉 চমৎকার! সঠিক উত্তর দিতে পেরেছেন!</span>
                                  ) : (
                                    <span className="text-red-400 font-bold">
                                      💡 ভুল উত্তর। সঠিক উত্তরটি ছিল: {eventQuizQuestions[eventQuizIndex].options[eventQuizQuestions[eventQuizIndex].answerIndex]}
                                    </span>
                                  )}
                                </p>
                                
                                <button
                                  onClick={handleNextEventQuestion}
                                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-black font-display font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl transition-all cursor-pointer"
                                >
                                  <span>{eventQuizIndex === 4 ? "ফলাফল দেখুন • See Results" : "পরবর্তী প্রশ্ন • Next Question"}</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* EVENT QUIZ SUMMARY CELEBRATION */}
                    {eventQuizState === "summary" && currentEventPlayerId && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/30 text-center flex flex-col items-center gap-5 relative overflow-hidden"
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                        
                        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-2 animate-bounce">
                          <Trophy className="w-8 h-8 fill-current" />
                        </div>

                        {(() => {
                          const activeEvt = events.find(e => e.id === activeEventId);
                          const player = activeEvt?.participants.find(p => p.id === currentEventPlayerId);
                          if (!player) return null;
                          return (
                            <div>
                              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-widest">
                                Challenge Completed • সমাপ্তি
                              </span>
                              <h3 className="text-white font-display font-black text-2xl tracking-tighter mt-1 uppercase">
                                অভিনন্দন, {player.name}!
                              </h3>
                              <p className="text-white/60 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                                আপনি ইভেন্ট কুইজটি অত্যন্ত সফলতার সাথে সম্পন্ন করেছেন। আপনার মেধার মূল্যায়ন এখানে সংরক্ষিত করা হয়েছে।
                              </p>

                              <div className="my-5 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center gap-6">
                                <div className="text-center">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none mb-1">সঠিক উত্তর</span>
                                  <span className="text-lg font-mono font-black text-emerald-400">{eventQuizScore / 100} / ৫</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10" />
                                <div className="text-center">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none mb-1">মোট স্কোর</span>
                                  <span className="text-lg font-mono font-black text-emerald-400">{eventQuizScore} Pts</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2.5 w-full max-w-xs mx-auto">
                                <button
                                  onClick={() => {
                                    playSound("tap");
                                    setSelectedCertificateParticipant(player);
                                  }}
                                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-display font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                                >
                                  <Award className="w-4 h-4 fill-current" />
                                  <span>সনদপত্র ডাউনলোড ও প্রিন্ট • Certificate</span>
                                </button>

                                <button
                                  onClick={async () => {
                                    playSound("tap");
                                    const shareText = `🏆 স্কুলের কুইজ উৎসব - ডি-লিকন মেধা মূল্যায়ন 🏆\n` +
                                      `-----------------------------------------\n` +
                                      `👤 অংশগ্রহণকারী: ${player.name}\n` +
                                      `📚 শ্রেণি: ${player.className} • রোল: ${player.roll}\n` +
                                      `🎯 মোট কুইজ স্কোর: ${eventQuizScore} Pts (${eventQuizScore / 100}/৫টি সঠিক উত্তর!)\n\n` +
                                      `ডি-লিকন মেধা মূল্যায়ন কুইজে আমার স্কোর দেখুন এবং আপনিও আপনার মেধার উজ্জ্বল স্বাক্ষর রাখুন! ✨\n` +
                                      `${window.location.origin}`;

                                    if (navigator.share) {
                                      try {
                                        await navigator.share({
                                          title: "ডি-লিকন কুইজ ফলাফল",
                                          text: shareText,
                                          url: window.location.origin,
                                        });
                                      } catch (err) {
                                        console.log("Error sharing:", err);
                                        // Fallback to clipboard
                                        navigator.clipboard.writeText(shareText).then(() => {
                                          setEventShareCopied(true);
                                          setTimeout(() => setEventShareCopied(false), 2000);
                                        });
                                      }
                                    } else {
                                      navigator.clipboard.writeText(shareText).then(() => {
                                        setEventShareCopied(true);
                                        setTimeout(() => setEventShareCopied(false), 2000);
                                      });
                                    }
                                  }}
                                  className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-sans font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Share2 className="w-4 h-4" />
                                  <span>{eventShareCopied ? "ফলাফল কপি হয়েছে! • Copied!" : "ফলাফল শেয়ার করুন • Share Score"}</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    playSound("tap");
                                    setEventQuizState("idle");
                                    setCurrentEventPlayerId(null);
                                  }}
                                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-sans font-bold rounded-xl text-xs transition-all cursor-pointer"
                                >
                                  ইভেন্ট জোন ড্যাশবোর্ডে ফিরুন • Go Back
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}

                    {/* EVENT ZONE DASHBOARD (DEFAULT VIEW) */}
                    {eventQuizState === "idle" && (
                      <div className="flex flex-col gap-6 text-left">
                        
                        {/* Event Title Block */}
                        {(() => {
                          const activeEvt = events.find(e => e.id === activeEventId);
                          if (!activeEvt) return null;
                          return (
                            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
                              <div className="flex items-center gap-3 text-left">
                                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <span className="text-[9px] font-mono uppercase text-purple-400 block tracking-widest text-left">Active Event • সক্রিয় প্রতিযোগিতা</span>
                                  <h4 className="text-white font-bold text-sm leading-tight mt-0.5 text-left">{activeEvt.title}</h4>
                                  <span className="text-[10px] text-white/40 block mt-1 font-mono text-left">তারিখ: {new Date(activeEvt.date).toLocaleDateString("bn-BD")} • মোট সদস্য: {activeEvt.participants.length} জন</span>
                                </div>
                              </div>
                              
                              {/* Create / Select Event button */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const title = prompt("নতুন প্রতিযোগিতার নাম দিন:", "স্কুল কুইজ প্রতিযোগিতা ২০২৬");
                                    if (title && title.trim()) {
                                      playSound("tap");
                                      const newEvt: EventSession = {
                                        id: `event-${Date.now()}`,
                                        title: title.trim(),
                                        date: new Date().toISOString().split('T')[0],
                                        isActive: true,
                                        participants: []
                                      };
                                      setEvents(prev => [...prev.map(e => ({ ...e, isActive: false })), newEvt]);
                                      setActiveEventId(newEvt.id);
                                      setCertificateEventName(newEvt.title);
                                      playSound("correct");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg text-purple-400 text-[10px] font-sans font-bold transition-all cursor-pointer"
                                >
                                  + নতুন ইভেন্ট
                                </button>
                                {events.length > 1 && (
                                  <select
                                    value={activeEventId || ""}
                                    onChange={(e) => {
                                      playSound("tap");
                                      const id = e.target.value;
                                      setActiveEventId(id);
                                      const selected = events.find(ev => ev.id === id);
                                      if (selected) {
                                        setCertificateEventName(selected.title);
                                      }
                                    }}
                                    className="bg-black/40 border border-white/15 rounded-lg px-2 text-[10px] text-white font-bold focus:outline-none cursor-pointer"
                                  >
                                    {events.map(ev => (
                                      <option key={ev.id} value={ev.id}>{ev.title.substring(0, 18)}...</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* TIME ATTACK MODE CONTROLLER (অ্যাড্রেনালিন কুইজ চ্যালেঞ্জ) */}
                        <div className={`p-4 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden ${
                          eventTimeAttack 
                            ? "bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-red-500/40 shadow-lg shadow-red-500/5" 
                            : "bg-slate-950 border-white/5"
                        }`}>
                          {/* Ambient animation glow behind icon */}
                          {eventTimeAttack && (
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-20 h-20 bg-red-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
                          )}
                          
                          <div className="flex items-center gap-3 relative z-10 text-left">
                            <div className={`p-2.5 rounded-2xl transition-all ${
                              eventTimeAttack ? "bg-red-500/20 text-red-400 animate-bounce" : "bg-white/5 text-white/40"
                            }`}>
                              <Timer className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono uppercase text-red-400 font-bold tracking-widest">Time Attack • তীব্র উত্তেজনাপূর্ণ মোড</span>
                                {eventTimeAttack && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[8px] font-mono font-bold uppercase animate-pulse">Active</span>
                                )}
                              </div>
                              <h4 className="text-white font-bold text-sm leading-tight mt-0.5 text-left">টাইম অ্যাটাক মোড (১০ সেকেন্ড চ্যালেঞ্জ)</h4>
                              <p className="text-white/40 text-[10px] mt-1 font-sans text-left">
                                সক্রিয় করলে প্রতিটি প্রশ্নের উত্তর দেওয়ার জন্য মাত্র ১০ সেকেন্ড সময় পাওয়া যাবে! সময় শেষ হলে প্রশ্নটি স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।
                              </p>
                            </div>
                          </div>

                          {/* Beautiful Interactive Switch Button */}
                          <button
                            onClick={() => {
                              playSound("tap");
                              setEventTimeAttack(!eventTimeAttack);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer relative z-10 shrink-0 ${
                              eventTimeAttack
                                ? "bg-red-500 hover:bg-red-600 text-black shadow-lg shadow-red-500/20"
                                : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                            }`}
                          >
                            <span>{eventTimeAttack ? "বন্ধ করুন (Disable)" : "চালু করুন (Enable)"}</span>
                          </button>
                        </div>

                        {/* WINNER HIGHLIGHT PODIUM (বিজয়ীর ছবি ও তথ্য দৃশ্যমান হওয়া) */}
                        {(() => {
                          const activeEvt = events.find(e => e.id === activeEventId);
                          const participants = activeEvt?.participants || [];
                          if (participants.length === 0) return null;
                          
                          // Find highest scorer (winner)
                          const sorted = [...participants].sort((a, b) => b.score - a.score);
                          const winner = sorted[0];

                          if (winner.score === 0) {
                            return (
                              <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center py-6">
                                <p className="text-xs text-white/40 font-medium">প্রতিযোগিতা চলছে। বিজয়ীর ঘোষণা পেতে যেকোনো অংশগ্রহণকারীর পাশে 'কুইজ খেলুন' বাটনে ক্লিক করুন!</p>
                              </div>
                            );
                          }

                          const isPreset = (winner.photoUrl || "").startsWith("avatar");

                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-amber-500/30 relative overflow-hidden flex flex-col items-center text-center gap-4"
                            >
                              {/* Background sparkles decoration */}
                              <div className="absolute top-3 left-4 text-amber-400/20 animate-pulse"><Sparkles className="w-5 h-5" /></div>
                              <div className="absolute bottom-4 right-4 text-amber-400/20 animate-pulse"><Sparkles className="w-4 h-4" /></div>

                              {/* Crown Badge */}
                              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-mono font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <Crown className="w-3.5 h-3.5 fill-current animate-bounce" />
                                <span>সর্বোচ্চ সঠিক উত্তরদাতা • Champion Winner</span>
                              </div>

                              {/* Winner's Photo Container */}
                              <div className="relative mt-3">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-500/10 flex items-center justify-center shadow-xl shadow-amber-500/10 overflow-hidden">
                                  {isPreset ? (
                                    <span className="text-4xl select-none">
                                      {winner.photoUrl === "avatar1" ? "🎓" :
                                       winner.photoUrl === "avatar2" ? "🎒" :
                                       winner.photoUrl === "avatar3" ? "🚀" :
                                       winner.photoUrl === "avatar4" ? "🎨" :
                                       winner.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                    </span>
                                  ) : (
                                    <img src={winner.photoUrl} className="w-full h-full object-cover" alt={winner.name} referrerPolicy="no-referrer" />
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 text-black border-2 border-black rounded-full flex items-center justify-center font-bold font-mono text-xs shadow-md">
                                  #১
                                </div>
                              </div>

                              <div>
                                <h3 className="text-white font-display font-black text-xl tracking-tight leading-none uppercase">
                                  {winner.name}
                                </h3>
                                <p className="text-amber-400/80 text-xs mt-1.5 font-bold font-sans">
                                  শ্রেণি: {winner.className} • রোল: {winner.roll}
                                </p>
                              </div>

                              <div className="px-5 py-2.5 rounded-2xl bg-black/50 border border-white/5 flex items-center gap-5 justify-center">
                                <div className="text-center border-r border-white/10 pr-5">
                                  <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">সঠিক উত্তর</span>
                                  <span className="text-sm font-mono font-black text-emerald-400">{winner.solvedCount} / ৫টি</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">মোট স্কোর</span>
                                  <span className="text-sm font-mono font-black text-amber-400">{winner.score} Pts</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  playSound("tap");
                                  setSelectedCertificateParticipant(winner);
                                }}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-display font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                              >
                                <Award className="w-4 h-4 fill-current" />
                                <span>চ্যাম্পিয়ন প্রশংসাপত্র জেনারেট করুন</span>
                              </button>
                            </motion.div>
                          );
                        })()}

                        {/* ADD PARTICIPANT FORM */}
                        <div className="p-5 rounded-3xl bg-slate-950 border border-white/5 flex flex-col gap-4 text-left">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <UserPlus className="w-4 h-4 text-purple-400" />
                            <h4 className="text-white font-bold text-sm">নতুন প্রতিযোগী যুক্ত করুন • Add Participant</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 text-left">
                            {/* Name Input */}
                            <div className="col-span-2 flex flex-col gap-1.5 text-left">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-left">নাম (Name):</label>
                              <input
                                type="text"
                                placeholder="সদস্যের পুরো নাম লিখুন..."
                                value={newParticipantName}
                                onChange={(e) => setNewParticipantName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans font-medium text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-white/20"
                              />
                            </div>

                            {/* Class Input */}
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-left">শ্রেণি (Class):</label>
                              <select
                                value={newParticipantClass}
                                onChange={(e) => setNewParticipantClass(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans font-medium text-xs focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                              >
                                <option value="৩য় (Class 3)">৩য় শ্রেণি</option>
                                <option value="৪র্থ (Class 4)">৪র্থ শ্রেণি</option>
                                <option value="৫ম (Class 5)">৫ম শ্রেণি</option>
                                <option value="৬ষ্ঠ (Class 6)">৬ষ্ঠ শ্রেণি</option>
                              </select>
                            </div>

                            {/* Roll Input */}
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-left">রোল (Roll No):</label>
                              <input
                                type="text"
                                placeholder="উদা: ০৫"
                                value={newParticipantRoll}
                                onChange={(e) => setNewParticipantRoll(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans font-medium text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-white/20"
                              />
                            </div>

                            {/* Avatar Picker / Photo Upload */}
                            <div className="col-span-2 flex flex-col gap-2 text-left">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-left">ছবি নির্বাচন করুন (Choose Photo / Avatar):</label>
                              
                              <div className="flex flex-col gap-3">
                                {/* Presets Choice */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                  {PRESET_AVATARS.map((av) => (
                                    <button
                                      key={av.id}
                                      type="button"
                                      onClick={() => setNewParticipantPhoto(av.id)}
                                      className={`p-2.5 rounded-xl flex items-center justify-center text-xl transition-all border-2 ${
                                        newParticipantPhoto === av.id
                                          ? "bg-purple-500/10 border-purple-500 text-white animate-pulse"
                                          : "bg-black/30 border-white/5 text-white/50 hover:border-white/15"
                                      }`}
                                      title={av.label}
                                    >
                                      <span>{av.emoji}</span>
                                    </button>
                                  ))}
                                </div>

                                {/* Custom Upload Toggle */}
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setNewParticipantPhoto(reader.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 rounded-xl transition-all cursor-pointer">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-sans font-bold">নিজস্ব ছবি আপলোড</span>
                                    </div>
                                  </div>

                                  {/* Current Preview */}
                                  {(() => {
                                    const isPreset = newParticipantPhoto.startsWith("avatar");
                                    return (
                                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center overflow-hidden">
                                        {isPreset ? (
                                          <span className="text-xl">
                                            {newParticipantPhoto === "avatar1" ? "🎓" :
                                             newParticipantPhoto === "avatar2" ? "🎒" :
                                             newParticipantPhoto === "avatar3" ? "🚀" :
                                             newParticipantPhoto === "avatar4" ? "🎨" :
                                             newParticipantPhoto === "avatar5" ? "🦁" : "⚡"}
                                          </span>
                                        ) : (
                                          <img src={newParticipantPhoto} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleAddParticipant}
                            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-black font-display font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl transition-all cursor-pointer mt-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>অংশগ্রহণকারী যুক্ত করুন • Add to List</span>
                          </button>
                        </div>

                        {/* PARTICIPANTS LIST GIRD */}
                        <div className="flex flex-col gap-3 text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2 text-left">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5 text-left">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              তালিকাভুক্ত সকল প্রতিযোগী ({(() => {
                                const activeEvt = events.find(e => e.id === activeEventId);
                                return activeEvt?.participants.length || 0;
                              })()} জন)
                            </span>
                          </div>

                          {(() => {
                            const activeEvt = events.find(e => e.id === activeEventId);
                            const participants = activeEvt?.participants || [];
                            
                            if (participants.length === 0) {
                              return (
                                <div className="p-8 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 text-center flex flex-col items-center gap-3 py-10">
                                  <Users className="w-7 h-7 text-white/20" />
                                  <div>
                                    <h5 className="text-white font-bold text-xs">কোনো প্রতিযোগী পাওয়া যায়নি</h5>
                                    <p className="text-white/40 text-[10px] mt-1 font-sans">উপরের ফর্ম ব্যবহার করে প্রথম প্রতিযোগী যুক্ত করুন।</p>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="flex flex-col gap-3 text-left">
                                {participants.map((player) => {
                                  const isPreset = (player.photoUrl || "").startsWith("avatar");
                                  
                                  return (
                                    <motion.div
                                      key={player.id}
                                      className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all group text-left"
                                    >
                                      {/* Left block: Photo & details */}
                                      <div className="flex items-center gap-3 text-left">
                                        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-xl overflow-hidden font-bold relative shrink-0">
                                          {isPreset ? (
                                            <span className="text-xl select-none">
                                              {player.photoUrl === "avatar1" ? "🎓" :
                                               player.photoUrl === "avatar2" ? "🎒" :
                                               player.photoUrl === "avatar3" ? "🚀" :
                                               player.photoUrl === "avatar4" ? "🎨" :
                                               player.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                            </span>
                                          ) : (
                                            <img src={player.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                          )}
                                        </div>
                                        <div className="text-left">
                                          <h4 className="text-white font-bold text-xs group-hover:text-purple-400 transition-colors text-left leading-snug">
                                            {player.name}
                                          </h4>
                                          <span className="text-[10px] text-white/40 block mt-0.5 text-left">
                                            শ্রেণি: {player.className} • রোল: {player.roll}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Right block: Stats & Actions */}
                                      <div className="flex items-center gap-3">
                                        {/* Score ratio */}
                                        <div className="text-right flex flex-col justify-center font-mono">
                                          <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">SCORE</span>
                                          <span className="text-xs font-bold text-emerald-400">
                                            {player.score} Pts {player.totalAttempted > 0 && `(${player.solvedCount}/৫)`}
                                          </span>
                                        </div>

                                        {/* Action triggers */}
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => handleStartEventQuiz(player.id)}
                                            className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-white text-[10px] font-sans font-bold transition-all cursor-pointer"
                                            title="কুইজ খেলুন"
                                          >
                                            🚀 কুইজ
                                          </button>
                                          
                                          {player.totalAttempted > 0 && (
                                            <button
                                              onClick={() => {
                                                playSound("tap");
                                                setSelectedCertificateParticipant(player);
                                              }}
                                              className="p-1.5 bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 hover:text-white transition-all cursor-pointer"
                                              title="সনদপত্র দেখুন"
                                            >
                                              <Award className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                          )}

                                          <button
                                            onClick={() => handleRemoveParticipant(player.id)}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-white transition-all cursor-pointer"
                                            title="মুছে ফেলুন"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT 7: LEADERBOARD ZONE */}
                {activeTab === "leaderboard" && (
                  <div className="flex flex-col gap-5 flex-1">
                    
                    {/* Header */}
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-1 animate-pulse">
                        Leaderboard • গ্লোবাল মেধা তালিকা
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase text-left">
                        কুইজ মেধা তালিকা
                      </h3>
                      <p className="text-white/50 text-xs mt-2 font-sans font-medium text-left">
                        স্কুলের সকল প্রতিযোগিতার অংশগ্রহণকারীদের বৈশ্বিক মেধা মূল্যায়ন। এখানে সবার অর্জিত মোট পয়েন্ট ও সঠিক উত্তরের রেকর্ড দেখা যাবে।
                      </p>
                    </div>

                    {/* SUB-TAB TOGGLES */}
                    <div className="flex border-b border-white/10 mt-1 mb-2 gap-1 self-start">
                      <button
                        onClick={() => {
                          playSound("tap");
                          setLeaderboardSubTab("leaderboard");
                        }}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                          leaderboardSubTab === "leaderboard"
                            ? "text-purple-400 border-b-2 border-purple-500 font-black"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Global Standings • গ্লোবাল মেধা তালিকা
                      </button>
                      <button
                        onClick={() => {
                          playSound("tap");
                          setLeaderboardSubTab("performance");
                        }}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                          leaderboardSubTab === "performance"
                            ? "text-purple-400 border-b-2 border-purple-500 font-black"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Performance History • পারফরম্যান্স ইতিহাস
                      </button>
                    </div>

                    {leaderboardSubTab === "leaderboard" && (
                      <div className="flex flex-col gap-5 flex-1">

                        {/* Overall Stats Grid */}
                    {(() => {
                      // Calculate quick stats across all events
                      let totalParticipants = 0;
                      let highestScore = 0;
                      let totalScore = 0;
                      let participantsWithScoreCount = 0;

                      events.forEach(evt => {
                        evt.participants.forEach(p => {
                          totalParticipants++;
                          totalScore += p.score;
                          if (p.score > highestScore) {
                            highestScore = p.score;
                          }
                          if (p.score > 0) {
                            participantsWithScoreCount++;
                          }
                        });
                      });

                      const avgScore = participantsWithScoreCount > 0 ? Math.round(totalScore / participantsWithScoreCount) : 0;

                      return (
                        <div id="leaderboard-quick-stats" className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">মোট প্রতিযোগী</span>
                            <span className="text-base font-mono font-black text-purple-400">{totalParticipants} জন</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">সর্বোচ্চ স্কোর</span>
                            <span className="text-base font-mono font-black text-amber-400">{highestScore} Pts</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">গড় স্কোর</span>
                            <span className="text-base font-mono font-black text-emerald-400">{avgScore} Pts</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SEARCH & FILTERS ROW */}
                    <div className="flex flex-col md:flex-row gap-3 text-left">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="leaderboard-search-input"
                          type="text"
                          placeholder="প্রতিযোগীর নাম বা রোল দিয়ে খুঁজুন..."
                          value={leaderboardSearch}
                          onChange={(e) => setLeaderboardSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans font-medium text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-white/20"
                        />
                      </div>

                      {/* Class Filter Dropdown */}
                      <div className="flex gap-2">
                        <select
                          id="leaderboard-class-select"
                          value={leaderboardClassFilter}
                          onChange={(e) => {
                            playSound("tap");
                            setLeaderboardClassFilter(e.target.value);
                          }}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 font-bold focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                        >
                          <option value="All">সকল শ্রেণি (All Classes)</option>
                          <option value="৩য়">৩য় শ্রেণি</option>
                          <option value="৪র্থ">৪র্থ শ্রেণি</option>
                          <option value="৫ম">৫ম শ্রেণি</option>
                          <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                        </select>

                        {/* Event Filter Dropdown */}
                        <select
                          id="leaderboard-event-select"
                          value={leaderboardEventFilter}
                          onChange={(e) => {
                            playSound("tap");
                            setLeaderboardEventFilter(e.target.value);
                          }}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 font-bold focus:outline-none focus:border-purple-500 transition-all cursor-pointer max-w-[150px]"
                        >
                          <option value="All">সকল কুইজ (All Events)</option>
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title.substring(0, 15)}...</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* TOP 3 PODIUM DISPLAY */}
                    {(() => {
                      // Process all entries
                      const allEntries: { participant: EventParticipant; eventId: string; eventTitle: string }[] = [];
                      events.forEach(evt => {
                        evt.participants.forEach(p => {
                          allEntries.push({
                            participant: p,
                            eventId: evt.id,
                            eventTitle: evt.title,
                          });
                        });
                      });

                      // Apply search filter
                      let filtered = allEntries.filter(entry => {
                        const nameMatch = entry.participant.name.toLowerCase().includes(leaderboardSearch.toLowerCase());
                        const rollMatch = entry.participant.roll.toLowerCase().includes(leaderboardSearch.toLowerCase());
                        const searchMatch = nameMatch || rollMatch;

                        const classMatch = leaderboardClassFilter === "All" || entry.participant.className.includes(leaderboardClassFilter);
                        const eventMatch = leaderboardEventFilter === "All" || entry.eventId === leaderboardEventFilter;

                        return searchMatch && classMatch && eventMatch;
                      });

                      // Sort by score desc
                      filtered.sort((a, b) => b.participant.score - a.participant.score);

                      if (filtered.length === 0) return null;

                      // Grab Top 3
                      const top3 = filtered.slice(0, 3);
                      if (top3.length < 1) return null;

                      // Order them physically as: 2nd, 1st, 3rd for standard visual podium
                      const orderedPodium = [];
                      if (top3[1]) orderedPodium.push({ rank: 2, ...top3[1] });
                      orderedPodium.push({ rank: 1, ...top3[0] });
                      if (top3[2]) orderedPodium.push({ rank: 3, ...top3[2] });

                      return (
                        <div id="leaderboard-podium" className="grid grid-cols-3 items-end gap-3 p-4 rounded-3xl bg-slate-950/40 border border-white/5 pt-8 pb-4 relative overflow-hidden my-1">
                          
                          {/* Ambient backdrop glow for 1st place */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                          {orderedPodium.map((pod) => {
                            const isPreset = (pod.participant.photoUrl || "").startsWith("avatar");
                            const is1st = pod.rank === 1;
                            const is2nd = pod.rank === 2;
                            const is3rd = pod.rank === 3;

                            let medalColor = "text-amber-400";
                            let borderColor = "border-amber-400";
                            let podiumBg = "bg-amber-500/10";
                            let heightClass = "h-24";

                            if (is2nd) {
                              medalColor = "text-slate-300";
                              borderColor = "border-slate-300/60";
                              podiumBg = "bg-slate-300/5";
                              heightClass = "h-20";
                            } else if (is3rd) {
                              medalColor = "text-amber-600";
                              borderColor = "border-amber-600/60";
                              podiumBg = "bg-amber-600/5";
                              heightClass = "h-16";
                            }

                            return (
                              <div key={pod.participant.id} className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative mb-2">
                                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${borderColor} flex items-center justify-center overflow-hidden bg-black/40 relative shadow-xl`}>
                                    {isPreset ? (
                                      <span className="text-3xl select-none">
                                        {pod.participant.photoUrl === "avatar1" ? "🎓" :
                                         pod.participant.photoUrl === "avatar2" ? "🎒" :
                                         pod.participant.photoUrl === "avatar3" ? "🚀" :
                                         pod.participant.photoUrl === "avatar4" ? "🎨" :
                                         pod.participant.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                      </span>
                                    ) : (
                                      <img src={pod.participant.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                    )}
                                  </div>
                                  
                                  {/* Rank Indicator */}
                                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-black flex items-center justify-center text-[10px] font-mono font-black ${
                                    is1st ? "bg-amber-400 text-black" :
                                    is2nd ? "bg-slate-300 text-black" : "bg-amber-600 text-white"
                                  } shadow-md`}>
                                    #{pod.rank}
                                  </div>

                                  {/* Sparkle/Crown for 1st */}
                                  {is1st && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 animate-pulse">
                                      <Crown className="w-5 h-5 fill-current" />
                                    </div>
                                  )}
                                </div>

                                {/* Details */}
                                <div className="max-w-[100px] md:max-w-xs text-center">
                                  <span className="text-[10px] font-bold text-white leading-tight block truncate mb-0.5">{pod.participant.name.split(" ")[0]}</span>
                                  <span className="text-[8px] text-white/40 block leading-none">শ্রেণি {pod.participant.className.split(" ")[0]}</span>
                                </div>

                                {/* Podium Pedestal */}
                                <div className={`w-full ${heightClass} ${podiumBg} border-t-2 ${borderColor} rounded-t-xl mt-3 flex flex-col items-center justify-center p-1.5`}>
                                  <span className={`text-[10px] font-mono font-black ${medalColor}`}>{pod.participant.score} Pts</span>
                                  <span className="text-[7px] text-white/40 font-mono mt-1">{pod.participant.solvedCount}/৫টি</span>
                                </div>
                              </div>
                            );
                          })}

                        </div>
                      );
                    })()}

                    {/* FULL LEADERS LIST */}
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5 text-left">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          সকল প্রতিযোগীর তালিকা
                        </span>
                      </div>

                      {(() => {
                        // Aggregate all participants
                        const allEntries: { participant: EventParticipant; eventId: string; eventTitle: string }[] = [];
                        events.forEach(evt => {
                          evt.participants.forEach(p => {
                            allEntries.push({
                              participant: p,
                              eventId: evt.id,
                              eventTitle: evt.title,
                            });
                          });
                        });

                        // Filter entries
                        let filtered = allEntries.filter(entry => {
                          const nameMatch = entry.participant.name.toLowerCase().includes(leaderboardSearch.toLowerCase());
                          const rollMatch = entry.participant.roll.toLowerCase().includes(leaderboardSearch.toLowerCase());
                          const searchMatch = nameMatch || rollMatch;

                          const classMatch = leaderboardClassFilter === "All" || entry.participant.className.includes(leaderboardClassFilter);
                          const eventMatch = leaderboardEventFilter === "All" || entry.eventId === leaderboardEventFilter;

                          return searchMatch && classMatch && eventMatch;
                        });

                        // Sort globally
                        filtered.sort((a, b) => b.participant.score - a.participant.score);

                        if (filtered.length === 0) {
                          return (
                            <div className="p-8 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 text-center flex flex-col items-center gap-3 py-10">
                              <Users className="w-7 h-7 text-white/20" />
                              <div>
                                <h5 className="text-white font-bold text-xs">কোনো প্রতিযোগী পাওয়া যায়নি</h5>
                                <p className="text-white/40 text-[10px] mt-1 font-sans">অনুসন্ধান বা ফিল্টারের মান পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div id="leaderboard-players-list" className="flex flex-col gap-3 text-left">
                            {filtered.map((entry, index) => {
                              const p = entry.participant;
                              const isPreset = (p.photoUrl || "").startsWith("avatar");
                              
                              return (
                                <motion.div
                                  key={`${entry.eventId}-${p.id}`}
                                  className="p-3 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all group text-left"
                                >
                                  {/* Left section: rank, photo, name/details */}
                                  <div className="flex items-center gap-3 text-left">
                                    {/* Rank column */}
                                    <div className="w-6 text-center shrink-0">
                                      <span className={`text-xs font-mono font-black ${
                                        index === 0 ? "text-amber-400" :
                                        index === 1 ? "text-slate-300" :
                                        index === 2 ? "text-amber-600" : "text-white/30"
                                      }`}>
                                        #{index + 1}
                                      </span>
                                    </div>

                                    {/* Profile pic */}
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-lg overflow-hidden font-bold relative shrink-0">
                                      {isPreset ? (
                                        <span className="text-lg select-none">
                                          {p.photoUrl === "avatar1" ? "🎓" :
                                           p.photoUrl === "avatar2" ? "🎒" :
                                           p.photoUrl === "avatar3" ? "🚀" :
                                           p.photoUrl === "avatar4" ? "🎨" :
                                           p.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                        </span>
                                      ) : (
                                        <img src={p.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                      )}
                                    </div>

                                    <div className="text-left max-w-[120px] md:max-w-[200px]">
                                      <h4 className="text-white font-bold text-xs group-hover:text-purple-400 transition-colors text-left leading-snug truncate">
                                        {p.name}
                                      </h4>
                                      <span className="text-[9px] text-white/40 block mt-0.5 text-left truncate">
                                        শ্রেণি: {p.className} • রোল: {p.roll}
                                      </span>
                                      <span className="text-[8px] text-purple-400/80 block mt-0.5 font-sans truncate" title={entry.eventTitle}>
                                        ইভেন্ট: {entry.eventTitle.split(" ")[0]}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right section: stats & actions */}
                                  <div className="flex items-center gap-3">
                                    <div className="text-right flex flex-col justify-center font-mono shrink-0">
                                      <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">SCORE</span>
                                      <span className="text-xs font-bold text-emerald-400">
                                        {p.score} Pts
                                      </span>
                                      <span className="text-[8px] text-white/30 block leading-none font-mono mt-0.5">
                                        {p.solvedCount}/৫
                                      </span>
                                    </div>

                                    {/* Share and Certificate Trigger Actions */}
                                    <div className="flex items-center gap-1">
                                      {/* Certificate Trigger directly from Leaderboard */}
                                      {p.totalAttempted > 0 && (
                                        <button
                                          onClick={() => {
                                            playSound("tap");
                                            setCertificateEventName(entry.eventTitle);
                                            setSelectedCertificateParticipant(p);
                                          }}
                                          className="p-1.5 bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 hover:text-white transition-all cursor-pointer"
                                          title="সনদপত্র দেখুন"
                                        >
                                          <Award className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                      )}

                                      {/* Share Button */}
                                      <button
                                        onClick={async () => {
                                          playSound("tap");
                                          const shareText = `🏆 স্কুলের কুইজ উৎসব - গ্লোবাল মেধা তালিকা 🏆\n` +
                                            `-----------------------------------------\n` +
                                            `👤 প্রতিযোগী: ${p.name}\n` +
                                            `📚 শ্রেণি: ${p.className} • রোল: ${p.roll}\n` +
                                            `🎉 মেধা তালিকায় স্থান: #${index + 1}\n` +
                                            `🎯 মোট কুইজ স্কোর: ${p.score} Pts (${p.solvedCount}/৫টি সঠিক উত্তর!)\n\n` +
                                            `ডি-লিকন মেধা তালিকায় আমার স্থান দেখুন এবং আপনিও অংশ নিন! ✨\n` +
                                            `${window.location.origin}`;

                                          if (navigator.share) {
                                            try {
                                              await navigator.share({
                                                title: "ডি-লিকন কুইজ মেধা তালিকা",
                                                text: shareText,
                                                url: window.location.origin,
                                              });
                                            } catch (err) {
                                              console.log("Error sharing:", err);
                                              // Fallback
                                              navigator.clipboard.writeText(shareText).then(() => {
                                                setEventShareCopied(true);
                                                setTimeout(() => setEventShareCopied(false), 2000);
                                              });
                                            }
                                          } else {
                                            navigator.clipboard.writeText(shareText).then(() => {
                                              setEventShareCopied(true);
                                              setTimeout(() => setEventShareCopied(false), 2000);
                                            });
                                          }
                                        }}
                                        className="p-1.5 bg-purple-500/10 hover:bg-purple-500/25 rounded-lg text-purple-400 hover:text-white transition-all cursor-pointer"
                                        title="শেয়ার করুন"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                    {/* PERFORMANCE HISTORY VIEW */}
                    {leaderboardSubTab === "performance" && (
                      <div className="flex flex-col gap-6 flex-1 text-left">
                        
                        {/* Participant Selection Card */}
                        <div className="p-6 rounded-3xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 block leading-none">
                              Select Participant • প্রতিযোগী নির্বাচন
                            </span>
                            <h4 className="text-white font-sans font-black text-lg mt-1.5 block">
                              Track Academic Progress & Evolution
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                              Choose a participant to analyze their interactive quiz score trajectories over past events.
                            </p>
                          </div>

                          <div className="w-full sm:w-auto min-w-[240px]">
                            <select
                              value={selectedPerformanceParticipant}
                              onChange={(e) => {
                                playSound("tap");
                                setSelectedPerformanceParticipant(e.target.value);
                              }}
                              className="w-full bg-black/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold font-sans focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                            >
                              {Array.from(
                                new Set(events.flatMap(evt => evt.participants.map(p => p.name)))
                              )
                                .sort()
                                .map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {(() => {
                          if (!selectedPerformanceParticipant) {
                            return (
                              <div className="p-10 rounded-3xl bg-white/[0.01] border-2 border-dashed border-white/10 text-center py-16">
                                <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                <h5 className="text-white font-bold text-sm">কোনো প্রতিযোগী নির্বাচিত হয়নি</h5>
                                <p className="text-white/40 text-[11px] mt-1 font-sans">অনুগ্রহ করে উপরোক্ত তালিকা থেকে একজন প্রতিযোগী বেছে নিন।</p>
                              </div>
                            );
                          }

                          // Gather participation entries chronologically
                          const participantEntries = events
                            .map(evt => {
                              const p = evt.participants.find(part => part.name === selectedPerformanceParticipant);
                              if (!p) return null;
                              return {
                                eventId: evt.id,
                                eventTitle: evt.title,
                                eventDate: evt.date,
                                participant: p,
                              };
                            })
                            .filter((item): item is NonNullable<typeof item> => item !== null)
                            .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

                          if (participantEntries.length === 0) {
                            return (
                              <div className="p-10 rounded-3xl bg-white/[0.01] border-2 border-dashed border-white/10 text-center py-16">
                                <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                <h5 className="text-white font-bold text-sm">কোনো তথ্য পাওয়া যায়নি</h5>
                                <p className="text-white/40 text-[11px] mt-1 font-sans">এই প্রতিযোগীর জন্য পূর্ববর্তী কোনো কুইজের রেকর্ড পাওয়া যায়নি।</p>
                              </div>
                            );
                          }

                          // Get latest entry details for profile card
                          const latestEntry = participantEntries[participantEntries.length - 1];
                          const isPreset = (latestEntry.participant.photoUrl || "").startsWith("avatar");

                          // Aggregate summary statistics
                          const totalPlayed = participantEntries.length;
                          const totalScore = participantEntries.reduce((sum, item) => sum + item.participant.score, 0);
                          const avgScore = Math.round(totalScore / totalPlayed);
                          const highestScore = Math.max(...participantEntries.map(item => item.participant.score));
                          const totalCorrect = participantEntries.reduce((sum, item) => sum + item.participant.solvedCount, 0);
                          const totalQuestions = participantEntries.reduce((sum, item) => sum + item.participant.totalAttempted, 0);
                          const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

                          // Prepare Recharts chart data
                          const chartData = participantEntries.map(item => {
                            // Strip parentheses content from event titles for cleaner x-axis labels
                            const shortTitle = item.eventTitle.replace(/\s*\(.*\)/, "").trim();
                            return {
                              eventName: shortTitle,
                              fullTitle: item.eventTitle,
                              score: item.participant.score,
                              solved: item.participant.solvedCount,
                              date: item.eventDate,
                            };
                          });

                          return (
                            <div className="flex flex-col gap-6">
                              
                              {/* Participant Profile summary */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                {/* Info Card */}
                                <div className="p-5 rounded-3xl bg-slate-950/40 border border-white/5 flex items-center gap-4 col-span-1">
                                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-3xl overflow-hidden font-bold relative shrink-0">
                                    {isPreset ? (
                                      <span className="text-3xl select-none">
                                        {latestEntry.participant.photoUrl === "avatar1" ? "🎓" :
                                         latestEntry.participant.photoUrl === "avatar2" ? "🎒" :
                                         latestEntry.participant.photoUrl === "avatar3" ? "🚀" :
                                         latestEntry.participant.photoUrl === "avatar4" ? "🎨" :
                                         latestEntry.participant.photoUrl === "avatar5" ? "🦁" : "⚡"}
                                      </span>
                                    ) : (
                                      <img src={latestEntry.participant.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                    )}
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <h5 className="text-white font-sans font-black text-base truncate leading-tight uppercase">
                                      {latestEntry.participant.name}
                                    </h5>
                                    <span className="text-[10px] text-slate-400 block mt-1 font-sans font-bold leading-none">
                                      শ্রেণি: {latestEntry.participant.className}
                                    </span>
                                    <span className="text-[10px] text-purple-400 block mt-1.5 font-mono leading-none">
                                      রোল আইডি: {latestEntry.participant.roll}
                                    </span>
                                  </div>
                                </div>

                                {/* Summary Statistics */}
                                <div className="p-5 rounded-3xl bg-slate-950/40 border border-white/5 col-span-2 grid grid-cols-4 gap-3">
                                  <div className="flex flex-col justify-center text-center p-2 rounded-2xl bg-black/30 border border-white/5">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">মোট ইভেন্ট</span>
                                    <span className="text-base font-mono font-black text-purple-400">{totalPlayed}</span>
                                  </div>
                                  <div className="flex flex-col justify-center text-center p-2 rounded-2xl bg-black/30 border border-white/5">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">গড় স্কোর</span>
                                    <span className="text-base font-mono font-black text-emerald-400">{avgScore} Pts</span>
                                  </div>
                                  <div className="flex flex-col justify-center text-center p-2 rounded-2xl bg-black/30 border border-white/5">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">সর্বোচ্চ স্কোর</span>
                                    <span className="text-base font-mono font-black text-amber-400">{highestScore}</span>
                                  </div>
                                  <div className="flex flex-col justify-center text-center p-2 rounded-2xl bg-black/30 border border-white/5">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">সঠিক উত্তর</span>
                                    <span className="text-base font-mono font-black text-cyan-400">{accuracy}%</span>
                                  </div>
                                </div>

                              </div>

                              {/* RECHARTS SCORE EVOLUTION LINE CHART */}
                              <div className="p-6 rounded-3xl bg-slate-950 border border-white/5 shadow-2xl flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400 block leading-none">
                                      Analytical Visualization • মেধা রেখাচিত্র
                                    </span>
                                    <h4 className="text-white font-sans font-black text-base mt-1 block">
                                      Score Evolution Trajectory
                                    </h4>
                                  </div>
                                  <span className="text-[9px] bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2.5 py-1 rounded-full uppercase leading-none font-bold font-mono">
                                    {totalPlayed > 1 ? `${totalPlayed} Events Tracked` : `Single Event Point`}
                                  </span>
                                </div>

                                <div className="h-64 md:h-72 w-full mt-2 font-sans text-[10px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                      data={chartData}
                                      margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                      <XAxis 
                                        dataKey="eventName" 
                                        stroke="rgba(255,255,255,0.4)" 
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                      />
                                      <YAxis 
                                        stroke="rgba(255,255,255,0.4)" 
                                        domain={[0, (dataMax: number) => Math.max(600, Math.ceil(dataMax / 100) * 100)]}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: '#020617',
                                          border: '1px solid rgba(255,255,255,0.1)',
                                          borderRadius: '16px',
                                          color: '#fff',
                                          fontSize: '11px',
                                          textAlign: 'left'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', color: '#a855f7', marginBottom: '4px' }}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Score (Pts)"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        activeDot={{ r: 8, stroke: '#020617', strokeWidth: 2 }}
                                        dot={{ r: 5, fill: '#d8b4fe', strokeWidth: 1 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* DETAILED HISTORIC LIST */}
                              <div className="flex flex-col gap-3">
                                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold text-left block border-b border-white/5 pb-2">
                                  Detailed Historic Quiz Record • কুইজ রেকর্ড
                                </span>

                                <div className="flex flex-col gap-2.5">
                                  {participantEntries.map((item, idx) => {
                                    return (
                                      <div
                                        key={item.eventId}
                                        className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-purple-500/10 transition-all"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono text-purple-400">
                                            #{idx + 1}
                                          </div>
                                          <div className="text-left">
                                            <h5 className="text-white font-sans font-bold text-xs leading-snug">
                                              {item.eventTitle}
                                            </h5>
                                            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                                              তারিখ: {item.eventDate}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                                          <div className="text-left sm:text-right font-mono">
                                            <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">SCORE</span>
                                            <span className="text-xs font-bold text-emerald-400 block">{item.participant.score} Pts</span>
                                          </div>
                                          <div className="text-left sm:text-right font-mono">
                                            <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">SOLVED</span>
                                            <span className="text-xs font-bold text-purple-400 block">{item.participant.solvedCount}/৫</span>
                                          </div>
                                          <div className="text-left sm:text-right font-mono">
                                            <span className="text-[8px] text-slate-500 block leading-none font-bold uppercase mb-0.5">ACCURACY</span>
                                            <span className="text-xs font-bold text-cyan-400 block">
                                              {item.participant.totalAttempted > 0 ? Math.round((item.participant.solvedCount / item.participant.totalAttempted) * 100) : 0}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          );
                        })()}

                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT 8: SETTINGS & SOUNDBOARD */}
                {activeTab === "settings" && (
                  <div className="flex flex-col gap-6 flex-1 text-left">
                    
                    {/* Header */}
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-1">
                        Settings & Preferences • সেটিংস ও পছন্দসমূহ
                      </span>
                      <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase text-left">
                        CONTROL CENTER
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-2 text-left font-sans">
                        Customize your interactive quiz environment, audio options, narration speech, and soundboard effects.
                      </p>
                    </div>

                    {/* SOUNDBOARD PACK SELECTION */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl flex flex-col gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-400 block leading-none">
                            Soundboard Selection • সাউন্ডবোর্ড প্যাক
                          </span>
                        </div>
                        <h4 className="text-white font-sans font-black text-xl mt-1.5 block">
                          Interactive Audio Sound Packs
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                          Choose an acoustic aesthetic theme for interactive pop taps, correct answers, wrong selections, and unlocked badges.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {/* 1. Classic Spark */}
                        <button
                          onClick={() => {
                            setSoundPack("classic");
                            playSynthSound("correct", "classic");
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                            soundPack === "classic"
                              ? "bg-purple-500/10 border-purple-500 text-purple-300 animate-pulse-once"
                              : "bg-black/30 border-white/5 text-white/70 hover:border-white/15 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-purple-400 leading-none block">
                                Default • ডিফল্ট
                              </span>
                              <h5 className="font-sans font-black text-base text-white mt-1 leading-none">
                                Classic Spark
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/25 text-purple-400 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                              Classic
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mt-2 leading-normal">
                            Beautiful high-fidelity acoustic chime chords, perfect for a modern learning environment.
                          </p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("tap", "classic");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🔊 Tap
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("correct", "classic");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🎉 Win
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("incorrect", "classic");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              ❌ Lose
                            </button>
                          </div>
                        </button>

                        {/* 2. Retro Arcade */}
                        <button
                          onClick={() => {
                            setSoundPack("retro");
                            playSynthSound("correct", "retro");
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                            soundPack === "retro"
                              ? "bg-amber-500/10 border-amber-500 text-amber-300"
                              : "bg-black/30 border-white/5 text-white/70 hover:border-white/15 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 leading-none block">
                                8-Bit • অ্যাথলেট
                              </span>
                              <h5 className="font-sans font-black text-base text-white mt-1 leading-none">
                                Retro Arcade
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                              Arcade
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mt-2 leading-normal">
                            Bouncy 8-bit NES style square wave beeps, laser blips, and nostalgic video game melodies.
                          </p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("tap", "retro");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🔊 Tap
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("correct", "retro");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🎉 Win
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("incorrect", "retro");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              ❌ Lose
                            </button>
                          </div>
                        </button>

                        {/* 3. Nature Zen */}
                        <button
                          onClick={() => {
                            setSoundPack("zen");
                            playSynthSound("correct", "zen");
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                            soundPack === "zen"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                              : "bg-black/30 border-white/5 text-white/70 hover:border-white/15 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400 leading-none block">
                                Meditative • প্রাকৃতিক
                              </span>
                              <h5 className="font-sans font-black text-base text-white mt-1 leading-none">
                                Nature Zen
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                              Zen
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mt-2 leading-normal">
                            Deep organic sine-wave vibrations, soft wooden blocks, and peaceful tibetan bowl resonance.
                          </p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("tap", "zen");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🔊 Tap
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("correct", "zen");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🎉 Win
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("incorrect", "zen");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              ❌ Lose
                            </button>
                          </div>
                        </button>

                        {/* 4. Futuristic Synth */}
                        <button
                          onClick={() => {
                            setSoundPack("synth");
                            playSynthSound("correct", "synth");
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                            soundPack === "synth"
                              ? "bg-cyan-500/10 border-cyan-500 text-cyan-300"
                              : "bg-black/30 border-white/5 text-white/70 hover:border-white/15 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 leading-none block">
                                Cyberpunk • কৃত্রিম বুদ্ধিমত্তা
                              </span>
                              <h5 className="font-sans font-black text-base text-white mt-1 leading-none">
                                Futuristic Synth
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                              Sci-Fi
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mt-2 leading-normal">
                            High-tech cyber clicks, filter sweeps, modulated frequency waves, and futuristic radar beeps.
                          </p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("tap", "synth");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🔊 Tap
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("correct", "synth");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              🎉 Win
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound("incorrect", "synth");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-white/80 uppercase font-bold"
                            >
                              ❌ Lose
                            </button>
                          </div>
                        </button>
                      </div>
                    </motion.div>

                    {/* GENERAL PREFERENCES / SYSTEM OPTIONS */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl flex flex-col gap-5 text-left"
                    >
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 block leading-none">
                          System Parameters • সিস্টেম নিয়ন্ত্রণ
                        </span>
                        <h4 className="text-white font-sans font-black text-lg mt-1.5 block">
                          General Customizations
                        </h4>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Audio Toggle */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5">
                          <div>
                            <span className="text-white font-sans font-bold text-sm block">System Audio</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Toggle all synthesizer click & transition sounds.</span>
                          </div>
                          <button
                            onClick={toggleMute}
                            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                              !isMuted
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/10 border border-red-500/30 text-red-400"
                            }`}
                          >
                            {!isMuted ? "🔈 Active (On)" : "🔇 Muted (Off)"}
                          </button>
                        </div>

                        {/* TTS Narrator */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5">
                          <div>
                            <span className="text-white font-sans font-bold text-sm block">AI Voice Narration</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Automated reading of curiosity hooks & stories.</span>
                          </div>
                          <button
                            onClick={toggleVoice}
                            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                              isVoiceOn
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-white/5 border-white/5 text-white/40"
                            }`}
                          >
                            {isVoiceOn ? "🗣️ Enabled" : "🔇 Disabled"}
                          </button>
                        </div>

                        {/* Difficulty Selector */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5 gap-3">
                          <div>
                            <span className="text-white font-sans font-bold text-sm block">Quiz Difficulty</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Define target depth of generated general knowledge.</span>
                          </div>
                          <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/10 w-full sm:w-auto">
                            {(["beginner", "intermediate", "advanced"] as const).map((level) => {
                              const isActive = quizDifficulty === level;
                              const labelBn = level === "beginner" ? "সহজ" : level === "intermediate" ? "মধ্যম" : "কঠিন";
                              const activeColorClass = level === "beginner" ? "bg-emerald-500 text-black font-black" : level === "intermediate" ? "bg-orange-500 text-black font-black" : "bg-red-500 text-black font-black";
                              return (
                                <button
                                  key={level}
                                  onClick={() => {
                                    playSound("tap");
                                    setQuizDifficulty(level);
                                  }}
                                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all duration-200 ${
                                    isActive ? activeColorClass : "text-white/50 hover:text-white"
                                  }`}
                                >
                                  {labelBn}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </motion.div>

                    {/* STATISTICS SUMMARY CARDS */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl flex flex-col gap-4 text-left"
                    >
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 block leading-none">
                          Profile Stats • ব্যবহারকারীর তথ্য
                        </span>
                        <h4 className="text-white font-sans font-black text-base mt-1.5 block">
                          Current Accomplishments
                        </h4>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Points</span>
                          <span className="text-lg font-mono font-black text-purple-400 block mt-1">{userStats.points}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Streak</span>
                          <span className="text-lg font-mono font-black text-orange-400 block mt-1">{userStats.streak}🔥</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Badges</span>
                          <span className="text-lg font-mono font-black text-amber-400 block mt-1">{userStats.badgesUnlocked.length}🏆</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Reset Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          playSound("tap");
                          if (confirm("Are you sure you want to reset all stats and data? This cannot be undone.")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
                      >
                        Reset All Game Data • ডেটা রিসেট করুন
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB CONTENT: HOST & STAGE CONTROL BOARD */}
                {activeTab === "host" && (
                  <div className="flex flex-col gap-6 flex-1 text-left relative">
                    {/* Header */}
                    {!hostIsProjectorMode && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-1">
                            Live Stage & Projector System • সঞ্চালক ও প্রজেক্টর ভিউ
                          </span>
                          <h3 className="text-white font-display font-black text-3xl tracking-tighter leading-none uppercase text-left">
                            STAGE CONTROLLER
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-2 text-left font-sans font-medium leading-relaxed">
                            মঞ্চে কুইজ পরিচালনার জন্য বিশেষ প্যানেল। প্রজেক্টরে বড় পর্দায় দেখাতে নিচে <b>"বড় পর্দা মোড"</b> অন করুন।
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            playSound("tap");
                            setHostIsProjectorMode(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-600 hover:to-orange-600 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10 cursor-pointer self-start sm:self-center"
                        >
                          <Tv className="w-4 h-4" />
                          <span>বড় পর্দা মোড • PROJECTOR ONLY</span>
                        </button>
                      </div>
                    )}

                    {/* TWO VIEW MODES */}
                    {hostIsProjectorMode ? (
                      /* FULL SCREEN PROJECTOR ONLY VIEW (CINEMATIC DISPLAY FOR BIG SCREEN) */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 font-sans"
                        id="live-projector-fullscreen"
                      >
                        {/* Top floating control to exit */}
                        <div className="flex items-center justify-between opacity-30 hover:opacity-100 transition-all">
                          <div className="flex items-center gap-3">
                            <img
                              src={dLikonLogo}
                              alt="Logo"
                              className="w-12 h-12 rounded-xl border border-orange-500/30 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left">
                              <h4 className="text-white font-black text-lg tracking-tight font-display leading-none">ডি-লিকন মেধা মূল্যায়ন</h4>
                              <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest">Live Stage Event</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              playSound("tap");
                              setHostIsProjectorMode(false);
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Minimize2 className="w-4 h-4" />
                            <span>কন্ট্রোল প্যানেলে ফিরুন</span>
                          </button>
                        </div>

                        {/* Center Stage Display Card */}
                        <div className="flex flex-col items-center justify-center flex-1 max-w-4xl mx-auto w-full py-12">
                          <AnimatePresence mode="wait">
                            {hostStateStatus === "idle" && (
                              /* 1. Splash / Waiting Screen */
                              <motion.div
                                key="projector-idle"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center flex flex-col items-center gap-6"
                              >
                                <motion.img
                                  src={dLikonLogo}
                                  alt="D-Likon Logo"
                                  className="w-48 h-48 rounded-full border-4 border-amber-400 shadow-2xl shadow-amber-500/20 object-cover"
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="space-y-3">
                                  <h2 className="text-5xl font-display font-black text-amber-400 tracking-tight leading-none bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 bg-clip-text text-transparent uppercase">
                                    ডি-লিকন মেধা মূল্যায়ন উৎসব
                                  </h2>
                                  <p className="text-2xl text-slate-300 font-sans tracking-wide max-w-xl mx-auto leading-relaxed">
                                    লাইভ স্টেজে মেধার লড়াই! মঞ্চের মাইক্রোফোনে কথা বলুন এবং আপনার বুদ্ধিমত্তার স্বাক্ষর রাখুন।
                                  </p>
                                </div>
                                <div className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 animate-pulse">
                                  <Mic className="w-6 h-6 text-amber-400" />
                                  <span className="text-lg text-slate-400 font-bold font-sans">সঞ্চালক প্রশ্ন বরাদ্দের জন্য অপেক্ষা করছেন...</span>
                                </div>
                              </motion.div>
                            )}

                            {hostStateStatus === "assigned" && hostSelectedQuestion && (
                              /* 2. Active Question Screen */
                              <motion.div
                                key="projector-assigned"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full bg-white/5 border-2 border-white/10 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/5 relative overflow-hidden backdrop-blur-xl flex flex-col gap-8 text-left"
                              >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                                
                                {/* Presenting Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-2xl shadow-lg">
                                      🎤
                                    </div>
                                    <div>
                                      <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">CONTESTANT ON STAGE • মঞ্চে আছেন</span>
                                      <h3 className="text-white font-sans font-black text-3xl tracking-tight mt-1">
                                        {hostSelectedParticipant}
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl self-start sm:self-center">
                                    <span className="text-indigo-300 font-sans font-black text-sm uppercase tracking-wider block">
                                      {hostSelectedQuestion.category.toUpperCase()} • {hostSelectedQuestion.difficulty.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {/* Question Area */}
                                <div className="space-y-6">
                                  <span className="text-sm font-mono text-slate-400 uppercase tracking-widest font-bold">QUESTION • প্রশ্ন</span>
                                  <h1 className="text-white font-sans font-black text-4xl sm:text-5xl leading-tight tracking-tight">
                                    {hostSelectedQuestion.question}
                                  </h1>
                                </div>

                                {/* Live Options Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                  {hostSelectedQuestion.options.map((opt, idx) => {
                                    const labels = ["ক", "খ", "গ", "ঘ"];
                                    return (
                                      <div
                                        key={idx}
                                        className="bg-black/40 border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-lg">
                                          {labels[idx]}
                                        </div>
                                        <span className="text-white font-sans font-bold text-xl">{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Status Bar footer */}
                                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-4 animate-pulse">
                                  <div className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                  </div>
                                  <span className="text-amber-400 font-sans font-bold text-base">মঞ্চের মাইকে উত্তর বলুন... সঞ্চালক আপনার উত্তরটি শুনছেন।</span>
                                </div>
                              </motion.div>
                            )}

                            {hostStateStatus === "correct" && hostSelectedQuestion && (
                              /* 3. Success / Correct Answer Screen */
                              <motion.div
                                key="projector-correct"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full bg-slate-950 border-4 border-emerald-500 p-12 rounded-[3.5rem] shadow-2xl shadow-emerald-500/20 text-center relative overflow-hidden flex flex-col items-center gap-8"
                              >
                                {/* Radial Glow effect */}
                                <div className="absolute inset-0 bg-radial-gradient from-emerald-500/20 to-transparent pointer-events-none"></div>
                                
                                {/* Animated Banner Icon */}
                                <motion.div
                                  initial={{ scale: 0, rotate: -30 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                                  className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 text-black text-6xl"
                                >
                                  🎉
                                </motion.div>

                                <div className="space-y-4 relative z-10">
                                  <span className="text-xs font-mono font-black text-emerald-400 tracking-[0.4em] uppercase block">EXCELLENT ANSWER • চমৎকার উত্তর!</span>
                                  <h1 className="text-white font-display font-black text-6xl tracking-tight leading-none">
                                    অভিনন্দন, {hostSelectedParticipant}!
                                  </h1>
                                  <h2 className="text-emerald-400 font-sans font-black text-3xl tracking-tight mt-2">
                                    আপনার উত্তরটি একেবারে সঠিক হয়েছে!
                                  </h2>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl max-w-2xl w-full text-left relative z-10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-yellow-400 text-lg">💡</span>
                                    <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs font-mono">EUREKA EXPLANATION • সঠিক ব্যাখ্যা</span>
                                  </div>
                                  <p className="text-slate-300 font-sans text-lg leading-relaxed">
                                    {hostSelectedQuestion.eurekaExplanation}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 text-emerald-300 font-mono text-xl font-bold bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-2xl relative z-10">
                                  <span>SCORE: +১০০ Points</span>
                                  <span>•</span>
                                  <span>STREAK ACTIVE 🔥</span>
                                </div>
                              </motion.div>
                            )}

                            {hostStateStatus === "incorrect" && hostSelectedQuestion && (
                              /* 4. Incorrect Answer Screen */
                              <motion.div
                                key="projector-incorrect"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full bg-slate-950 border-4 border-red-500 p-12 rounded-[3.5rem] shadow-2xl shadow-red-500/10 text-center relative overflow-hidden flex flex-col items-center gap-8"
                              >
                                <div className="absolute inset-0 bg-radial-gradient from-red-500/10 to-transparent pointer-events-none"></div>

                                <motion.div
                                  initial={{ scale: 0, rotate: 30 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                                  className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 text-white text-5xl"
                                >
                                  💡
                                </motion.div>

                                <div className="space-y-4 relative z-10">
                                  <span className="text-xs font-mono font-black text-red-400 tracking-[0.4em] uppercase block">NICE TRY • চমৎকার চেষ্টা!</span>
                                  <h1 className="text-white font-display font-black text-5xl tracking-tight leading-none">
                                    ধন্যবাদ, {hostSelectedParticipant}!
                                  </h1>
                                  <h2 className="text-red-400 font-sans font-black text-2xl tracking-tight mt-2">
                                    উত্তরটি সঠিক হয়নি, তবে আপনার প্রচেষ্টা প্রশংসনীয়!
                                  </h2>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl max-w-2xl w-full text-left relative z-10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-red-400 text-lg">🎯</span>
                                    <span className="text-red-400 font-bold uppercase tracking-wider text-xs font-mono">CORRECT TRIVIA • সঠিক তথ্য</span>
                                  </div>
                                  <p className="text-slate-300 font-sans text-lg leading-relaxed">
                                    সঠিক উত্তরটি ছিল: <span className="text-emerald-400 font-black">{hostSelectedQuestion.options[hostSelectedQuestion.answerIndex]}</span>।
                                    <br />
                                    <span className="text-slate-400 text-sm mt-2 block">{hostSelectedQuestion.eurekaExplanation}</span>
                                  </p>
                                </div>

                                <div className="text-slate-400 font-mono text-base bg-white/5 border border-white/5 px-6 py-2 rounded-xl relative z-10">
                                  পরবর্তী প্রশ্নের জন্য প্রস্তুত হোন!
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Footer Info bar */}
                        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-white/40">
                          <span>ডি-লিকন মেধা মূল্যায়ন উৎসব • D-Likon Model Academy</span>
                          <span>Live Broadcast Frame ID: {Math.floor(Math.random() * 100000)}</span>
                        </div>
                      </motion.div>
                    ) : (
                      /* SPLIT SCREEN / INTERACTIVE DASHBOARD */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* LEFT COLUMN: HOST STAGE CONTROLLER (lg:col-span-5) */}
                        <div className="lg:col-span-5 flex flex-col gap-5">
                          
                          {/* STEP 1: SELECT CONTESTANT */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex flex-col gap-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-xs">১</span>
                              <h4 className="text-white font-sans font-black text-sm uppercase">শিক্ষার্থী নির্বাচন করুন (Contestant)</h4>
                            </div>

                            <div className="space-y-3 mt-1">
                              {/* Dropdown list of participants */}
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-bold">মঞ্চে থাকা প্রতিযোগী নির্ধারণ করুন:</label>
                                <select
                                  value={hostSelectedParticipant}
                                  onChange={(e) => {
                                    playSound("tap");
                                    setHostSelectedParticipant(e.target.value);
                                  }}
                                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-sans font-bold focus:outline-none focus:border-amber-500 transition-all"
                                >
                                  {hostParticipants.map((p, idx) => (
                                    <option key={idx} value={p} className="bg-slate-950 text-white">
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Form to add a new student dynamically */}
                              <div className="pt-1">
                                <label className="text-[10px] text-slate-400 block mb-1 font-bold">নতুন শিক্ষার্থীর নাম যুক্ত করুন:</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="উদা: তাসনিম জাহান (Tasnim)"
                                    value={hostNewParticipantName}
                                    onChange={(e) => setHostNewParticipantName(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && hostNewParticipantName.trim()) {
                                        const name = hostNewParticipantName.trim();
                                        if (!hostParticipants.includes(name)) {
                                          setHostParticipants([...hostParticipants, name]);
                                          // Sync with active event if any
                                          if (activeEventId) {
                                            const activeEvt = events.find(e => e.id === activeEventId);
                                            const newParticipant: EventParticipant = {
                                              id: `p-${Date.now()}`,
                                              name: name,
                                              className: "৩য় (Class 3)",
                                              roll: String((activeEvt?.participants.length || 0) + 1).padStart(2, '0'),
                                              photoUrl: "avatar1",
                                              score: 0,
                                              solvedCount: 0,
                                              totalAttempted: 0,
                                              joinedAt: new Date().toISOString()
                                            };
                                            setEvents(prev => prev.map(evt => {
                                              if (evt.id === activeEventId) {
                                                return {
                                                  ...evt,
                                                  participants: [...evt.participants, newParticipant]
                                                };
                                              }
                                              return evt;
                                            }));
                                          }
                                        }
                                        setHostSelectedParticipant(name);
                                        setHostNewParticipantName("");
                                        playSound("tap");
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      if (hostNewParticipantName.trim()) {
                                        const name = hostNewParticipantName.trim();
                                        if (!hostParticipants.includes(name)) {
                                          setHostParticipants([...hostParticipants, name]);
                                          // Sync with active event if any
                                          if (activeEventId) {
                                            const activeEvt = events.find(e => e.id === activeEventId);
                                            const newParticipant: EventParticipant = {
                                              id: `p-${Date.now()}`,
                                              name: name,
                                              className: "৩য় (Class 3)",
                                              roll: String((activeEvt?.participants.length || 0) + 1).padStart(2, '0'),
                                              photoUrl: "avatar1",
                                              score: 0,
                                              solvedCount: 0,
                                              totalAttempted: 0,
                                              joinedAt: new Date().toISOString()
                                            };
                                            setEvents(prev => prev.map(evt => {
                                              if (evt.id === activeEventId) {
                                                return {
                                                  ...evt,
                                                  participants: [...evt.participants, newParticipant]
                                                };
                                              }
                                              return evt;
                                            }));
                                          }
                                        }
                                        setHostSelectedParticipant(name);
                                        setHostNewParticipantName("");
                                        playSound("tap");
                                      }
                                    }}
                                    className="px-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold text-xs transition-all cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Random pick utility */}
                              <button
                                onClick={() => {
                                  playSound("tap");
                                  const idx = Math.floor(Math.random() * hostParticipants.length);
                                  setHostSelectedParticipant(hostParticipants[idx]);
                                }}
                                className="w-full py-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold text-slate-300 transition-all cursor-pointer block text-center"
                              >
                                🎲 এলোমেলো শিক্ষার্থী নির্বাচন করুন
                              </button>
                            </div>
                          </motion.div>

                          {/* STEP 2: SELECT QUESTION */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex flex-col gap-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-indigo-500 text-black flex items-center justify-center font-bold text-xs">২</span>
                              <h4 className="text-white font-sans font-black text-sm uppercase">প্রশ্ন বরাদ্দ করুন (Quiz Question)</h4>
                            </div>

                            <div className="space-y-3 mt-1">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-bold">কুইজ প্রশ্নটি নির্ধারণ করুন:</label>
                                <select
                                  value={hostSelectedQuestion ? DEFAULT_QUESTIONS.findIndex(q => q.question === hostSelectedQuestion.question) : ""}
                                  onChange={(e) => {
                                    playSound("tap");
                                    const index = parseInt(e.target.value);
                                    if (!isNaN(index) && DEFAULT_QUESTIONS[index]) {
                                      setHostSelectedQuestion(DEFAULT_QUESTIONS[index]);
                                      setHostStateStatus("assigned");
                                    }
                                  }}
                                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-sans font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                >
                                  <option value="" className="bg-slate-950 text-slate-400">--- একটি প্রশ্ন বেছে নিন ({activityPerspective === "gk" ? "সাধারণ জ্ঞান" : "বিশেষ জ্ঞান"}) ---</option>
                                  {DEFAULT_QUESTIONS.map((q, idx) => {
                                    const isGk = q.category === "class3_gk";
                                    if (activityPerspective === "gk" && !isGk) return null;
                                    if (activityPerspective === "sk" && isGk) return null;
                                    return (
                                      <option key={idx} value={idx} className="bg-slate-950 text-white">
                                        {q.factTitle} ({q.category === "class3_gk" ? "GK" : "SK"})
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              {/* Pick random question helper */}
                              <button
                                onClick={() => {
                                  playSound("tap");
                                  const pool = DEFAULT_QUESTIONS.filter(q => {
                                    const isGk = q.category === "class3_gk";
                                    return activityPerspective === "gk" ? isGk : !isGk;
                                  });
                                  if (pool.length > 0) {
                                    const randomQ = pool[Math.floor(Math.random() * pool.length)];
                                    setHostSelectedQuestion(randomQ);
                                    setHostStateStatus("assigned");
                                  }
                                }}
                                className="w-full py-1.5 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer block text-center"
                              >
                                🎲 এলোমেলো কুইজ প্রশ্ন বরাদ্দ করুন ({activityPerspective === "gk" ? "GK" : "SK"})
                              </button>

                              {hostSelectedQuestion && (
                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                                    <span>সদস্য সঠিক উত্তর সূচক: {hostSelectedQuestion.answerIndex + 1}</span>
                                    <span className="text-emerald-400 font-sans">ANSWER: {hostSelectedQuestion.options[hostSelectedQuestion.answerIndex]}</span>
                                  </div>
                                  <p className="text-slate-300 font-sans font-bold leading-tight mt-1">
                                    {hostSelectedQuestion.question}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>

                          {/* STEP 3: EVALUATE & TRIGGER CELEBRATION */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex flex-col gap-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">৩</span>
                              <h4 className="text-white font-sans font-black text-sm uppercase">উত্তর মূল্যায়ন ও প্রজেক্টর এন্ট্রি</h4>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-1 font-sans">
                              প্রতিযোগী মঞ্চের মাইকে উত্তর দেওয়ার পর সঞ্চালক শুনে নিচে ক্লিক করলেই প্রজেক্টরে অভিনন্দন ও ব্যাখ্যা ভেসে উঠবে।
                            </p>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {/* Correct Answer button */}
                              <button
                                disabled={!hostSelectedQuestion || hostStateStatus !== "assigned"}
                                onClick={() => {
                                  playSound("correct");
                                  setHostStateStatus("correct");
                                  speakText(`অসাধারণ অভিনন্দন ${hostSelectedParticipant}! আপনার উত্তরটি একদম সঠিক হয়েছে। আসুন আমরা সবাই মিলে তার জন্য একটা জোরে করতালি দেই।`, "bn");
                                  
                                  // Update student score in active Event Zone if matched
                                  if (activeEventId) {
                                    setEvents(prev => prev.map(evt => {
                                      if (evt.id === activeEventId) {
                                        return {
                                          ...evt,
                                          participants: evt.participants.map(p => {
                                            if (
                                              p.name.toLowerCase().includes(hostSelectedParticipant.toLowerCase()) ||
                                              hostSelectedParticipant.toLowerCase().includes(p.name.toLowerCase())
                                            ) {
                                              return {
                                                ...p,
                                                score: p.score + 100,
                                                solvedCount: p.solvedCount + 1,
                                                totalAttempted: p.totalAttempted + 1
                                              };
                                            }
                                            return p;
                                          })
                                        };
                                      }
                                      return evt;
                                    }));
                                  }
                                }}
                                className={`py-3 px-4 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-lg ${
                                  !hostSelectedQuestion || hostStateStatus !== "assigned"
                                    ? "bg-slate-800/50 text-slate-500 opacity-40 cursor-not-allowed border border-white/5"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/10 hover:shadow-emerald-500/20"
                                }`}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>সদর্থক উত্তর (CORRECT)</span>
                              </button>

                              {/* Incorrect Answer button */}
                              <button
                                disabled={!hostSelectedQuestion || hostStateStatus !== "assigned"}
                                onClick={() => {
                                  playSound("incorrect");
                                  setHostStateStatus("incorrect");
                                  speakText(`দুঃখিত ${hostSelectedParticipant}! আপনার উত্তরটি সঠিক হয়নি। তবে চমৎকার চেষ্টা করার জন্য আপনাকে অনেক ধন্যবাদ।`, "bn");
                                  
                                  // Update student score in active Event Zone if matched
                                  if (activeEventId) {
                                    setEvents(prev => prev.map(evt => {
                                      if (evt.id === activeEventId) {
                                        return {
                                          ...evt,
                                          participants: evt.participants.map(p => {
                                            if (
                                              p.name.toLowerCase().includes(hostSelectedParticipant.toLowerCase()) ||
                                              hostSelectedParticipant.toLowerCase().includes(p.name.toLowerCase())
                                            ) {
                                              return {
                                                ...p,
                                                totalAttempted: p.totalAttempted + 1
                                              };
                                            }
                                            return p;
                                          })
                                        };
                                      }
                                      return evt;
                                    }));
                                  }
                                }}
                                className={`py-3 px-4 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-lg ${
                                  !hostSelectedQuestion || hostStateStatus !== "assigned"
                                    ? "bg-slate-800/50 text-slate-500 opacity-40 cursor-not-allowed border border-white/5"
                                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/10 hover:shadow-red-500/20"
                                }`}
                              >
                                <XCircle className="w-5 h-5" />
                                <span>ভুল উত্তর (INCORRECT)</span>
                              </button>
                            </div>

                            {/* Reset Round / Next Student button */}
                            <button
                              onClick={() => {
                                playSound("tap");
                                setHostStateStatus("idle");
                                setHostSelectedQuestion(null);
                              }}
                              className="w-full mt-2 py-2 border border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60 rounded-xl text-xs font-sans font-bold text-slate-300 transition-all cursor-pointer block text-center"
                            >
                              🔄 পরবর্তী রাউন্ড শুরু করুন (Next Participant / Reset)
                            </button>
                          </motion.div>

                        </div>

                        {/* RIGHT COLUMN: PROJECTOR PREVIEW (lg:col-span-7) */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white/60 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-amber-400" />
                              <span>Projector Live Preview • প্রজেক্টর লাইভ প্রিভিউ</span>
                            </h4>
                            <button
                              onClick={() => {
                                playSound("tap");
                                setHostIsProjectorMode(true);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 uppercase transition-all cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>বড় পর্দা মোড (Fullscreen)</span>
                            </button>
                          </div>

                          {/* Beautiful Projector Screen frame emulator */}
                          <div className="aspect-[16/10] bg-slate-950 rounded-3xl border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6">
                            
                            {/* Small Emulator badge overlay */}
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-500 text-black font-mono text-[7px] font-bold uppercase tracking-wider z-10 animate-pulse">
                              LIVE CASTING
                            </div>

                            {/* Scale emulator container to fit aspect ratio cleanly */}
                            <div className="flex-1 flex flex-col justify-center items-center w-full">
                              <AnimatePresence mode="wait">
                                {hostStateStatus === "idle" && (
                                  <motion.div
                                    key="preview-idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center flex flex-col items-center gap-3"
                                  >
                                    <img
                                      src={dLikonLogo}
                                      alt="Logo"
                                      className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <h3 className="text-white font-sans font-black text-lg text-amber-400">
                                        ডি-লিকন মেধা মূল্যায়ন উৎসব
                                      </h3>
                                      <p className="text-[10px] text-slate-400 font-sans max-w-sm mt-1">
                                        মঞ্চের মাইক্রোফোনে কথা বলুন এবং আপনার মেধার উজ্জ্বল স্বাক্ষর রাখুন।
                                      </p>
                                    </div>
                                    <span className="text-[9px] px-3 py-1 bg-white/5 border border-white/5 text-slate-500 rounded-lg animate-pulse font-mono font-bold uppercase tracking-wider">
                                      Waiting for host to assign...
                                    </span>
                                  </motion.div>
                                )}

                                {hostStateStatus === "assigned" && hostSelectedQuestion && (
                                  <motion.div
                                    key="preview-assigned"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full text-left bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-4"
                                  >
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                      <span className="text-[11px] text-amber-400 font-sans font-black flex items-center gap-1">
                                        🎤 প্রতিযোগী: <span className="text-white">{hostSelectedParticipant}</span>
                                      </span>
                                      <span className="text-[9px] font-mono bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded uppercase">
                                        {hostSelectedQuestion.category}
                                      </span>
                                    </div>
                                    <h4 className="text-white font-sans font-bold text-base leading-snug">
                                      {hostSelectedQuestion.question}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {hostSelectedQuestion.options.map((opt, i) => (
                                        <div key={i} className="bg-black/30 border border-white/5 p-2 rounded-xl text-left flex items-center gap-2">
                                          <span className="text-[9px] w-5 h-5 rounded bg-white/5 text-slate-400 flex items-center justify-center font-bold">
                                            {["क", "ख", "ग", "घ"][i] || i + 1}
                                          </span>
                                          <span className="text-xs text-white/90 font-sans font-bold truncate">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-[9px] text-amber-500/80 font-sans flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 animate-pulse mt-1">
                                      <Mic className="w-3 h-3" />
                                      <span>উত্তর দিন... সঞ্চালক শুনছেন</span>
                                    </div>
                                  </motion.div>
                                )}

                                {hostStateStatus === "correct" && hostSelectedQuestion && (
                                  <motion.div
                                    key="preview-correct"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full text-center flex flex-col items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-500 rounded-2xl"
                                  >
                                    <span className="text-3xl">🎉</span>
                                    <div>
                                      <h3 className="text-white font-sans font-black text-lg">
                                        অভিনন্দন, {hostSelectedParticipant}!
                                      </h3>
                                      <p className="text-emerald-400 font-sans font-bold text-xs mt-1">
                                        আপনার উত্তরটি সঠিক হয়েছে! (+১০০ পয়েন্ট)
                                      </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left w-full mt-1">
                                      <span className="text-[8px] text-yellow-400 font-bold block uppercase tracking-wider font-mono">EUREKA EXPLANATION</span>
                                      <p className="text-slate-300 font-sans text-[10px] leading-relaxed mt-0.5">
                                        {hostSelectedQuestion.eurekaExplanation}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}

                                {hostStateStatus === "incorrect" && hostSelectedQuestion && (
                                  <motion.div
                                    key="preview-incorrect"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full text-center flex flex-col items-center gap-3 p-4 bg-red-950/20 border border-red-500 rounded-2xl"
                                  >
                                    <span className="text-2xl">💡</span>
                                    <div>
                                      <h3 className="text-white font-sans font-black text-sm">
                                        চমৎকার চেষ্টা, {hostSelectedParticipant}!
                                      </h3>
                                      <p className="text-red-400 font-sans font-bold text-xs mt-1">
                                        উত্তরটি সঠিক হয়নি, তবে আপনার প্রচেষ্টা প্রশংসনীয়।
                                      </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left w-full mt-1">
                                      <span className="text-[8px] text-emerald-400 font-bold block uppercase tracking-wider font-mono">CORRECT TRIVIA</span>
                                      <p className="text-slate-300 font-sans text-[10px] leading-relaxed mt-0.5">
                                        সঠিক উত্তরটি ছিল: <span className="text-emerald-400 font-black">{hostSelectedQuestion.options[hostSelectedQuestion.answerIndex]}</span>
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Bottom emulator bar */}
                            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                              <span>D-Likon Model Academy Event screen</span>
                              <span>Ratio: 16:10</span>
                            </div>

                          </div>

                          {/* Quick tips card */}
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-400 space-y-1 text-left">
                            <span className="text-amber-400 font-bold font-sans">💡 কুইজ মাস্টার টিপস:</span>
                            <p className="font-sans leading-relaxed text-slate-300 text-[11px]">
                              ১. এই কুইজ স্ক্রিনটি প্রোজেক্টরের মাধ্যমে বড় পর্দায় তুলে ধরার জন্য ডানদিকের <b>"বড় পর্দা মোড (Fullscreen)"</b> বোতামটি ব্যবহার করুন।
                              <br />
                              ২. সঠিক বা ভুল বোতামে চাপ দিলে ব্রাউজারে বাংলা ভাষায় ফলাফল স্বয়ংক্রিয়ভাবে পাঠ করে শোনানো হবে, তাই আপনার সাউন্ড সিস্টেম অন রাখুন!
                            </p>
                          </div>

                        </div>

                      </div>
                    )}

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

            {/* Event Zone Screen */}
            <button
              id="tab-event-btn"
              onClick={() => {
                playSound("tap");
                setActiveTab("event");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "event" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Event Zone</span>
            </button>

            {/* Leaderboard Screen */}
            <button
              id="tab-leaderboard-btn"
              onClick={() => {
                playSound("tap");
                setActiveTab("leaderboard");
                setActiveQuestion(null);
                setQuizState("idle");
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "leaderboard" ? "text-purple-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Crown className="w-5 h-5" />
              <span className="text-[9px] font-sans font-bold">Leaderboard</span>
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

      {/* PRINTABLE CERTIFICATE OF EXCELLENCE MODAL OVERLAY */}
      <AnimatePresence>
        {selectedCertificateParticipant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 overflow-y-auto font-sans print:p-0 print:bg-white print:absolute print:inset-0">
            
            {/* Overlay controls (Hidden on Print) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-20">
              <button
                onClick={() => {
                  playSound("tap");
                  window.print();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                <Award className="w-4 h-4 fill-current" />
                <span>প্রিন্ট / সেভ • Print / Save PDF</span>
              </button>
              <button
                onClick={() => {
                  playSound("tap");
                  setSelectedCertificateParticipant(null);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white hover:text-red-400 rounded-xl transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Inner Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-amber-50/5 text-[#2c1d0c] border-8 border-double border-amber-500/40 p-8 md:p-14 rounded-3xl w-full max-w-3xl aspect-[1.414/1] shadow-2xl flex flex-col justify-between items-center overflow-hidden print:shadow-none print:border-amber-500 print:rounded-none print:bg-white print:m-0 print:w-full print:h-full print:max-w-none print:aspect-none text-center select-text"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                borderColor: "#d97706",
                color: "#1e1b4b",
                backgroundColor: "#fffdf9"
              }}
            >
              {/* Vintage Watermark Logo behind content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Trophy className="w-[300px] h-[300px] text-[#b45309]" />
              </div>

              {/* Elegant border filigree pattern */}
              <div className="absolute top-3 left-3 right-3 bottom-3 border border-amber-600/30 rounded-2xl pointer-events-none" />
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-600/10 rounded-xl pointer-events-none" />

              {/* Filigree Corner Decorations */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

              {/* 1. Header Badges & Institution */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 mb-2 print:border-amber-500 shadow-md">
                  <Trophy className="w-6 h-6 fill-current" />
                </div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-amber-700/80 uppercase font-black">
                  {certificateEventName || "কুইজ উৎসব ২০২৬"}
                </span>
                <h4 className="text-xl font-display font-black tracking-tight text-indigo-950 uppercase leading-none mt-1">
                  ডি-লিকন মেধা মূল্যায়ন উৎসব
                </h4>
                <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-1.5" />
              </div>

              {/* 2. Main Title */}
              <div className="flex flex-col items-center my-2">
                <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                  • মেধা প্রশংসাপত্র • Certificate of Excellence •
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-black text-amber-700 mt-1 uppercase tracking-tight">
                  মেধা প্রশংসাপত্র
                </h2>
              </div>

              {/* 3. Certificate Statement Content */}
              <div className="max-w-xl text-center flex flex-col gap-3">
                <p className="text-xs text-slate-500/90 font-sans leading-relaxed">
                  অত্যಂತ আনন্দের সাথে প্রত্যয়ন করা যাচ্ছে যে,
                </p>
                
                {/* Participant Name Badge */}
                <div className="py-1 px-4 border-b-2 border-indigo-950/20 max-w-xs mx-auto mb-1">
                  <h3 className="text-xl md:text-2xl font-bold text-indigo-950 tracking-tight font-sans">
                    {selectedCertificateParticipant.name}
                  </h3>
                </div>

                {/* Student Roll and Class details */}
                <p className="text-xs text-indigo-950/80 font-sans leading-relaxed font-semibold">
                  শ্রেণি: <span className="text-amber-700 font-bold">{selectedCertificateParticipant.className}</span> • রোল: <span className="text-amber-700 font-bold">{selectedCertificateParticipant.roll}</span>
                </p>

                <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
                  ডি-লিকন (D-Likon) কুইজ উৎসবে সক্রিয়ভাবে অংশগ্রহণ করে এবং ৫টি প্রশ্নের মধ্যে <span className="text-indigo-950 font-black">{selectedCertificateParticipant.solvedCount}টি প্রশ্নের সঠিক উত্তর</span> দিয়ে কৃতিত্বের সাথে <span className="text-emerald-600 font-black">{selectedCertificateParticipant.score} পয়েন্ট</span> অর্জন করেছে।
                </p>

                <p className="text-xs text-slate-500/90 font-sans leading-relaxed">
                  তার এই অনন্য মেধা ও উজ্জ্বল সাফল্য কামনায় আমরা গর্বিত ও আনন্দিত।
                </p>
              </div>

              {/* 4. Footer signatures and seals */}
              <div className="w-full flex items-end justify-between px-6 mt-6 pt-4 border-t border-slate-200">
                {/* Left Signature */}
                <div className="flex flex-col items-center">
                  <div className="h-6 w-24 flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-serif italic text-slate-400 font-bold leading-none select-none">D-Likon Admin</span>
                  </div>
                  <div className="w-28 h-[1px] bg-slate-300 mt-1" />
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase mt-1">Conductor / পরিচালক</span>
                </div>

                {/* Center Official Gold Seal */}
                <div className="relative flex items-center justify-center w-14 h-14 bg-amber-500 text-amber-50 border-4 border-amber-600 rounded-full shadow-lg shadow-amber-500/10">
                  <div className="absolute inset-1 border border-dashed border-amber-100 rounded-full" />
                  <Award className="w-6 h-6 fill-current animate-pulse" />
                  {/* Ribbon tails */}
                  <div className="absolute -bottom-3 left-1 w-3 h-5 bg-amber-600 -rotate-12 rounded-b z-[-1]" />
                  <div className="absolute -bottom-3 right-1 w-3 h-5 bg-amber-600 rotate-12 rounded-b z-[-1]" />
                </div>

                {/* Right Signature */}
                <div className="flex flex-col items-center">
                  <div className="h-6 w-24 flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-serif italic text-slate-400 font-bold leading-none select-none">Headmaster</span>
                  </div>
                  <div className="w-28 h-[1px] bg-slate-300 mt-1" />
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase mt-1">Principal / প্রধান শিক্ষক</span>
                </div>
              </div>

              {/* Print bottom-center metadata info */}
              <div className="text-[7px] text-slate-400 font-mono tracking-wider uppercase mt-4 block">
                ভেরিফিকেশন কোড: DL-{selectedCertificateParticipant.id.toUpperCase()} • তারিখ: {new Date(selectedCertificateParticipant.joinedAt || Date.now()).toLocaleDateString("bn-BD")}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
