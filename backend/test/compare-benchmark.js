const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

function parseCsvLine(line) {
  // Simple CSV parser handling quotes
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function run() {
  const { data: dbFeedback, error } = await supabase.from('feedback').select('text');
  if (error) {
    console.error('Error fetching DB feedback:', error.message);
    return;
  }

  const existingSet = new Set(dbFeedback.map(f => f.text.toLowerCase().replace(/\s+/g, ' ').trim()));
  console.log(`Currently ${dbFeedback.length} items in DB.`);

  const csvContent = fs.readFileSync(path.resolve(__dirname, 'benchmark.csv'), 'utf8');
  const lines = csvContent.split('\n').filter(l => l.trim().length > 0).slice(1);

  let alreadyPresent = 0;
  let newItems = [];

  for (const rawLine of lines) {
    const parts = parseCsvLine(rawLine.trim());
    if (parts.length < 3) continue;
    const [id, audience, ...textParts] = parts;
    let text = textParts.join(',').replace(/^"|"$/g, '').trim();

    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (existingSet.has(normalized)) {
      alreadyPresent++;
    } else {
      newItems.push({ id, audience_type: audience, text });
    }
  }

  console.log(`Cross-check results:`);
  console.log(`- Total items in CSV: ${lines.length}`);
  console.log(`- Already present in DB: ${alreadyPresent}`);
  console.log(`- New items to process: ${newItems.length}`);
}

run();
