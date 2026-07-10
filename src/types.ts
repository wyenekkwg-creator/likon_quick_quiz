export interface Question {
  id?: string;
  factTitle: string;
  curiosityHook: string;
  question: string;
  options: string[];
  answerIndex: number;
  eurekaExplanation: string;
  animationType: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  bengaliName: string;
  color: string; // Tailwind color name like 'purple', 'emerald', 'amber', 'rose', 'cyan'
  icon: string;  // Name of Lucide icon
  description: string;
  bengaliDescription: string;
  vibe: string;
  bengaliVibe: string;
}

export interface Badge {
  id: string;
  name: string;
  bengaliName: string;
  icon: string;
  description: string;
  bengaliDescription: string;
  requirement: string;
}

export interface UserStats {
  points: number;
  streak: number;
  lastPlayedDate: string | null;
  discoveredFactsCount: number;
  unlockedBadges: string[]; // Badge IDs
  discoveredFactTitles?: string[]; // Discovered fact titles
}

export interface DailyChallenge {
  id: string;
  factTitle: string;
  curiosityHook: string;
  question: string;
  options: string[];
  answerIndex: number;
  eurekaExplanation: string;
  animationType: string;
  category: string;
}
