// test/seed-data.js
// Directly seeds realistic sample feedback and verified insights into Supabase
// for demo, judging, and testing purposes without requiring Claude API credits.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Load credentials from .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
for (const rawLine of envContent.split("\n")) {
  const line = rawLine.replace(/\r/g, "").trim();
  if (!line || line.startsWith("#")) continue;
  const eqIdx = line.indexOf("=");
  if (eqIdx !== -1) {
    const key = line.substring(0, eqIdx).trim();
    let val = line.substring(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding realistic sample data into Supabase...\n");

  const sampleItems = [
    {
      audience_type: "university students",
      text: "The Wi-Fi in the Science Library disconnects every 5 minutes during peak study hours. It makes online exams terrifying.",
      insight: {
        theme: "Slow Wi-Fi",
        category: "infrastructure",
        type: "complaint",
        sentiment: "negative",
        urgency: 4,
        who_affected: "students during peak study hours",
        evidence_quote: "disconnects every 5 minutes during peak study hours",
      },
    },
    {
      audience_type: "university students",
      text: "The library internet keeps dropping constantly while we try to submit assignments.",
      insight: {
        theme: "Slow Wi-Fi",
        category: "infrastructure",
        type: "complaint",
        sentiment: "negative",
        urgency: 4,
        who_affected: "students submitting assignments",
        evidence_quote: "internet keeps dropping constantly",
      },
    },
    {
      audience_type: "university students",
      text: "The campus shuttle is always 20 minutes late on rainy days, leaving freshmen stranded in the cold.",
      insight: {
        theme: "Late Campus Shuttle",
        category: "services",
        type: "complaint",
        sentiment: "negative",
        urgency: 3,
        who_affected: "freshmen",
        evidence_quote: "always 20 minutes late on rainy days",
      },
    },
    {
      audience_type: "university students",
      text: "Could we please add more vegan and gluten-free lunch options in the main dining hall?",
      insight: {
        theme: "Dietary Options",
        category: "services",
        type: "suggestion",
        sentiment: "neutral",
        urgency: 2,
        who_affected: "students with dietary restrictions",
        evidence_quote: "more vegan and gluten-free lunch options",
      },
    },
    {
      audience_type: "university students",
      text: "I really love the new 24/7 quiet study pods on the 3rd floor, they are a lifesaver!",
      insight: {
        theme: "24/7 Study Pods",
        category: "infrastructure",
        type: "praise",
        sentiment: "positive",
        urgency: 1,
        who_affected: "unspecified",
        evidence_quote: "new 24/7 quiet study pods on the 3rd floor, they are a lifesaver",
      },
    },
  ];

  // Helper for quote verification
  function isQuoteVerified(quote, fullText) {
    const q = quote.toLowerCase().replace(/\s+/g, " ").trim();
    const t = fullText.toLowerCase().replace(/\s+/g, " ").trim();
    return q.length > 0 && t.includes(q);
  }

  // 1. Insert feedback rows
  const feedbackRows = sampleItems.map((s) => ({
    audience_type: s.audience_type,
    text: s.text,
  }));

  const { data: insertedFeedback, error: fbError } = await supabase
    .from("feedback")
    .insert(feedbackRows)
    .select("id, text");

  if (fbError) {
    console.error("Failed to insert feedback:", fbError.message);
    return;
  }

  console.log(` Inserted ${insertedFeedback.length} feedback items into 'feedback' table.`);

  // 2. Insert insight rows linked by feedback_id
  const insightRows = insertedFeedback.map((fb, idx) => {
    const sample = sampleItems[idx];
    const verified = isQuoteVerified(sample.insight.evidence_quote, fb.text);
    return {
      feedback_id: fb.id,
      theme: sample.insight.theme,
      category: sample.insight.category,
      type: sample.insight.type,
      sentiment: sample.insight.sentiment,
      urgency: sample.insight.urgency,
      who_affected: sample.insight.who_affected,
      evidence_quote: sample.insight.evidence_quote,
      quote_verified: verified,
    };
  });

  const { data: insertedInsights, error: insError } = await supabase
    .from("insights")
    .insert(insightRows)
    .select();

  if (insError) {
    console.error("Failed to insert insights:", insError.message);
    return;
  }

  console.log(` Inserted ${insertedInsights.length} structured insights into 'insights' table.`);
  console.log("\n Seed completed successfully!");
  console.log("👉 Now open or refresh: http://localhost:3000/api/opportunities in your browser!");
}

seed();
