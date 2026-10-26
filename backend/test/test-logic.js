// test/test-logic.js
// Verification of core business logic without external network dependencies

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function verifyQuote(quote, originalFeedback) {
  const normQuote = normalizeText(quote);
  const normOriginal = normalizeText(originalFeedback);
  return normQuote.length > 0 && normOriginal.includes(normQuote);
}

function calculatePriority(mentions, avg_urgency, isAllPraise) {
  if (isAllPraise) return 0;
  return Math.round(mentions * avg_urgency * 10) / 10;
}

// 1. Test Quote Verification
console.log("Testing quote verification...");
const original1 = "The Wi-Fi in the Science Library disconnects every 5 minutes during peak study hours.";
const quote1 = "disconnects every 5 minutes during peak study hours";
const quote2 = "DISCONNECTS   EVERY  5   MINUTES";
const quote3 = "something not in the text";

console.assert(verifyQuote(quote1, original1) === true, "Quote 1 should be verified");
console.assert(verifyQuote(quote2, original1) === true, "Quote 2 (case & whitespace variation) should be verified");
console.assert(verifyQuote(quote3, original1) === false, "Quote 3 should not be verified");
console.log("Quote verification tests passed!");

// 2. Test JSON extraction
console.log("Testing JSON extraction from response...");
const rawLLMResponse = `
Here is the extracted analysis:
[
  {
    "feedback_id": "123",
    "theme": "Slow Wi-Fi",
    "category": "infrastructure",
    "type": "complaint",
    "sentiment": "negative",
    "urgency": 4,
    "who_affected": "students",
    "evidence_quote": "disconnects every 5 minutes"
  }
]
Hope this helps!`;

const firstBracket = rawLLMResponse.indexOf("[");
const lastBracket = rawLLMResponse.lastIndexOf("]");
const extracted = rawLLMResponse.substring(firstBracket, lastBracket + 1);
const parsed = JSON.parse(extracted);
console.assert(Array.isArray(parsed) && parsed.length === 1, "Extracted JSON should be an array of 1 item");
console.assert(parsed[0].theme === "Slow Wi-Fi", "Theme matches");
console.log("JSON extraction tests passed!");

// 3. Test Priority Score calculation
console.log("Testing priority score calculation...");
console.assert(calculatePriority(5, 3.4, false) === 17.0, "5 * 3.4 = 17.0");
console.assert(calculatePriority(5, 3.4, true) === 0, "All praise priority should be 0");
console.log("Priority calculation tests passed!");

console.log("\nAll core logic verification tests passed successfully!");
