const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.replace(/\r/g, '').match(/^([A-Z_]+)=(.*)/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
}

async function test() {
  const anthropic = new Anthropic({ apiKey: envVars.ANTHROPIC_API_KEY });
  const model = envVars.ANTHROPIC_MODEL || "claude-sonnet-5-5";
  console.log("Testing Claude API with model:", model);
  try {
    const res = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // test standard model identifier as well
      max_tokens: 50,
      messages: [{ role: "user", content: "Reply with OK" }],
    });
    console.log("Claude API is ACTIVE! Response:", res.content[0].text);
    return true;
  } catch (err) {
    console.log("Claude API returned error:", err.message);
    return false;
  }
}

test();
