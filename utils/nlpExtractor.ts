// Author: Sanket - NLP extraction for flight search using GPT-4o mini
// Extracts structured flight details from natural language user input

import OpenAI from "openai";

export interface ExtractedFlightDetails {
    from: string;           // Origin city/airport
    to: string;             // Destination city/airport
    date: string;           // YYYY-MM-DD format
    returnDate?: string;    // Optional return date
    passengers: number;     // Default: 1
    preferences: string[];  // ["cheap", "fast", "nonstop", etc.]
    cabinClass?: string;    // "economy" | "business" | "first"
}

/**
 * Extract flight search details from natural language
 * Converts user messages like "Find cheap flight Delhi to Mumbai tomorrow" 
 * into structured search parameters
 */
export async function extractFlightDetails(
    userMessage: string
): Promise<ExtractedFlightDetails> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY not configured");
    }

    const openai = new OpenAI({ apiKey });

    const prompt = buildExtractionPrompt(userMessage);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You extract flight search parameters from natural language. Always return valid JSON with all required fields.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.2,
            max_tokens: 500,
            response_format: { type: "json_object" },
        });

        const extracted = JSON.parse(response.choices[0].message.content || "{}");
        return normalizeExtractedData(extracted);
    } catch (error) {
        console.error("[NLP Extractor] Error:", error);
        // Return empty data if extraction fails
        return {
            from: "",
            to: "",
            date: new Date().toISOString().split("T")[0],
            passengers: 1,
            preferences: [],
        };
    }
}

/**
 * Build the extraction prompt with date context
 */
function buildExtractionPrompt(message: string): string {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Calculate common relative dates
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    return `Extract flight search details from this message: "${message}"

Current date: ${todayStr}
Tomorrow: ${tomorrowStr}
Next week (7 days): ${nextWeekStr}

Convert relative dates:
- "today" → ${todayStr}
- "tomorrow" → ${tomorrowStr}
- "next week" → ${nextWeekStr}
- "next month" → add 30 days to today
- Specific dates like "March 15" → convert to YYYY-MM-DD (use current year if not specified)

Extract preferences from keywords:
- "cheap", "budget", "affordable" → add "cheap"
- "fast", "quick", "shortest" → add "fast"
- "nonstop", "direct", "no stops" → add "nonstop"
- "business class" → cabinClass: "business"
- "first class" → cabinClass: "first"

Return JSON in this exact format:
{
  "from": "city or IATA code (e.g., Delhi or DEL)",
  "to": "city or IATA code (e.g., Mumbai or BOM)",
  "date": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "passengers": number (default 1),
  "preferences": ["cheap", "fast", "nonstop"],
  "cabinClass": "economy|business|first or null"
}

IMPORTANT: 
- If from/to are not clear, leave as empty string ""
- If no date is mentioned in the message, default to "${tomorrowStr}" (Tomorrow)
- passengers must be a number (default 1)
- preferences must be an array (can be empty)`;
}

/**
 * Normalize and validate extracted data
 */
function normalizeExtractedData(data: any): ExtractedFlightDetails {
    // Ensure date is valid
    let date = data.date || new Date().toISOString().split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        date = new Date().toISOString().split("T")[0];
    }

    return {
        from: (data.from || "").trim(),
        to: (data.to || "").trim(),
        date,
        returnDate: data.returnDate || undefined,
        passengers: typeof data.passengers === "number" && data.passengers > 0
            ? data.passengers
            : 1,
        preferences: Array.isArray(data.preferences) ? data.preferences : [],
        cabinClass: data.cabinClass || undefined,
    };
}

/**
 * Detect if a message is about flight search
 * Returns true if message contains flight-related keywords
 */
export function isFlightSearchIntent(message: string): boolean {
    const flightKeywords = [
        "flight", "flights", "fly", "flying", "plane", "ticket", "tickets",
        "airfare", "air travel", "book flight", "find flight", "search flight"
    ];

    const lowerMessage = message.toLowerCase();
    return flightKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Validate if extracted details are sufficient for search
 * Returns true if we have minimum required fields (from, to, date)
 */
export function hasRequiredFlightDetails(details: ExtractedFlightDetails): boolean {
    return Boolean(details.from && details.to && details.date);
}
