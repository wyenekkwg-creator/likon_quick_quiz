import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HelpCircle, Gift, AlertCircle, Play } from "lucide-react";
import { playSynthSound } from "../utils/audio";

interface MysteryBoxProps {
  categoryColor: string; // 'indigo' | 'emerald' | 'rose' | 'cyan' | 'amber'
  onClick: () => void;
  isOpen: boolean;
  hookText: string;
  factTitle: string;
}

export default function MysteryBox({ categoryColor, onClick, isOpen, hookText, factTitle }: MysteryBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Theme configuration based on category colors
  const colorMap: Record<string, { bg: string; border: string; glow: string; boxColor: string; accent: string }> = {
    indigo: {
      bg: "from-indigo-950/40 to-slate-900/40",
      border: "border-indigo-500/30",
      glow: "shadow-indigo-500/20",
      boxColor: "text-indigo-400",
      accent: "bg-indigo-500"
    },
    emerald: {
      bg: "from-emerald-950/40 to-slate-900/40",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      boxColor: "text-emerald-400",
      accent: "bg-emerald-500"
    },
    rose: {
      bg: "from-rose-950/40 to-slate-900/40",
      border: "border-rose-500/30",
      glow: "shadow-rose-500/20",
      boxColor: "text-rose-400",
      accent: "bg-rose-500"
    },
    cyan: {
      bg: "from-cyan-950/40 to-slate-900/40",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
      boxColor: "text-cyan-400",
      accent: "bg-cyan-500"
    },
    amber: {
      bg: "from-amber-950/40 to-slate-900/40",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      boxColor: "text-amber-400",
      accent: "bg-amber-500"
    }
  };

  const theme = colorMap[categoryColor] || colorMap.indigo;

  const handleBoxTap = () => {
    if (!isOpen) {
      playSynthSound("tap");
      onClick();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 min-h-[300px]">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed_box"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, filter: "blur(8px)" }}
            whileHover={{ scale: 1.02 }}
            className={`w-full max-w-[280px] p-6 rounded-3xl bg-${categoryColor}-500/5 border-2 border-${categoryColor}-500/20 hover:border-${categoryColor}-500 ${theme.glow} shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer`}
            onClick={handleBoxTap}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            id="mystery_box_trigger"
          >
            {/* Ambient Backlight Glow */}
            <div className={`absolute -inset-10 ${theme.accent}/10 rounded-full blur-2xl transition-all duration-300 ${isHovered ? "scale-125 opacity-100" : "opacity-50"}`}></div>

            {/* Glowing sparkle trails */}
            <div className="absolute top-4 right-4 flex gap-1">
              <Sparkles className={`w-4 h-4 ${theme.boxColor} animate-pulse`} />
            </div>

            {/* Mystery Box Visual */}
            <motion.div
              animate={isHovered ? {
                y: [0, -10, 0],
                rotate: [0, -3, 3, -3, 0],
                transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              } : {
                y: [0, -4, 0],
                transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="mb-6 relative z-10 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner"
            >
              <Gift className={`w-20 h-20 ${theme.boxColor}`} />
              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-white/25">
                <HelpCircle className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </motion.div>

            {/* Hook text CTA */}
            <div className="relative z-10">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${theme.boxColor} bg-white/5 px-2.5 py-1 rounded-full border border-white/5`}>
                Mystery Box • রহস্য বাক্স
              </span>
              <h3 className="text-white font-display font-black text-2xl mt-4 uppercase tracking-tighter">
                ট্যাপ করে তথ্য উন্মোচন করুন
              </h3>
              <p className="text-white/60 text-xs mt-1.5 font-sans leading-relaxed">
                Tap to unwrap and trigger the curiosity momentum.
              </p>
            </div>

            {/* Bottom Glow Bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${categoryColor}-500 to-transparent`}></div>
          </motion.div>
        ) : (
          <motion.div
            key="open_box_hook"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`w-full max-w-lg p-6 rounded-3xl bg-${categoryColor}-500/5 border-2 border-${categoryColor}-500/50 ${theme.glow} shadow-2xl relative overflow-hidden`}
          >
            {/* Energy sparkles background */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Curiosity Lock Released • লক উন্মুক্ত</span>
            </div>

            {/* Sparkle burst */}
            <div className="absolute top-3 right-3 text-yellow-400 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>

            {/* Hook Clue Description (Emotional Trigger) */}
            <div className="mt-10 mb-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
                <AlertCircle className="w-9 h-9 animate-bounce" />
              </div>
              
              <h4 className="text-orange-400 text-[10px] font-bold tracking-wider uppercase">
                Curiosity Hook • আপনার জন্য ধাঁধা
              </h4>
              <p className="text-white font-display font-black text-2xl text-center mt-3 px-4 leading-snug border-l-4 border-emerald-400 bg-emerald-500/10 py-5 rounded-2xl shadow-inner">
                "{hookText}"
              </p>
            </div>

            {/* Visual momentum pulse */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-5">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400"
              ></motion.div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] text-white/50 mb-3 font-mono">
                Momentum is building... Unveiling the quiz stage in 3s
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
