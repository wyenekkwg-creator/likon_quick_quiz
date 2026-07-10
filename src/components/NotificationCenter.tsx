import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Sparkles, X, ChevronRight } from "lucide-react";
import { TRIVIA_NOTIFICATIONS } from "../data";
import { playSynthSound } from "../utils/audio";

interface NotificationCenterProps {
  onSelectChallenge: (category: string) => void;
}

export default function NotificationCenter({ onSelectChallenge }: NotificationCenterProps) {
  const [activeNotif, setActiveNotif] = useState<any>(null);

  useEffect(() => {
    // Schedule a trigger-based notification to slide in 15 seconds after app starts
    const timer = setTimeout(() => {
      triggerNotification();
    }, 15000);

    // Also schedule recurring notification suggestions every 45 seconds to maintain interest
    const interval = setInterval(() => {
      triggerNotification();
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const triggerNotification = () => {
    // Select a random curiosity notification
    const randomIndex = Math.floor(Math.random() * TRIVIA_NOTIFICATIONS.length);
    const notif = TRIVIA_NOTIFICATIONS[randomIndex];
    
    // Play bell chime procedurally
    playSynthSound("notif");
    
    setActiveNotif(notif);

    // Auto-dim notification after 8 seconds if not clicked
    setTimeout(() => {
      setActiveNotif((curr: any) => (curr?.id === notif.id ? null : curr));
    }, 8500);
  };

  const handleNotificationClick = () => {
    if (activeNotif) {
      playSynthSound("tap");
      onSelectChallenge(activeNotif.category);
      setActiveNotif(null);
    }
  };

  return (
    <AnimatePresence>
      {activeNotif && (
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute top-4 left-4 right-4 z-50 bg-[#161224]/95 border border-purple-500/30 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col cursor-pointer hover:border-purple-500/50 group"
          onClick={handleNotificationClick}
        >
          {/* Notification Header */}
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-purple-300">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span className="font-bold tracking-wider uppercase">D-Likon Curiosity Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">now • এখনই</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNotif(null);
                }}
                className="p-0.5 hover:bg-white/10 rounded-full text-white/50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Notification Content */}
          <div className="p-4 flex items-start gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 mt-0.5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm leading-snug group-hover:text-purple-300 transition-colors">
                {activeNotif.question}
              </h4>
              <p className="text-white/60 text-xs mt-1 font-sans italic line-clamp-1 font-medium">
                "{activeNotif.curiosity}"
              </p>
              
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-mono mt-2 uppercase">
                <span>Unlock Mystery Box</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Micro indicator animation border */}
          <div className="h-1 bg-purple-500/30 w-full relative">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8.5, ease: "linear" }}
              className="h-full bg-purple-500"
            ></motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
