import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended parameters
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI question generation will fall back to rich pre-curated questions.");
}

// REST API for question generation
app.post("/api/generate-question", async (req, res) => {
  const { category, topic, difficulty = "beginner", language = "bn-en" } = req.body;

  if (!ai) {
    return res.status(200).json({
      success: false,
      error: "Gemini API is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
      fallback: true
    });
  }

  try {
    const prompt = `Create a thrilling, curiosity-driven General Knowledge quiz question for students about the topic: "${topic || category}".
    The question MUST follow the "Mystery Box" concept and be tailored to the "${difficulty}" difficulty level.
    Guidelines for difficulty:
    - "beginner": Simple, widely known interesting facts with highly engaging clues, suitable for elementary/early learners.
    - "intermediate": Requires some logical thinking, curiosity, or basic junior school science/geography/history context.
    - "advanced": Truly challenging or rare facts requiring deeper analytical, historical, or scientific insights.
    
    It must have:
    1. A "curiosityHook" - A highly intriguing, mysterious clue or riddle (1-2 sentences) that describes the fact before naming it or asking the direct question. It must spark intense curiosity.
    2. A "question" - The actual question.
    3. "options" - Four highly plausible but creative options.
    4. "answerIndex" - The index of the correct option (0-3).
    5. "eurekaExplanation" - A mind-blowing "Eureka!" (Aha!) story/explanation that reveals the correct answer and explains the fascinating context in a way that is impossible to forget. Include emotional storytelling.
    6. "animationType" - A visual keyword to guide a custom CSS/Canvas illustration. Choose one of: "space_orbit", "chemistry_bond", "heart_beat", "dinosaur_walk", "dna_helix", "nature_forest", "volcano_lava", "ancient_pyramid", "physics_light", "electric_spark".
    7. "factTitle" - A short, dramatic title of the fact (e.g. "The Backward Flyer", "The Blue Blood King").
    8. "difficulty" - Set exactly to the requested value: "${difficulty}".
    
    Ensure all fields (except animationType and difficulty) are provided in Bengali with English transliterations/translations so it's readable for Bengali and English learners.
    Example:
    Curiosity Hook: "এটি এমন একটি অদ্ভুত পাখি যা কেবল সামনের দিকেই উড়তে পারে না, বরং বাতাসে স্থির থাকতে পারে এবং পিছনের দিকেও উড়তে পারে! (This unique bird can fly backwards!)"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            factTitle: { type: Type.STRING },
            curiosityHook: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            answerIndex: { type: Type.INTEGER },
            eurekaExplanation: { type: Type.STRING },
            animationType: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["factTitle", "curiosityHook", "question", "options", "answerIndex", "eurekaExplanation", "animationType", "difficulty"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const questionData = JSON.parse(text.trim());
    res.json({
      success: true,
      data: questionData
    });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate dynamic question using Gemini."
    });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`D-Likon Server is running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupServer();
}

export default app;
