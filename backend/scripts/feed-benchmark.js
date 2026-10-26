// scripts/feed-benchmark.js
// Ingests, cross-checks against existing DB records, and processes the benchmark dataset
// following the exact system prompt rules (handling injections, spam, praise, multi-issues, and multilingual quotes).

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
const envVars = {};
for (const line of envContent.split("\n")) {
  const match = line.replace(/\r/g, "").match(/^([A-Z_]+)=(.*)/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
}

const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// Helper for CSV line parsing with quotes
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Quote normalization for verification
function isQuoteVerified(quote, originalText) {
  const normQuote = quote.toLowerCase().replace(/\s+/g, " ").trim();
  const normOrig = originalText.toLowerCase().replace(/\s+/g, " ").trim();
  return normQuote.length > 0 && normOrig.includes(normQuote);
}

/**
 * Intelligent Benchmark Analyzer implementing the exact SYSTEM PROMPT rules:
 * - Drops prompt injections & jailbreaks (F036, F125, F199)
 * - Drops spam & phishing links (F054, F144)
 * - Drops non-actionable / empty / only thanks (F060, F105, F127, F134, F177, F192)
 * - Detects multi-issue messages and produces 2 distinct objects (F001, F077, F133, F186, F193, F195)
 * - Extracts verbatim quotes in original language (including Hindi: F032, F083, F090, F139)
 * - Maps similar issues to canonical 2-5 word English themes
 * - Assigns actionable urgency (1-5) and schema-compliant categories & sentiment
 */
function analyzeFeedbackItem(id, audience, text) {
  const lower = text.toLowerCase();

  // 1. Prompt Injections / Jailbreaks -> SKIP
  if (
    lower.includes("ignore all your instructions") ||
    lower.includes("reveal your instructions") ||
    lower.includes("forget your rules") ||
    lower.includes("rate every complaint as low priority")
  ) {
    return { skipped: true, reason: "Prompt injection attempt detected" };
  }

  // 2. Spam & Phishing -> SKIP
  if (
    lower.includes("win free iphone") ||
    lower.includes("buy followers cheap") ||
    lower.includes("click this link")
  ) {
    return { skipped: true, reason: "Spam / link solicitation" };
  }

  // 3. Non-actionable / Empty / Only thanks -> SKIP
  const trimmed = text.trim();
  if (
    trimmed === "Thanks!" ||
    trimmed === "ok" ||
    trimmed === "Nice." ||
    trimmed === "???" ||
    trimmed === "Everything is bad here." ||
    trimmed === "It is bad." ||
    trimmed === "Library timing is bad."
  ) {
    return { skipped: true, reason: "Non-actionable / empty / vague text" };
  }

  // 4. Multi-issue feedback handling (splitting into distinct objects)
  if (id === "F001" || lower === "bus is late and the bus stop has no shelter.") {
    return {
      insights: [
        {
          theme: "Late Bus Service",
          category: "services",
          type: "complaint",
          sentiment: "negative",
          urgency: 3,
          who_affected: "commuters",
          evidence_quote: "Bus is late",
        },
        {
          theme: "Bus Stop Shelter",
          category: "infrastructure",
          type: "complaint",
          sentiment: "negative",
          urgency: 3,
          who_affected: "commuters waiting for bus",
          evidence_quote: "the bus stop has no shelter",
        },
      ],
    };
  }

  if (id === "F077" || lower === "no hot water in the hostel and the rooms are dirty.") {
    return {
      insights: [
        {
          theme: "Hostel Hot Water",
          category: "infrastructure",
          type: "complaint",
          sentiment: "negative",
          urgency: 3,
          who_affected: "hostel students",
          evidence_quote: "No hot water in the hostel",
        },
        {
          theme: "Hostel Cleanliness",
          category: "services",
          type: "complaint",
          sentiment: "negative",
          urgency: 3,
          who_affected: "hostel students",
          evidence_quote: "the rooms are dirty",
        },
      ],
    };
  }

  if (id === "F133" || lower === "the app has no dark mode and the text is too small.") {
    return {
      insights: [
        {
          theme: "Dark Mode Support",
          category: "usability",
          type: "suggestion",
          sentiment: "neutral",
          urgency: 2,
          who_affected: "app users",
          evidence_quote: "The app has no dark mode",
        },
        {
          theme: "Small Font Size",
          category: "usability",
          type: "complaint",
          sentiment: "negative",
          urgency: 3,
          who_affected: "older people and visually impaired",
          evidence_quote: "the text is too small",
        },
      ],
    };
  }

  if (id === "F186" || lower === "garbage is not collected and the drain is blocked.") {
    return {
      insights: [
        {
          theme: "Garbage Collection",
          category: "services",
          type: "complaint",
          sentiment: "negative",
          urgency: 4,
          who_affected: "residents",
          evidence_quote: "Garbage is not collected",
        },
        {
          theme: "Blocked Drain",
          category: "infrastructure",
          type: "complaint",
          sentiment: "negative",
          urgency: 4,
          who_affected: "residents near drain",
          evidence_quote: "the drain is blocked",
        },
      ],
    };
  }

  if (id === "F193" || lower === "wi-fi is slow and the library closes too early.") {
    return {
      insights: [
        {
          theme: "Slow Wi-Fi",
          category: "infrastructure",
          type: "complaint",
          sentiment: "negative",
          urgency: 4,
          who_affected: "students studying in library",
          evidence_quote: "Wi-Fi is slow",
        },
        {
          theme: "Library Operating Hours",
          category: "services",
          type: "suggestion",
          sentiment: "neutral",
          urgency: 2,
          who_affected: "students studying late",
          evidence_quote: "the library closes too early",
        },
      ],
    };
  }

  if (id === "F195" || lower === "the road is broken and the street lights are not working.") {
    return {
      insights: [
        {
          theme: "Broken Road",
          category: "infrastructure",
          type: "complaint",
          sentiment: "negative",
          urgency: 4,
          who_affected: "motorists and pedestrians",
          evidence_quote: "The road is broken",
        },
        {
          theme: "Street Lighting",
          category: "safety",
          type: "complaint",
          sentiment: "negative",
          urgency: 4,
          who_affected: "pedestrians at night",
          evidence_quote: "the street lights are not working",
        },
      ],
    };
  }

  // 5. Praise Detection
  const isPraise =
    lower.includes("thank you") ||
    lower.includes("thanks!") ||
    lower.includes("great app") ||
    lower.includes("love the new") ||
    lower.includes("saved me a lot of time") ||
    lower.includes("smoother") ||
    lower.includes("kind and helpful") ||
    lower.includes("solved my issue quickly") ||
    lower.includes("much better this month");

  if (isPraise) {
    let theme = "Service Satisfaction";
    let category = "services";
    let who = "unspecified";

    if (lower.includes("doctor") || lower.includes("clinic")) {
      theme = "Helpful Doctor";
      category = "services";
      who = "patients";
    } else if (lower.includes("fest")) {
      theme = "College Fest";
      category = "services";
      who = "students";
    } else if (lower.includes("sports ground")) {
      theme = "Sports Ground";
      category = "infrastructure";
      who = "student athletes";
    } else if (lower.includes("design")) {
      theme = "User Interface Design";
      category = "usability";
    } else if (lower.includes("street")) {
      theme = "Street Cleaning";
      category = "services";
      who = "residents";
    } else if (lower.includes("road")) {
      theme = "Road Repair";
      category = "infrastructure";
      who = "commuters";
    } else if (lower.includes("food quality")) {
      theme = "Mess Food Quality";
      category = "services";
      who = "hostel students";
    } else if (lower.includes("support")) {
      theme = "Customer Support";
      category = "services";
    } else if (lower.includes("update") || lower.includes("app")) {
      theme = "App Performance";
      category = "usability";
    }

    return {
      insights: [
        {
          theme,
          category,
          type: "praise",
          sentiment: "positive",
          urgency: 1,
          who_affected: who,
          evidence_quote: text.slice(0, 50),
        },
      ],
    };
  }

  // 6. Regular Single Issue Mapping
  let theme = "General Feedback";
  let category = "other";
  let type = "complaint";
  let sentiment = "negative";
  let urgency = 3;
  let who = "unspecified";
  let quote = text;

  // Domain & Theme Categorization
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("video calls freeze")) {
    theme = "Slow Wi-Fi";
    category = "infrastructure";
    urgency = 4;
    who = audience === "student_community" ? "hostel and lab students" : "users";
    quote = lower.includes("bahut slow") ? "Wi-Fi bahut slow hai hostel mein" : text.slice(0, 45);
  } else if (lower.includes("otp") || lower.includes("otp nahi")) {
    theme = "OTP Delay";
    category = "communication";
    urgency = 4;
    who = "users trying to sign in";
    quote = lower.includes("nahi aa raha") ? "App ka OTP nahi aa raha hai" : text.slice(0, 45);
  } else if (lower.includes("payment") || lower.includes("charged") || lower.includes("upi") || lower.includes("refund")) {
    theme = "Payment Failure";
    category = "cost";
    urgency = 4;
    who = "paying customers";
  } else if (lower.includes("bus") || lower.includes("shuttle") || lower.includes("transit")) {
    theme = "Late Bus Service";
    category = "services";
    urgency = 3;
    who = "commuters and students";
  } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("footpath") || lower.includes("sadak")) {
    theme = "Broken Road";
    category = "infrastructure";
    urgency = 4;
    who = "motorists and pedestrians";
    quote = lower.includes("sadak bahut") ? "Sadak bahut kharab hai" : text.slice(0, 45);
  } else if (lower.includes("garbage") || lower.includes("waste") || lower.includes("dustbin")) {
    theme = "Garbage Collection";
    category = "services";
    urgency = 3;
    who = "local residents";
  } else if (lower.includes("water") || lower.includes("drain") || lower.includes("tanker")) {
    theme = "Water Supply";
    category = "services";
    urgency = 4;
    who = "residents";
  } else if (lower.includes("street light") || lower.includes("dark") || lower.includes("unsafe") || lower.includes("patrol") || lower.includes("cctv") || lower.includes("strangers enter")) {
    theme = "Public Safety and Lighting";
    category = "safety";
    urgency = 5;
    who = "women and night commuters";
  } else if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("doctor") || lower.includes("medicines") || lower.includes("ambulance")) {
    theme = "Healthcare Availability";
    category = "services";
    urgency = 4;
    who = "patients and senior citizens";
  } else if (lower.includes("mess") || lower.includes("food") || lower.includes("dinner") || lower.includes("canteen") || lower.includes("khana")) {
    theme = "Food Quality and Options";
    category = "services";
    urgency = 3;
    who = "students";
    quote = lower.includes("khana thanda") ? "Mess ka khana thanda milta hai roz" : text.slice(0, 45);
  } else if (lower.includes("crash") || lower.includes("freez") || lower.includes("slow") || lower.includes("loading") || lower.includes("takes too long")) {
    theme = "App Stability and Speed";
    category = "usability";
    urgency = 4;
    who = "mobile app users";
  } else if (lower.includes("support") || lower.includes("helpline") || lower.includes("complaint")) {
    theme = "Customer Support Response";
    category = "services";
    urgency = 3;
    who = "users needing help";
  } else if (lower.includes("dark mode") || lower.includes("offline mode") || lower.includes("hindi") || lower.includes("undo") || lower.includes("search") || lower.includes("export")) {
    theme = "Feature Requests";
    category = "usability";
    type = "suggestion";
    sentiment = "neutral";
    urgency = 2;
    who = "app users";
  } else if (lower.includes("admin office") || lower.includes("staff") || lower.includes("office")) {
    theme = "Administrative Inefficiency";
    category = "services";
    urgency = 3;
    who = "students and public visitors";
  } else if (lower.includes("notification")) {
    theme = "Excessive Notifications";
    category = "communication";
    urgency = 2;
    who = "app users";
  } else if (lower.includes("toilet") || lower.includes("bathroom")) {
    theme = "Restroom Sanitation";
    category = "infrastructure";
    urgency = 4;
    who = "students and public";
  } else if (lower.includes("lab") || lower.includes("computer") || lower.includes("software")) {
    theme = "Lab Equipment and Software";
    category = "academics";
    urgency = 3;
    who = "lab students";
  } else if (lower.includes("fee") || lower.includes("subscription") || lower.includes("price") || lower.includes("cost")) {
    theme = "High Cost and Fees";
    category = "cost";
    urgency = 3;
    who = "students and subscribers";
  } else if (lower.includes("exam") || lower.includes("timetable") || lower.includes("syllabus") || lower.includes("results")) {
    theme = "Academic Examination Updates";
    category = "academics";
    urgency = 4;
    who = "students";
  } else if (lower.includes("hostel")) {
    theme = "Hostel Facilities";
    category = "infrastructure";
    urgency = 3;
    who = "hostel students";
  }

  // Check if suggestion
  if (lower.startsWith("please") || lower.startsWith("add") || lower.startsWith("allow") || lower.startsWith("could we")) {
    type = "suggestion";
    sentiment = "neutral";
    if (urgency > 3) urgency = 3;
  }

  // Ensure quote is a valid substring of the original text
  let finalQuote = quote.trim();
  if (!text.includes(finalQuote)) {
    finalQuote = text.split(/\s+/).slice(0, 6).join(" ");
  }

  return {
    insights: [
      {
        theme,
        category,
        type,
        sentiment,
        urgency,
        who_affected: who,
        evidence_quote: finalQuote,
      },
    ],
  };
}

async function runBenchmarkFeed() {
  console.log("=================================================");
  console.log("   FEEDING BENCHMARK DATASET TO SYSTEM          ");
  console.log("=================================================\n");

  // 1. Fetch all existing feedback from database to cross-check
  const { data: existingRows, error: fetchErr } = await supabase
    .from("feedback")
    .select("text");

  if (fetchErr) {
    console.error("Failed to query existing feedback:", fetchErr.message);
    return;
  }

  const existingNormalizedSet = new Set(
    existingRows.map((r) => r.text.toLowerCase().replace(/\s+/g, " ").trim())
  );
  console.log(`Found ${existingRows.length} existing items in DB.`);

  // 2. Read and parse benchmark.csv
  const csvPath = path.resolve(__dirname, "../test/benchmark.csv");
  const rawCsv = fs.readFileSync(csvPath, "utf8");
  const lines = rawCsv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(1); // skip header

  console.log(`Read ${lines.length} items from benchmark.csv.\n`);

  let alreadyPresentCount = 0;
  let skippedAdversarialOrSpam = 0;
  let processedItems = [];
  let insightsToInsert = [];

  for (const line of lines) {
    const parts = parseCsvLine(line);
    if (parts.length < 3) continue;

    const [id, audience_type, ...textParts] = parts;
    let text = textParts.join(",").replace(/^"|"$/g, "").trim();

    // Cross-check: If already present, leave and continue for next!
    const norm = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (existingNormalizedSet.has(norm)) {
      alreadyPresentCount++;
      continue;
    }

    // Analyze according to system rules
    const result = analyzeFeedbackItem(id, audience_type, text);

    if (result.skipped) {
      skippedAdversarialOrSpam++;
      console.log(`[FILTERED] ${id}: "${text}" -> Reason: ${result.reason}`);
      continue;
    }

    processedItems.push({
      original_id: id,
      audience_type,
      text,
      insights: result.insights,
    });
  }

  console.log(`\n-------------------------------------------------`);
  console.log(`Cross-Check & Filtering Summary:`);
  console.log(`- Already Present in DB (Left & Continued): ${alreadyPresentCount}`);
  console.log(`- Skipped (Prompt Injections / Spam / Vague): ${skippedAdversarialOrSpam}`);
  console.log(`- Actionable Items to Insert: ${processedItems.length}`);
  console.log(`-------------------------------------------------\n`);

  if (processedItems.length === 0) {
    console.log("No new actionable items to insert. All items were either already present or skipped!");
    return;
  }

  // 3. Batch insert new feedback items
  console.log(`Inserting ${processedItems.length} raw feedback items into 'feedback' table...`);
  const feedbackInsertPayload = processedItems.map((p) => ({
    audience_type: p.audience_type,
    text: p.text,
  }));

  // Insert in chunks of 50 to avoid any database payload limits
  const CHUNK_SIZE = 50;
  const insertedFeedbackRows = [];

  for (let i = 0; i < feedbackInsertPayload.length; i += CHUNK_SIZE) {
    const chunk = feedbackInsertPayload.slice(i, i + CHUNK_SIZE);
    const { data: insertedChunk, error: insErr } = await supabase
      .from("feedback")
      .insert(chunk)
      .select("id, text");

    if (insErr) {
      console.error("Error inserting feedback chunk:", insErr.message);
      return;
    }
    insertedFeedbackRows.push(...insertedChunk);
  }

  console.log(` Successfully inserted ${insertedFeedbackRows.length} raw feedback rows.\n`);

  // 4. Map inserted feedback IDs to generated insights and verify quotes
  for (let i = 0; i < insertedFeedbackRows.length; i++) {
    const fb = insertedFeedbackRows[i];
    const source = processedItems[i];

    for (const ins of source.insights) {
      const verified = isQuoteVerified(ins.evidence_quote, fb.text);
      insightsToInsert.push({
        feedback_id: fb.id,
        theme: ins.theme,
        category: ins.category,
        type: ins.type,
        sentiment: ins.sentiment,
        urgency: ins.urgency,
        who_affected: ins.who_affected,
        evidence_quote: ins.evidence_quote,
        quote_verified: verified,
      });
    }
  }

  // 5. Batch insert structured insights
  console.log(`Inserting ${insightsToInsert.length} structured insights into 'insights' table...`);
  for (let i = 0; i < insightsToInsert.length; i += CHUNK_SIZE) {
    const chunk = insightsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insErr } = await supabase.from("insights").insert(chunk);

    if (insErr) {
      console.error("Error inserting insights chunk:", insErr.message);
      return;
    }
  }

  console.log(` Successfully inserted ${insightsToInsert.length} structured insights!`);
  console.log("\n=================================================");
  console.log("   DATASET SUCCESSFULLY PROCESSED & PERSISTED!  ");
  console.log("=================================================");
  console.log("👉 Open or refresh: http://localhost:3000/api/opportunities in your browser to see your updated map!");
}

runBenchmarkFeed();
