const { getJson } = require("serpapi");
const fs = require('fs');
const path = require('path');

function getEnvValue(key) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) return null;
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

const SERPAPI_KEY = getEnvValue('SERPAPI_KEY');

if (!SERPAPI_KEY) {
    console.error("❌ SERPAPI_KEY is missing in .env.local");
    process.exit(1);
}

console.log("🔑 Using API Key:", SERPAPI_KEY.substring(0, 5) + "...");

async function testFlightSearch() {
    console.log("✈️ Testing Flight Search (Mumbai -> Delhi)...");

    // Use a date 2 days from now
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];

    try {
        const response = await getJson({
            engine: "google_flights",
            departure_id: "BOM",
            arrival_id: "DEL",
            outbound_date: dateStr,
            currency: "INR",
            hl: "en",
            adults: 1,
            api_key: SERPAPI_KEY,
            type: "2"
        });

        if (response.error) {
            console.error("❌ SerpAPI returned error:", response.error);
        } else if (!response.best_flights && !response.other_flights) {
            console.warn("⚠️ No flights found in response. Response keys:", Object.keys(response));
            if (response.search_metadata) {
                console.log("Metadata:", response.search_metadata);
            }
        } else {
            const flightCount = (response.best_flights?.length || 0) + (response.other_flights?.length || 0);
            console.log(`✅ Success! Found ${flightCount} flights.`);
            if (response.best_flights && response.best_flights.length > 0) {
                console.log("Example flight:", JSON.stringify(response.best_flights[0].flights[0], null, 2));
            }
        }

    } catch (error) {
        console.error("❌ Exception during search:", error.message);
    }
}

testFlightSearch();
