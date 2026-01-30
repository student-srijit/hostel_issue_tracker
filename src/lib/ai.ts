import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface CategoryPrediction {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedPriority: string;
  keywords: string[];
}

export interface UrgencyPrediction {
  urgencyLevel: "low" | "medium" | "high" | "red";
  urgencyScore: number;
  reasoning: string;
  keywords: string[];
}

export async function predictCategory(description: string): Promise<CategoryPrediction> {
  const categories = [
    "plumbing",
    "electrical",
    "cleanliness",
    "internet",
    "furniture",
    "structural",
    "security",
    "ac_heating",
    "pest_control",
    "other",
  ];

  const priorities = ["low", "medium", "high", "emergency"];

  const prompt = `You are an AI assistant that categorizes hostel maintenance issues. 
Based on the following issue description, determine:
1. The most appropriate category from: ${categories.join(", ")}
2. Suggested priority level from: ${priorities.join(", ")}
3. Confidence score (0-1)
4. Brief reasoning
5. Key keywords that led to this categorization

Issue Description:
"${description}"

Respond in valid JSON format:
{
  "category": "string",
  "confidence": number,
  "reasoning": "string",
  "suggestedPriority": "string",
  "keywords": ["string"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that categorizes hostel maintenance issues. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const prediction = JSON.parse(response) as CategoryPrediction;
    
    // Validate category
    if (!categories.includes(prediction.category)) {
      prediction.category = "other";
    }

    // Validate priority
    if (!priorities.includes(prediction.suggestedPriority)) {
      prediction.suggestedPriority = "medium";
    }

    // Clamp confidence
    prediction.confidence = Math.max(0, Math.min(1, prediction.confidence));

    return prediction;
  } catch (error) {
    console.error("Error predicting category:", error);
    // Fallback to keyword-based prediction
    return fallbackPrediction(description);
  }
}

export async function predictUrgency(description: string): Promise<UrgencyPrediction> {
  const levels = ["low", "medium", "high", "red"] as const;
  const prompt = `You are an AI triage assistant for hostel safety and maintenance.
Analyze the complaint text and classify urgency.

Urgency Levels:
- red: life safety or immediate danger (fire, gas leak, collapse, electric shock)
- high: serious but not immediately life-threatening
- medium: standard maintenance request
- low: minor inconvenience (slow wifi, cosmetic issues)

Return valid JSON only:
{
  "urgencyLevel": "low|medium|high|red",
  "urgencyScore": number (0-100),
  "reasoning": "string",
  "keywords": ["string"]
}

Complaint:
"""${description}"""`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a precise triage assistant. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const prediction = JSON.parse(response) as UrgencyPrediction;
    if (!levels.includes(prediction.urgencyLevel)) {
      prediction.urgencyLevel = "medium";
    }
    prediction.urgencyScore = Math.max(0, Math.min(100, prediction.urgencyScore));
    return prediction;
  } catch (error) {
    console.error("Error predicting urgency:", error);
    return fallbackUrgency(description);
  }
}

function fallbackUrgency(description: string): UrgencyPrediction {
  const normalized = description.toLowerCase();
  const redKeywords = [
    "fire",
    "smoke",
    "gas leak",
    "leaking gas",
    "carbon monoxide",
    "co leak",
    "explosion",
    "short circuit",
    "electric shock",
    "sparks",
    "collapse",
    "collapsed",
    "flood",
    "burst pipe",
    "bleeding",
    "injury",
    "emergency",
    "threat",
    "danger",
  ];

  const highKeywords = [
    "sewage",
    "water leak",
    "leak",
    "no electricity",
    "power outage",
    "blackout",
    "security breach",
    "theft",
    "assault",
    "harassment",
    "lift stuck",
    "elevator stuck",
    "pest infestation",
    "snake",
  ];

  const lowKeywords = [
    "wifi slow",
    "slow wifi",
    "internet slow",
    "lag",
    "minor",
    "cosmetic",
    "paint",
    "noisy",
    "noise",
  ];

  const matched = (list: string[]) => list.filter((kw) => normalized.includes(kw));
  const redHits = matched(redKeywords);
  if (redHits.length > 0) {
    return { urgencyLevel: "red", urgencyScore: 95, reasoning: "Matched red keywords", keywords: redHits };
  }

  const highHits = matched(highKeywords);
  if (highHits.length > 0) {
    return { urgencyLevel: "high", urgencyScore: 80, reasoning: "Matched high keywords", keywords: highHits };
  }

  const lowHits = matched(lowKeywords);
  if (lowHits.length > 0) {
    return { urgencyLevel: "low", urgencyScore: 30, reasoning: "Matched low keywords", keywords: lowHits };
  }

  return { urgencyLevel: "medium", urgencyScore: 55, reasoning: "Default medium", keywords: [] };
}

function fallbackPrediction(description: string): CategoryPrediction {
  const descLower = description.toLowerCase();
  
  const keywordMap: Record<string, string[]> = {
    plumbing: ["water", "leak", "tap", "pipe", "drain", "bathroom", "toilet", "sink", "shower", "flood"],
    electrical: ["light", "switch", "power", "socket", "fan", "bulb", "wire", "electric", "voltage", "short circuit"],
    internet: ["wifi", "internet", "connection", "network", "router", "slow", "lag", "bandwidth"],
    ac_heating: ["ac", "air conditioning", "heating", "temperature", "cold", "hot", "hvac", "cooler", "heater"],
    cleanliness: ["clean", "dirty", "dust", "garbage", "hygiene", "trash", "smell", "stain", "mop"],
    pest_control: ["pest", "insect", "cockroach", "ant", "mosquito", "rat", "mice", "bug", "spider"],
    furniture: ["chair", "table", "bed", "cupboard", "desk", "broken", "drawer", "mattress", "wardrobe"],
    structural: ["wall", "ceiling", "floor", "crack", "damage", "door", "window", "roof", "paint"],
    security: ["lock", "security", "theft", "cctv", "gate", "key", "safe", "alarm"],
  };

  let bestMatch = { category: "other", count: 0, keywords: [] as string[] };

  for (const [category, keywords] of Object.entries(keywordMap)) {
    const matchedKeywords = keywords.filter((kw) => descLower.includes(kw));
    if (matchedKeywords.length > bestMatch.count) {
      bestMatch = { category, count: matchedKeywords.length, keywords: matchedKeywords };
    }
  }

  // Determine priority based on urgency keywords
  let priority = "medium";
  const urgentKeywords = ["urgent", "emergency", "immediately", "dangerous", "fire", "flood", "broken", "not working"];
  const lowKeywords = ["minor", "small", "slight", "when possible"];

  if (urgentKeywords.some((kw) => descLower.includes(kw))) {
    priority = "high";
  } else if (lowKeywords.some((kw) => descLower.includes(kw))) {
    priority = "low";
  }

  // Check for emergency conditions
  if (descLower.includes("emergency") || descLower.includes("fire") || descLower.includes("dangerous")) {
    priority = "emergency";
  }

  return {
    category: bestMatch.category,
    confidence: Math.min(0.9, 0.5 + bestMatch.count * 0.1),
    reasoning: bestMatch.count > 0
      ? `Matched keywords: ${bestMatch.keywords.join(", ")}`
      : "No specific keywords matched, defaulting to 'other'",
    suggestedPriority: priority,
    keywords: bestMatch.keywords,
  };
}

export async function generateIssueTitle(description: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Generate a concise, clear title (5-10 words) for a hostel maintenance issue based on the description. Just return the title, nothing else.",
        },
        {
          role: "user",
          content: description,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 50,
    });

    return completion.choices[0]?.message?.content?.trim() || "Maintenance Issue";
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback: use first sentence or truncate
    const firstSentence = description.split(/[.!?]/)[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 50) + "..." : firstSentence;
  }
}

export async function summarizeIssueComments(comments: string[]): Promise<string> {
  if (comments.length === 0) return "No comments yet.";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Summarize the following conversation about a hostel maintenance issue in 2-3 sentences. Focus on the key points and current status.",
        },
        {
          role: "user",
          content: comments.join("\n\n"),
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || "Unable to summarize.";
  } catch (error) {
    console.error("Error summarizing comments:", error);
    return "Unable to generate summary.";
  }
}
