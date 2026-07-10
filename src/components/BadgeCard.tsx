import React from "react";
import { motion } from "motion/react";
import { Lock, Award, ShieldAlert, Zap, Flame, Compass, TreePine, Trophy, Sparkles } from "lucide-react";
import { Badge } from "../types";
import { playSynthSound } from "../utils/audio";

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  key?: string;
}

export default function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className={`w-8 h-8 ${isUnlocked ? "text-orange-500" : "text-white/30"}`} />;
      case "Zap":
        return <Zap className={`w-8 h-8 ${isUnlocked ? "text-yellow-400 animate-bounce" : "text-white/30"}`} />;
      case "Compass":
        return <Compass className={`w-8 h-8 ${isUnlocked ? "text-blue-400" : "text-white/30"}`} />;
      case "TreePine":
        return <TreePine className={`w-8 h-8 ${isUnlocked ? "text-emerald-400" : "text-white/30"}`} />;
      case "ShieldAlert":
        return <ShieldAlert className={`w-8 h-8 ${isUnlocked ? "text-red-400" : "text-white/30"}`} />;
      case "Trophy":
        return <Trophy className={`w-8 h-8 ${isUnlocked ? "text-amber-400 animate-pulse" : "text-white/30"}`} />;
      default:
        return <Award className="w-8 h-8 text-white/30" />;
    }
  };

  const handleBadgeTap = () => {
    if (isUnlocked) {
      playSynthSound("badge");
    } else {
      playSynthSound("tap");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBadgeTap}
      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
        isUnlocked
          ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5"
          : "bg-white/[0.02] border-white/5 opacity-50"
      }`}
    >
      {/* Glow highlight for unlocked */}
      {isUnlocked && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-lg pointer-events-none"></div>
      )}

      {/* Sparkling particle on unlocked badge */}
      {isUnlocked && (
        <div className="absolute top-2.5 right-2.5 text-amber-400/80">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
      )}

      {/* Icon Sphere */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden ${
          isUnlocked
            ? "bg-amber-500/15 border-2 border-amber-500/30 shadow-inner"
            : "bg-white/5 border border-white/5"
        }`}
      >
        {getBadgeIcon(badge.icon)}

        {/* Lock overlay for locked badges */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
            <Lock className="w-4 h-4 text-white/40" />
          </div>
        )}
      </div>

      {/* Badge Name */}
      <div className="z-10">
        <h4 className={`font-display font-black text-base tracking-tight ${isUnlocked ? "text-amber-400" : "text-white/60"}`}>
          {badge.bengaliName}
        </h4>
        <p className="text-[10px] text-white/40 font-mono mt-0.5">{badge.name}</p>
        
        {/* Description / Criteria */}
        <p className="text-white/75 text-xs mt-2 px-1 leading-normal font-sans font-medium line-clamp-2">
          {badge.bengaliDescription}
        </p>

        {/* Requirement Pill */}
        <div className="mt-3.5">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border-2 ${
              isUnlocked
                ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
                : "bg-white/5 text-white/30 border-white/10"
            }`}
          >
            {badge.requirement}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
