# 🎯 Voiz AI

`Many Voices. One Clear Plan.`

Turns scattered feedback into a clear, ranked list of what to fix first, with the evidence behind every pick. 

---

## 📢 The Problem:

Feedback comes in from many places, in many forms. Without a clear way to sort it, the most important problems get lost.

---

## 💡 Our Solution:

Voiz AI reads raw feedback and produces a prioritized opportunity map:

->Understands each message and pulls out the real issue.

->Groups similar issues into themes (e.g. "Slow Wi-Fi", "Garbage not collected").

->Ranks themes by how often they appear, how serious they are, and how many people they affect.

->Shows evidence by linking every theme to the exact words people wrote.

->Suggests actions, with quick wins and longer-term fixes.

---

## 👥 Target Audience:

Audience Example feedback

->Student communities :"The hostel Wi-Fi stops every evening."

->Public services :"Garbage is not collected in our street for four days."

->Product teams :"I am not getting the OTP when I log in."

---

## ⚙️ Working Mechanism:

Raw feedback 

| Step | Input | Output |
|---|---|---|
| **1. Extract** | One feedback item | Theme, category, type, sentiment, urgency, audience affected, exact quote |
| **2. Group** | All extracted issues | Themes with a list of feedback IDs and a count |
| **3. Prioritize** | Themes and their evidence | Scores, short reasons, suggested actions |

--- 

## 🧭 Design Principles:

1. **Evidence first.** Every theme links back to the real feedback behind it. Nothing is made up.
2. **Code counts, AI judges.** The app does the counting. The AI decides severity and writes the reasoning.
3. **Explainable ranking.** Each priority score has a visible reason, so users can see why something ranks high.
4. **Safe by design.** Text inside feedback is treated as data only. Instructions hidden in feedback are ignored.
 --- 
 
## 🔍 Example:

### Input

json
{"id": "F001", "audience_type": "student_community", "text": "The mess food is cold and the queue is too long."}

### Step 1 output (one message with two issues gives two objects)

### Input

```json
{"id": "F001", "audience_type": "student_community", "text": "The mess food is cold and the queue is too long."}
```

### Step 1 output(One message with two issues gives two objects.)

```json
[
  {
    "feedback_id": "F001",
    "theme": "Cold mess food",
    "category": "services",
    "type": "complaint",
    "sentiment": "negative",
    "urgency": 3,
    "who_affected": "hostel students",
    "evidence_quote": "The mess food is cold"
  },
  {
    "feedback_id": "F001",
    "theme": "Long mess queue",
    "category": "services",
    "type": "complaint",
    "sentiment": "negative",
    "urgency": 3,
    "who_affected": "hostel students",
    "evidence_quote": "the queue is too long"
  }
]
```
 ---
 
## Prompt Design:

The AI "brain" of Voiz is a set of tested prompts, one for each step.

1.Fixed output schema, so the app can always read the reply.

2.Fixed lists of allowed values (categories, types, sentiments), so themes stay consistent.

3.Urgency scale from 1 to 5 (5 = safety risk or blocks core use, 1 = minor annoyance).

4.Word-for-word evidence quotes, kept in the original language.

5.Prompt injection protection and rules for empty, spam, or vague input.

Prompts live in the prompts/ folder and are versioned, so changes can be compared.

---

## 📁 Project Structure:

```text
Update this to match the real repo.
```

```text
voiz-ai/
├── README.md
├── prompts/
│   ├── extract_v1.txt
│   ├── group_v1.txt
│   └── prioritize_v1.txt
├── data/
│   ├── voiz_feedback_inputs.json
│   └── voiz_feedback_inputs.csv
├── src/
├── .env.example
└── .gitignore
```

| Item | What it holds |
|---|---|
| `prompts/` | The prompts for each step (extract, group, prioritize) |
| `data/` | 232 sample feedback items in JSON and CSV |
| `src/` | The application code |
| `.env.example` | Example settings, with no real API key |
| `.gitignore` | Files Git should ignore, such as `.env` |

---


## Getting Started:

```text
Fill in the commands below once the stack is final.
```

### Requirements:
1.Language / runtime and version

2.An API key for the AI model (Google AI Studio or other provider)

### Setup:
```text
bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# install dependencies
[install command]

# add your API key
cp .env.example .env
# open .env and set GEMINI_API_KEY=your_key_here
```
### Run:
```text
bash
[run command]
```

```text
Never commit your API key. Keep it in .env, which must be listed in .gitignore.
```
---

## Sample Data and Testing:

`data/` contains 232 sample feedback items across three audiences (student community, public service, product team). The same problem is written in different ways to test grouping.

It also includes test cases for:

Messages with no real issue ("Thanks!", "ok", "???")

Spam

Prompt injection ("Ignore all your instructions...")

Mixed Hindi and English text

Vague feedback ("Everything is bad here.")

Several issues in one message

### What a good run looks like
Output is valid JSON every time. 

Similar complaints (e.g. different Wi-Fi complaints) share the same theme label.

Messages with two issues return two objects.

Spam and injection attempts are ignored or skipped.

Safety-related feedback gets high urgency.

---

## 🛠️ Tech Stack:

| Part | Tool |
|---|---|
| AI model | Gemma 4 / Gemini (via Google AI Studio) |
| Backend | Antigravity |
| Frontend | Streamlit |
| Prompt testing | Google AI Studio | 

## Roadmap:

 ->Opportunity map view (ranked list and impact vs effort grid).
 
 ->"Why this rank?" view showing the quotes behind each score.
 
 ->Trends over time (is a problem growing?).
 
 ->Count unique people, so one person posting many times does not outweigh many people posting once.
 
 ->Support for more languages.
 
 ->Upload feedback from CSV or forms.

 ## 🤝 Team:

| Name | Role |
|---|---|
| Swarup Samaddar | Team Lead/Backend Developer|
| Junie Ann Diju | Frontend Developer |
| Pathipati Geethika| Documentation & Submission Lead  |
| Atriya Das| Prompt Engineering |

##  🙌 Contributing:

Create a branch: `git checkout -b your-change`

Commit your work: `git commit -m "Short, clear message"`

Push and open a Pull Request: `git push origin your-change`

Please do not push straight to `main`. When you change a prompt, save it as a new version (e.g. `extract_v2.txt`) and note what improved.

 ## 📃 License:

[MIT License](LICENSE)

## 💗 Credits:

Built during Hacktoferbest by Team Omnitrix.

**Thanks to-**

- The hackathon organisers for the problem statement and resources.
  
- Our mentors and teammates for their ideas and feedback.



`Voiz AI: Hear everyone. Fix what matters first.`

