// test/seed-200.js
// Generates and seeds a full 150-item dataset into Supabase across 8 recurring themes.
// Perfect for stress-testing and demonstrating the opportunity map to judges.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const themesData = [
  {
    theme: "Course Registration Crashes",
    category: "usability",
    type: "complaint",
    sentiment: "negative",
    urgency: 5,
    who: "seniors trying to graduate",
    templates: [
      "The portal crashed at 8 AM sharp during senior registration. I got locked out of two mandatory courses required for graduation.",
      "Registration website threw 504 Gateway Timeout errors for 45 minutes straight. We need a modern queueing system.",
      "The degree portal crashed again during registration week. This happens literally every single semester without fail.",
      "Every time registration opens, the server goes down immediately. It is completely unacceptable for a tier-1 university.",
      "Registration website crashed and by the time it reloaded all CS core classes were filled up.",
    ],
  },
  {
    theme: "Slow Wi-Fi",
    category: "infrastructure",
    type: "complaint",
    sentiment: "negative",
    urgency: 4,
    who: "students in libraries and dorms",
    templates: [
      "The campus Wi-Fi in East Hall disconnects every 10 minutes. Streaming research lectures is practically impossible.",
      "Science library Wi-Fi dropped completely in the middle of our timed midterm exam today.",
      "Eduroam Wi-Fi speed is under 1 Mbps in the basement classrooms of the engineering building.",
      "Internet drops constantly in the dorms after 8 PM when everyone returns from classes.",
      "Wi-Fi signal in the student center cafeteria drops out constantly.",
    ],
  },
  {
    theme: "Parking Shortage",
    category: "services",
    type: "complaint",
    sentiment: "negative",
    urgency: 4,
    who: "commuter students",
    templates: [
      "Commuter lot B was completely full by 8:30 AM today. I circled for 40 minutes and was late to my biology lab.",
      "Paying $400 for a semester parking pass when there are zero available spots is daylight robbery.",
      "Parking enforcement handed out tickets during midterms when students were forced to park on the gravel shoulder.",
      "We desperately need another parking garage near the north academic quadrant.",
      "There are simply not enough parking spots for commuters arriving after 9 AM.",
    ],
  },
  {
    theme: "Dorm Heating Failure",
    category: "safety",
    type: "complaint",
    sentiment: "negative",
    urgency: 5,
    who: "freshmen dorm residents",
    templates: [
      "The radiator in Maple Hall room 304 has been clanking loudly and blowing freezing air all weekend.",
      "No hot water in South Tower for three days in a row. It is 35 degrees outside.",
      "The dorm heating shut off during the snowstorm and maintenance took 18 hours to respond.",
      "Rooms on the 4th floor of freshman dorms are freezing cold at night.",
    ],
  },
  {
    theme: "Mental Health Support",
    category: "services",
    type: "suggestion",
    sentiment: "negative",
    urgency: 4,
    who: "undergraduate students",
    templates: [
      "The student counseling center has a six-week waiting list for non-crisis appointments. We need more licensed therapists.",
      "Please offer evening counseling hours or virtual telehealth sessions for students who work part-time.",
      "Wait times for therapy intake are way too long during midterms and finals.",
      "Could the university partner with an online mental health provider to handle overflow?",
    ],
  },
  {
    theme: "Dietary Options",
    category: "services",
    type: "suggestion",
    sentiment: "neutral",
    urgency: 2,
    who: "students with dietary restrictions",
    templates: [
      "Please label allergens clearly on the daily hot food station in the commons.",
      "Could we have more vegan and halal protein options in the dining hall instead of just salad?",
      "The gluten-free bread section in the cafeteria runs out of stock before 1 PM every weekday.",
      "Adding nutritional and calorie counts above the serving line would help students track their meals.",
    ],
  },
  {
    theme: "24/7 Study Pods",
    category: "infrastructure",
    type: "praise",
    sentiment: "positive",
    urgency: 1,
    who: "unspecified",
    templates: [
      "The new soundproof study pods on the 3rd floor are phenomenal! Perfect for zoom interviews.",
      "Huge shoutout to whoever approved the 24-hour study pods in the science complex.",
      "The study pods are super comfortable and great for late-night focus sessions.",
      "Loving the quiet study booths in the learning commons, they are always clean and well maintained.",
    ],
  },
  {
    theme: "Helpful Math TAs",
    category: "academics",
    type: "praise",
    sentiment: "positive",
    urgency: 1,
    who: "calculus students",
    templates: [
      "The Math 101 teaching assistants in the tutoring lab were exceptionally patient and helpful this week.",
      "Professor Miller's walk-in office hours saved my calculus grade, best instructor on campus!",
      "The peer tutoring sessions in the math department make complex concepts so much easier to understand.",
    ],
  },
];

async function seed150() {
  console.log("Generating 150 realistic feedback items across 8 recurring themes...\n");

  const feedbackRows = [];
  const insightTemplates = [];

  // Generate 150 items by cycling and varying templates
  let count = 0;
  while (count < 150) {
    for (const group of themesData) {
      if (count >= 150) break;
      const template = group.templates[count % group.templates.length];
      const variation = count >= 30 ? ` (#${count + 1})` : "";
      const text = `${template}${variation}`;

      // Extract a representative quote (first 4-6 words)
      const quote = template.split(/\s+/).slice(0, 5).join(" ");

      feedbackRows.push({
        audience_type: "university students",
        text,
      });

      insightTemplates.push({
        theme: group.theme,
        category: group.category,
        type: group.type,
        sentiment: group.sentiment,
        urgency: group.urgency,
        who_affected: group.who,
        evidence_quote: quote,
      });

      count++;
    }
  }

  console.log(`Inserting ${feedbackRows.length} raw feedback items into Supabase 'feedback' table...`);
  const { data: insertedFb, error: fbErr } = await supabase
    .from("feedback")
    .insert(feedbackRows)
    .select("id, text");

  if (fbErr) {
    console.error("Failed to insert feedback:", fbErr.message);
    return;
  }

  console.log(` Successfully inserted ${insertedFb.length} feedback items.`);

  const insightRows = insertedFb.map((fb, i) => {
    const meta = insightTemplates[i];
    return {
      feedback_id: fb.id,
      theme: meta.theme,
      category: meta.category,
      type: meta.type,
      sentiment: meta.sentiment,
      urgency: meta.urgency,
      who_affected: meta.who_affected,
      evidence_quote: meta.evidence_quote,
      quote_verified: true,
    };
  });

  console.log(`Inserting ${insightRows.length} insights into Supabase 'insights' table...`);
  const { data: insertedIns, error: insErr } = await supabase
    .from("insights")
    .insert(insightRows)
    .select("id");

  if (insErr) {
    console.error("Failed to insert insights:", insErr.message);
    return;
  }

  console.log(` Successfully inserted ${insertedIns.length} insights!`);
  console.log("\n All 150 items processed and seeded successfully!");
  console.log("👉 Refresh: http://localhost:3000/api/opportunities to see your full prioritized map!");
}

seed150();
