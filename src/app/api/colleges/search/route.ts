import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const FALLBACK_COLLEGES = [
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kharagpur",
  "IIT Kanpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT Hyderabad",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "Delhi Technological University",
  "Jadavpur University",
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "Anna University",
  "Amity University",
  "Manipal Institute of Technology",
  "IISc Bengaluru",
  "IIIT Hyderabad",
  "IIIT Bangalore",
  "Jamia Millia Islamia",
  "Aligarh Muslim University",
  "Banaras Hindu University",
  "University of Delhi",
  "Christ University",
  "Savitribai Phule Pune University",
  "Birla Institute of Technology Mesra",
];

const dedupe = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const filtered = FALLBACK_COLLEGES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
    return NextResponse.json({ results: filtered, source: "fallback" });
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You return strict JSON only. Provide an array of up to 8 Indian college names that match the query.",
        },
        {
          role: "user",
          content: `Query: ${query}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    let parsed: unknown = [];
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = [];
        }
      }
    }
    const results = Array.isArray(parsed) ? parsed.filter(Boolean) : [];

    return NextResponse.json({ results: dedupe(results).slice(0, 8), source: "groq" });
  } catch (error) {
    const fallback = FALLBACK_COLLEGES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
    return NextResponse.json({ results: fallback, source: "fallback" });
  }
}
