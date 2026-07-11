import { Category, Badge, Question } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "science",
    name: "Science & Cosmos",
    bengaliName: "বিজ্ঞান ও মহাকাশ",
    color: "indigo",
    icon: "Orbit",
    description: "Explore the mysteries of atoms, space, quantum physics, and the universe.",
    bengaliDescription: "পরমাণু, মহাকাশ, কোয়ান্টাম ফিজিক্স এবং মহাবিশ্বের বিস্ময়কর রহস্য উন্মোচন করুন।",
    vibe: "Wonder & Discovery",
    bengaliVibe: "বিস্ময় ও কৌতূহল"
  },
  {
    id: "nature",
    name: "Nature & Wildlife",
    bengaliName: "প্রকৃতি ও জীবজগৎ",
    color: "emerald",
    icon: "Leaf",
    description: "Unravel the bizarre adaptations of plants, animals, and natural habitats.",
    bengaliDescription: "উদ্ভিদ, প্রাণী এবং প্রাকৃতিক পরিবেশের অবিশ্বাস্য সব অভিযোজন নিয়ে জানুন।",
    vibe: "Vitality & Serenity",
    bengaliVibe: "প্রাণবন্ত সজীবতা"
  },
  {
    id: "history",
    name: "History & Heritage",
    bengaliName: "ইতিহাস ও ঐতিহ্য",
    color: "rose",
    icon: "Bookmark",
    description: "Walk through ancient civilizations, legendary battles, and cultural marvels.",
    bengaliDescription: "প্রাচীন সভ্যতা, কিংবদন্তি লড়াই এবং সাংস্কৃতিক গৌরবের গল্পে হারিয়ে যান।",
    vibe: "Majesty & Nostalgia",
    bengaliVibe: "রাজকীয় গৌরবগাথা"
  },
  {
    id: "tech",
    name: "Inventions & Tech",
    bengaliName: "আবিষ্কার ও প্রযুক্তি",
    color: "cyan",
    icon: "Cpu",
    description: "Discover breakthrough human inventions, computers, and future tech.",
    bengaliDescription: "মানব ইতিহাসের যুগান্তকারী আবিষ্কার, কম্পিউটার এবং ভবিষ্যতের প্রযুক্তি জানুন।",
    vibe: "Energy & Spark",
    bengaliVibe: "গতিশীল উদ্ভাবন"
  },
  {
    id: "arts",
    name: "Arts & Literature",
    bengaliName: "শিল্প ও সাহিত্য",
    color: "amber",
    icon: "Palette",
    description: "Savor the colors of master paintings, literature, philosophy, and music.",
    bengaliDescription: "বিখ্যাত চিত্রকর্ম, বিশ্বসেরা সাহিত্য, দর্শন এবং সংগীতের সুধা আস্বাদন করুন।",
    vibe: "Creativity & Soul",
    bengaliVibe: "সৃজনশীল আত্মিক সুখ"
  },
  {
    id: "class3_gk",
    name: "Class 3 GK",
    bengaliName: "তৃতীয় শ্রেণীর সাধারণ জ্ঞান",
    color: "orange",
    icon: "BookOpen",
    description: "Explore traditional quizzes based on the Class 3 General Knowledge Curriculum of Bangladesh.",
    bengaliDescription: "তৃতীয় শ্রেণীর সাধারণ জ্ঞান পাঠ্যবই থেকে সংকলিত ঐতিহ্যবাহী কুইজ ও বিস্ময়কর তথ্যাদি উন্মোচন করুন।",
    vibe: "Curiosity & Wisdom",
    bengaliVibe: "জ্ঞান ও কৌতূহল"
  }
];

export const BADGES: Badge[] = [
  {
    id: "first_discovery",
    name: "Curious Spark",
    bengaliName: "কৌতূহলের স্ফুলিঙ্গ",
    icon: "Flame",
    description: "Unlocked your very first Mystery Box!",
    bengaliDescription: "প্রথমবারের মতো একটি রহস্য বাক্স উন্মোচন করেছেন!",
    requirement: "Unwrap 1 mystery box"
  },
  {
    id: "streak_3",
    name: "Momentum Maker",
    bengaliName: "গতির কারিগর",
    icon: "Zap",
    description: "Maintained a 3-turn Discovery Streak!",
    bengaliDescription: "টানা ৩ দিন কৌতূহলের ধারা বজায় রেখেছেন!",
    requirement: "Achieve a 3-turn streak"
  },
  {
    id: "cosmos_pioneer",
    name: "Cosmos Pioneer",
    bengaliName: "মহাকাশ অভিযাত্রী",
    icon: "Compass",
    description: "Correctly solved the Secrets of the Cosmos!",
    bengaliDescription: "বিজ্ঞান ও মহাকাশ বিভাগের কুইজ সফলভাবে সমাধান করেছেন!",
    requirement: "Correctly solve Secrets of the Cosmos"
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  {
    factTitle: "উড়ন্ত হেলিকপ্টার (The Backward Flyer)",
    curiosityHook: "এটি এমন এক অনন্য পাখি যা শুধু সামনের দিকেই ওড়ে না, বরং বাতাসে এক জায়গায় স্থির ভাসমান থাকতে পারে এবং অবিশ্বাস্যভাবে পিছনের দিকেও উড়তে পারে! (This unique bird can fly backwards!)",
    question: "কোন পাখিটি উল্টো দিকে বা পিছনের দিকে উড়তে সক্ষম? (Which bird can fly backwards?)",
    options: [
      "টুনটুনি পাখি (Tailorbird)",
      "হামিংবার্ড (Hummingbird)",
      "কাঠঠোকরা পাখি (Woodpecker)",
      "মাছরাঙা পাখি (Kingfisher)"
    ],
    answerIndex: 1,
    eurekaExplanation: "ইউরেকা! 🐦 এটি হলো হামিংবার্ড। এরা প্রতি সেকেন্ডে প্রায় ৮০ বার ডানা ঝাপটায়, যার ফলে বাতাসে স্থির দাঁড়িয়ে থাকতে পারে এবং অবিশ্বাস্যভাবে পিছনের দিকে উড়তে পারে! এদের বিপাক প্রক্রিয়া এত দ্রুত যে তারা প্রতিদিন নিজেদের ওজনের সমপরিমাণ ফুলের মধু পান করে।",
    animationType: "nature_forest",
    category: "nature",
    difficulty: "beginner"
  },
  {
    factTitle: "নীল রক্তের রাজা (The Blue Blood King)",
    curiosityHook: "এই রহস্যময় সামুদ্রিক জীবের শরীরে একটি বা দুটি নয়, বরং তিনটি হৃৎপিণ্ড রয়েছে! এবং এদের রক্ত লাল নয়, বরং ঘন উজ্জ্বল নীল রঙের! (This ocean creature has three hearts and deep blue blood!)",
    question: "কোন সামুদ্রিক জীবের তিনটি হৃৎপিণ্ড এবং নীল রক্ত থাকে? (Which sea creature has three hearts and blue blood?)",
    options: [
      "মহাবীর হাঙর (Great White Shark)",
      "অক্টোপাস (Octopus)",
      "নীল তিমি (Blue Whale)",
      "জেলিফিশ (Jellyfish)"
    ],
    answerIndex: 1,
    eurekaExplanation: "অসাধারণ! 🐙 অক্টোপাসের রক্তে লোহা নয়, অথচ 'হিমোসায়ানিন' নামক তামা-সমৃদ্ধ প্রোটিন থাকে যা অক্সিজেনের সংস্পর্শে রক্তকে নীল করে তোলে। এদের ৩টি হৃৎপিণ্ডের মধ্যে ২টি ফুলকায় রক্ত দেয় এবং একটি সারা শরীরে রক্ত পাম্প করে। যখন তারা সাঁতার কাটে, তখন শরীরের রক্ত পাম্প করা হৃৎপিণ্ডটি বন্ধ হয়ে যায়, তাই তারা সাঁতার কাটার চেয়ে হামাগুড়ি দিতেই বেশি ভালোবাসে!",
    animationType: "heart_beat",
    category: "nature",
    difficulty: "beginner"
  },
  {
    factTitle: "মহাকর্ষের ব্ল্যাক হোল (The Cosmic Gravity Trap)",
    curiosityHook: "মহাবিশ্বের এমন এক চরম ঘনত্বসম্পন্ন স্থান যার মহাকর্ষীয় টান এত তীব্র যে এর গ্রাস থেকে আলো পর্যন্ত পালাতে পারে না! (A cosmic entity with gravity so strong even light cannot escape!)",
    question: "মহাবিশ্বের কোন মহাজাগতিক বস্তুর অভিকর্ষ বল থেকে আলোও বেরিয়ে আসতে পারে না? (From which cosmic object can even light not escape?)",
    options: [
      "সুপারনোভা বিস্ফোরণ (Supernova)",
      "কৃষ্ণগহ্বর বা ব্ল্যাক হোল (Black Hole)",
      "নিহারীকা বা নেবুলা (Nebula)",
      "নিউট্রন তারা (Neutron Star)"
    ],
    answerIndex: 1,
    eurekaExplanation: "ইউরেকা! 🌌 এটি হলো ব্ল্যাক হোল বা কৃষ্ণগহ্বর। যখন কোনো বিশাল নক্ষত্র জ্বালানি শেষ করে নিজের মহাকর্ষের চাপে সংকুচিত হয়ে একটি পরম বিন্দুতে পরিণত হয়, তখন এই চরম মহাকর্ষীয় ক্ষেত্রের সৃষ্টি হয়। এর সীমানাকে বলা হয় ঘটনা দিগন্ত (Event Horizon), যা পার হলে মহাবিশ্বের আর কোনো তথ্য ফিরে আসে না!",
    animationType: "space_orbit",
    category: "science",
    difficulty: "advanced"
  },
  {
    factTitle: "সিমেন্ট ছাড়া তাজমহল (The Cementless Masterpiece)",
    curiosityHook: "বিশ্বের এই বিখ্যাত সপ্তম আশ্চর্যের সাদা পাথরের স্মৃতিসৌধটি তৈরি করতে কোনো আধুনিক সিমেন্ট ব্যবহার করা হয়নি, অথচ এটি ৪০০ বছর ধরে সগর্বে দাঁড়িয়ে আছে! (This famous wonder of the world was built completely without cement, yet stands strong after 400 years!)",
    question: "তাজমহল তৈরির সময় রাজমিস্ত্রিরা পাথর জোড়া দিতে সিমেন্টের বদলে কী ব্যবহার করেছিলেন? (What was used instead of cement to bind stones in Taj Mahal?)",
    options: [
      "ডিমের সাদা অংশ ও মধু (Egg whites and Honey)",
      "विशेष গুড়, বেল আঠা ও চুন মিশ্রণ (Gur, Bel, and Lime mixture)",
      "গরম আলকাতরা ও আঠা (Hot Tar and Resin)",
      "সামুদ্রিক কাদা ও চালের গুঁড়ো (Sea mud and Rice starch)"
    ],
    answerIndex: 1,
    eurekaExplanation: "চমকপ্রদ! 🕌 সপ্তদশ শতাব্দীতে সিমেন্ট আবিষ্কারই হয়নি। মুঘল স্থপতিরা গুড়, বেলগাছের ফল, মাষকলাইয়ের ডাল ভেজানো জল, দই এবং বিশেষ চুন মিশ্রণ দিয়ে এক দুর্ভেদ্য আঠালো মসলা তৈরি করেছিলেন। এটি পাথরগুলোকে এমন এক রাসায়নিক বন্ধне আটকে রেখেছে যা আজ আধুনিক কংক্রিটের চেয়েও বেশি স্থায়ী প্রমাণিত হয়েছে!",
    animationType: "ancient_pyramid",
    category: "history",
    difficulty: "advanced"
  },
  {
    factTitle: "জ্যান্ত ব্যাটারি (The Living Battery)",
    curiosityHook: "এই জলজ প্রাণীটি তার শরীর থেকে প্রায় ৮৬০ ভোল্ট পর্যন্ত বিদ্যুৎ উৎপন্ন করতে পারে, যা দিয়ে একটি আস্ত ঘোড়াকে অজ্ঞান করে ফেলা সম্ভব! (This creature can generate up to 860 volts of electricity!)",
    question: "কোন মাছটি শরীর থেকে উচ্চমাত্রার কারেন্ট বা বিদ্যুৎ তৈরি করতে পারে? (Which fish can generate huge electric shocks?)",
    options: [
      "ক্যাটফিশ (Catfish)",
      "ইলেকট্রিক ইল (Electric Eel)",
      "স্টিংরে মাছ (Stingray)",
      "পাথার মাছ (Pufferfish)"
    ],
    answerIndex: 1,
    eurekaExplanation: "বিদ্যুৎ গতিতে সঠিক! ⚡ ইলেকট্রিক ইলের শরীরে হাজার হাজার বিদ্যুৎ উৎপাদনকারী বিশেষ কোষ থাকে যাকে 'ইলেক্ট্রোসাইট' বলা হয়। যখন তারা আত্মরক্ষা বা শিকার করতে চায়, তখন এই কোষগুলো একসাথে ব্যাটারির মতো যুক্ত হয়ে বিপুল বৈদ্যুতিক ভোল্টেজ নির্গমন করে, যা আক্ষরিক অর্থেই পানির ভেতর বজ্রপাত সৃষ্টি করে!",
    animationType: "electric_spark",
    category: "tech",
    difficulty: "intermediate"
  },
  {
    factTitle: "মোনা লিসার অলীক ভ্রু (The Missing Eyebrows of Mona Lisa)",
    curiosityHook: "লিওনার্দো দা ভিঞ্চির আঁকা এই কালজয়ী চিত্রকর্মটির মুখে একটি অদ্ভুত অভাব রয়েছে যা আপাতদৃষ্টিতে অনেকেই খেয়াল করেন না, অথচ খুব ভালো করে তাকালে বিষয়টি চোখে পড়ে! (This master painting has a very subtle facial feature missing!)",
    question: "বিশ্বখ্যাত চিত্রকর্ম 'মোনা লিসা'র মুখে কী অনুপস্থিত রয়েছে? (What is missing from Mona Lisa's face?)",
    options: [
      "তার চোখের মণি (Eyeballs)",
      "তার চোখের ভ্রু (Eyebrows)",
      "তার কানের লতি (Earlobes)",
      "তার হাসির ভাঁজ (Smiling dimples)"
    ],
    answerIndex: 1,
    eurekaExplanation: "দারুণ পর্যবেক্ষণ! 🎨 মোনা লিসার কোনো ভ্রু বা চোখের পাপড়ি নেই! ঐতিহাসিকদের একটি বড় অংশের মতে, রেনেসাঁ যুগে ধনী নারীদের ভ্রু পুরোপুরি কামিয়ে ফেলাটাই ছিল আভিজাত্য বা ফ্যাশন। আবার ডিজিটাল হাই-রেজোলিউশন স্ক্যানে দেখা গেছে, দা ভিঞ্চি প্রথমে ভ্রু এঁকেছিলেন, কিন্তু শতাব্দীর পর শতাব্দী ধরে পরিষ্কার এবং রক্ষণাবেক্ষণের ক্ষয়ে বা কাঁচের আড়ালে তা হারিয়ে গেছে।",
    animationType: "dna_helix",
    category: "arts",
    difficulty: "intermediate"
  },
  {
    factTitle: "কাঁচের বালির রহস্য (Glass made of Sand)",
    curiosityHook: "যে পদার্থটি দিয়ে আমরা স্বচ্ছ জানালা বা গবেষণাগারের কাঁচ তৈরি করি, সেটি আসলে আমাদের পায়ের নিচের অতি সাধারণ ধূলিকণা বা বালির চরম রূপান্তর! (This transparent material is actually heavily heated sand!)",
    question: "কাঁচ তৈরি করার প্রধান কাঁচামাল কোনটি? (What is the primary raw material used to make glass?)",
    options: [
      "চুনাপাথর (Limestone)",
      "বালি বা সিলিকা (Sand / Silica)",
      "বিশেষ সোডা অ্যাশ (Soda Ash)",
      "আগ্নেয়গিরির লাভা (Volcanic Ash)"
    ],
    answerIndex: 1,
    eurekaExplanation: "চমৎকার! 🧪 কাঁচ মূলত তৈরি হয় সিলিকন ডাই-অক্সাইড বা সাধারণ সাদা বালি থেকে। বালিকে প্রায় ১৭০০ ডিগ্রি সেলসিয়াস (৩০০০ ডিগ্রি ফারেনহাইট) তাপমাত্রায় প্রচণ্ড উত্তপ্ত করলে তা গলে তরল হয়ে যায়। এরপর তা দ্রুত ঠাণ্ডা করা হলে তা ক্রিস্টাল তৈরি করার সময় পায় না এবং একটি স্বচ্ছ, শক্ত 'অ্যামরফাস সলিড' অর্থাৎ কাঁচ-এ পরিণত হয়!",
    animationType: "chemistry_bond",
    category: "science",
    difficulty: "advanced"
  },
  {
    factTitle: "জাতীয় পতাকার অনুপাত (Ratio of the National Flag)",
    curiosityHook: "আমাদের জাতীয় পতাকা শুধুই আয়তাকার সবুজ ক্যানভাসে লাল বৃত্ত নয়, এর দৈর্ঘ্য ও প্রস্থের একটি নির্দিষ্ট গাণিতিক অনুপাত রয়েছে! (The length and width of our national flag have a strict mathematical ratio!)",
    question: "বাংলাদেশের জাতীয় পতাকার দৈর্ঘ্য ও প্রস্থের অনুপাত কত? (What is the ratio of the length and width of the national flag of Bangladesh?)",
    options: [
      "৯ : ৫ (9:5)",
      "১০ : ৬ (10:6)",
      "১০ : ৫ (10:5)",
      "৮ : ৫ (8:5)"
    ],
    answerIndex: 1,
    eurekaExplanation: "অসাধারণ! 🇧🇩 বাংলাদেশের জাতীয় পতাকার দৈর্ঘ্য ও প্রস্থের অনুপাত ১০:৬ (বা ৫:৩)। লাল বৃত্তটির ব্যাসার্ধ হবে দৈর্ঘ্যর ৫ ভাগের ১ ভাগ। পতাকার সবুজ রংটি আমাদের সজীবতা ও শ্যামল প্রকৃতির প্রতীক, আর লাল বৃত্তটি তরুণদের রক্ত ও স্বাধীনতার নতুন সূর্যের প্রতীক।",
    animationType: "chemistry_bond",
    category: "class3_gk",
    difficulty: "beginner"
  },
  {
    factTitle: "জাতীয় পতাকার রূপকার (The Designer of the Flag)",
    curiosityHook: "আমাদের প্রিয় লাল-সবুজ পতাকাটি যিনি এঁকেছেন এবং এর বর্তমান রূপটি উপহার দিয়েছেন, তিনি বাংলাদেশের এক প্রখ্যাত চিত্রশিল্পী। (The legendary artist who designed the final form of our flag!)",
    question: "বাংলাদেশের জাতীয় পতাকার রূপকার বা নকশাকার কে? (Who designed the National Flag of Bangladesh?)",
    options: [
      "জয়নুল আবেদিন (Zainul Abedin)",
      "কামরুল হাসান (Quamrul Hassan)",
      "এস. এম. সুলতান (S. M. Sultan)",
      "হাশেম খান (Hashem Khan)"
    ],
    answerIndex: 1,
    eurekaExplanation: "অসাধারণ! 🇧🇩 পটুয়া কামরুল হাসান আমাদের জাতীয় পতাকার বর্তমান রূপকার। তিনিই ১৯৭১ সালের মুক্তিযুদ্ধের সময় এই পতাকার চূড়ান্ত নকশা প্রণয়ন করেন। এছাড়াও তিনি বাংলাদেশের জাতীয় প্রতীকেরও রূপকার।",
    animationType: "dna_helix",
    category: "class3_gk",
    difficulty: "beginner"
  },
  {
    factTitle: "মুক্তিযুদ্ধের নয় মাস (Nine Months of Liberation War)",
    curiosityHook: "আমাদের প্রিয় মাতৃभूमि বাংলাদেশ ১৯৭১ সালে এক রক্তক্ষয়ী যুদ্ধের মাধ্যমে স্বাধীনতা অর্জন করে। এই মুক্তিযুদ্ধ কত দিন স্থায়ী হয়েছিল? (For how many months did our historic Liberation War last?)",
    question: "বাংলাদেশের মুক্তিযুদ্ধ কত মাস স্থায়ী হয়েছিল? (How many months did the Liberation War of Bangladesh last?)",
    options: [
      "৬ মাস (6 Months)",
      "৯ মাস (9 Months)",
      "১২ মাস (12 Months)",
      "৩ মাস (3 Months)"
    ],
    answerIndex: 1,
    eurekaExplanation: "ইউরেকা! 🇧🇩 ১৯৭১ সালের ২৬শে মার্চ বঙ্গবন্ধুর স্বাধীনতার ঘোষণার মাধ্যমে মুক্তিযুদ্ধ শুরু হয় এবং ১৬ই ডিসেম্বর বিজয় অর্জনের মধ্য দিয়ে শেষ হয়। এই মুক্তিযুদ্ধ দীর্ঘ প্রায় ৯ মাস স্থায়ী হয়েছিল এবং এর পেছনে ৩০ লক্ষ শহীদের রক্ত ও ২ লক্ষ মা-বোনের সম্ভ্রম জড়িয়ে আছে।",
    animationType: "ancient_pyramid",
    category: "class3_gk",
    difficulty: "intermediate"
  },
  {
    factTitle: "হা-ডু-ডু থেকে কাবাডি (The National Sport: Kabaddi)",
    curiosityHook: "গ্রামীণ বাংলার অত্যন্ত জনপ্রিয় এই ঐতিহ্যবাহী খেলাটি ১৯৭২ সালে বাংলাদেশের জাতীয় খেলা হিসেবে স্বীকৃতি পায়! (This traditional game was declared the national sport of Bangladesh in 1972!)",
    question: "বাংলাদেশের জাতীয় খেলার নাম কী? (What is the name of the national sport of Bangladesh?)",
    options: [
      "ফুটবল (Football)",
      "ক্রিকেট (Cricket)",
      "কাবাডি বা হা-ডু-ডু (Kabaddi / Ha-du-du)",
      "দাবাড়ু (Chess)"
    ],
    answerIndex: 2,
    eurekaExplanation: "দারুণ! 🤼 বাংলাদেশের জাতীয় খেলা হলো কাবাডি বা হা-ডু-ডু। এটি বাংলার এক অতি প্রাচীন ও ঐতিহ্যবাহী গ্রামীণ খেলা যা মানুষের শারীরিক শক্তি, ফুসফুসের ক্ষমতা এবং তাৎক্ষণিক বুদ্ধিমত্তা বৃদ্ধি করতে অসাধারণ ভূমিকা রাখে।",
    animationType: "heart_beat",
    category: "class3_gk",
    difficulty: "beginner"
  },
  {
    factTitle: "সৌরজগতের পরিবার (The Solar System Family)",
    curiosityHook: "সূর্যকে কেন্দ্র করে নির্দিষ্ট কক্ষপথে আবর্তিত হওয়া বস্তুপিণ্ডগুলোকে গ্রহ বলে। আমাদের সৌরজগতে মোট কয়টি গ্রহ রয়েছে? (How many planets orbit our sun in the solar system?)",
    question: "সৌরজগতে মোট কয়টি গ্রহ রয়েছে? (How many planets are there in the solar system?)",
    options: [
      "৭টি (7)",
      "৮টি (8)",
      "৯টি (9)",
      "১০টি (10)"
    ],
    answerIndex: 1,
    eurekaExplanation: "মহাজাগতিক চমৎকারিত্ব! 🌌 আমাদের সৌরজগতে মোট ৮টি গ্রহ রয়েছে। সূর্য থেকে দূরত্ব অনুযায়ী এগুলো হলো: বুধ, শুক্র, পৃথিবী, মঙ্গল, বৃহস্পতি, শনি, ইউরেনাস এবং নেপচুন। এর মধ্যে বৃহস্পতি হলো সবচেয়ে বড় এবং বুধ হলো সবচেয়ে ছোট গ্রহ।",
    animationType: "space_orbit",
    category: "class3_gk",
    difficulty: "intermediate"
  },
  {
    factTitle: "গাছের অনুভূতি ও প্রাণ (The Pulse of Plants)",
    curiosityHook: "উদ্ভিদও যে আমাদের মতো এক জীবন্ত সত্ত্বা, তাদেরও যে প্রাণ ও অনুভূতি আছে তা প্রমাণ করে বিশ্বকে তাক লাগিয়ে দিয়েছিলেন একজন বাঙালি বিজ্ঞানী! (A Bengali scientist proved to the world that plants have life and feelings!)",
    question: "গাছের প্রাণ আছে - এই তথ্যটি কে আবিষ্কার করেন? (Who discovered that plants have life?)",
    options: [
      "স্যার আইজ্যাক নিউটন (Sir Isaac Newton)",
      "বিজ্ঞানী আচার্য জগদীশ চন্দ্র বসু (Sir Jagadish Chandra Bose)",
      "আলবার্ট আইনস্টাইন (Albert Einstein)",
      "গ্যালিলিও গ্যালিলি (Galileo Galilei)"
    ],
    answerIndex: 1,
    eurekaExplanation: "অসাধারণ! 🌿 আচার্য জগদীশ চন্দ্র বসু 'ক্রেসকোগ্রাফ' (Crescograph) নামক একটি অত্যন্ত সূক্ষ্ম যন্ত্র আবিষ্কার করেন যা দিয়ে উদ্ভিদের অতি সামান্য বৃদ্ধি ও অনুভূতি পরিমাপ করা যায়। তিনি প্রমাণ করেন যে গাছ উদ্দীপনায় সাড়া দেয়, ব্যথা পায় এবং তাদেরও মানুষের মতোই প্রাণ আছে!",
    animationType: "nature_forest",
    category: "class3_gk",
    difficulty: "intermediate"
  },
  {
    factTitle: "পদ্মা সেতুর দৈর্ঘ্য ও গৌরব (Padma Bridge: Symbol of Pride)",
    curiosityHook: "সম্পূর্ণ নিজস্ব অর্থায়নে নির্মিত বাংলাদেশের আত্মমর্যাদার প্রতীক পদ্মা বহুমুখী সেতুটি বিশ্বের অন্যতম দীর্ঘতম দ্বিতল ট্রাস সেতু। এর মোট দৈর্ঘ্য কত? (The total length of the magnificent Padma Bridge built with Bangladesh's own funds!)",
    question: "পদ্মা বহুমুখী সেতুর মোট দৈর্ঘ্য কত কিলোমিটার? (What is the total length of the Padma Multipurpose Bridge in kilometers?)",
    options: [
      "৫.১৫ কি.মি. (5.15 km)",
      "৬.১৫ কি.মি. (6.15 km)",
      "৭.১৫ কি.মি. (7.15 km)",
      "৬.৫০ কি.মি. (6.50 km)"
    ],
    answerIndex: 1,
    eurekaExplanation: "শতভাগ সঠিক! 🌉 পদ্মা বহুমুখী সেতুটির মোট দৈর্ঘ্য ৬.১৫ কিলোমিটার (বা ২০,১৮০ ফুট)। এটি দ্বিতল বিশিষ্ট একটি ট্রাস সেতু, যার ওপরের তলায় ৪ লেনের সড়কপথ এবং নিচের তলায় রেলপথ রয়েছে। এটি নির্মাণে মোট ব্যয় হয়েছে ৩০,১৯৩ কোটি ৩৯ লাখ টাকা এবং ২৫শে জুন ২০২২ সালে এটি উদ্বোধন করা হয়।",
    animationType: "chemistry_bond",
    category: "class3_gk",
    difficulty: "advanced"
  },
  {
    factTitle: "লজ্জাবতী পাতার গুটিয়ে যাওয়া (The Sensitive Plant)",
    curiosityHook: "এই গাছের পাতাগুলোতে স্পর্শ করলেই তারা সাথে সাথে সংকুচিত হয়ে গুটিয়ে বা নুয়ে পড়ে, যেন তারা লজ্জা পাচ্ছে! (This plant folds its leaves instantly when touched!)",
    question: "কোন গাছের পাতা সামান্য স্পর্শ পেলেই নুয়ে পড়ে? (Which plant's leaves droop instantly upon being touched?)",
    options: [
      "পাথরকুচি গাছ (Bryophyllum)",
      "লজ্জাবতী গাছ (Mimosa pudica / Sensitive Plant)",
      "ফণিমনসা গাছ (Cactus)",
      "সিনকোনা গাছ (Cinchona)"
    ],
    answerIndex: 1,
    eurekaExplanation: "অপূর্ব! ☘️ লজ্জাবতী (Mimosa pudica) গাছের পাতায় স্পর্শ করা হলে এদের পাতার গোড়ার জলীয় চাপ বা 'টার্গার প্রেশার' দ্রুত কমে যায়। ফলে পাতাগুলো তাদের টানটান ভাব হারিয়ে সংকুচিত বা নুয়ে পড়ে। একে বিজ্ঞানসম্মতভাবে 'সিসমোন্যাস্টিক মুভমেন্ট' বলা হয়।",
    animationType: "nature_forest",
    category: "class3_gk",
    difficulty: "beginner"
  },
  {
    factTitle: "স্বাধীন বাংলাদেশের প্রথম রাষ্ট্রপতি (The First President)",
    curiosityHook: "স্বাধীন সার্বভৌম বাংলাদেশের প্রথম রাষ্ট্রপতি হিসেবে কে দায়িত্ব গ্রহণ করেছিলেন, যাঁর বজ্রকণ্ঠ আমাদের মুক্তিযুদ্ধে উদ্বুদ্ধ করেছিল? (Who became the first President of independent Bangladesh?)",
    question: "স্বাধীন বাংলাদেশের প্রথম রাষ্ট্রপতি কে ছিলেন? (Who was the first President of independent Bangladesh?)",
    options: [
      "তাজউদ্দীন আহমদ (Tajuddin Ahmad)",
      "বঙ্গবন্ধু শেখ মুজিবুর রহমান (Bangabandhu Sheikh Mujibur Rahman)",
      "সৈয়দ নজরুল ইসলাম (Syed Nazrul Islam)",
      "এম. এ. জি. ওসমানী (M. A. G. Osmani)"
    ],
    answerIndex: 1,
    eurekaExplanation: "ইতিহাসের গৌরবগাথা! 🇧🇩 বাংলাদেশের প্রথম রাষ্ট্রপতি হলেন জাতির জনক বঙ্গবন্ধু শেখ মুজিবুর রহমান। ১৯৭১ সালের ১৭ই এপ্রিল মুজিবনগর সরকার গঠিত হলে তাঁকে রাষ্ট্রপতি হিসেবে ঘোষণা করা হয়। তিনি পাকিস্তানের কারাগারে বন্দি থাকায় তাঁর অনুপস্থিতিতে উপ-রাষ্ট্রপতি সৈয়দ নজরুল ইসলাম অস্থায়ী রাষ্ট্রপতির দায়িত্ব পালন করেন। আর তাজউদ্দীন আহমদ ছিলেন প্রথম প্রধানমন্ত্রী।",
    animationType: "ancient_pyramid",
    category: "class3_gk",
    difficulty: "advanced"
  }
];

export const TRIVIA_NOTIFICATIONS = [
  {
    id: "notif_1",
    question: "কোন পাখিটি পিছনের দিকে উড়তে পারে?",
    curiosity: "ডানা ঝাপটানোর এক জাদুকরী ছন্দ যা একে বাতাসের হেলিকপ্টার বানিয়েছে...",
    category: "nature",
    sound: "bell"
  },
  {
    id: "notif_2",
    question: "৩টি হৃদপিণ্ড এবং নীল রঙের রক্ত কার থাকে?",
    curiosity: "সমুদ্রের গভীরে থাকা এই বুদ্ধিমান জীবের শরীরে লোহার বদলে তামা বইছে...",
    category: "nature",
    sound: "bell"
  },
  {
    id: "notif_3",
    question: "তাজমহল কী দিয়ে জোড়া লাগানো হয়েছিল?",
    curiosity: "সিমেন্ট আবিষ্কারের ৩০০ বছর আগের এক আশ্চর্য মুঘল রেসিপি...",
    category: "history",
    sound: "bell"
  },
  {
    id: "notif_4",
    question: "কোন মাছ শরীর থেকে ৮৬০ ভোল্ট বিদ্যুৎ ছাড়ে?",
    curiosity: "এক ঝটকায় ঘোড়াকে কুপোকাত করার মতো জ্যান্ত ব্যাটারি...",
    category: "tech",
    sound: "bell"
  }
];
