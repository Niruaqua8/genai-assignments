
# StoryMind AI — Human Product Prompt Master Roadmap 🚀
> **For AI Trainers & Learners**: This document provides a step-by-step prompt roadmap to rebuild the entire **StoryMind AI — Jira User Story Reviewer** dashboard from scratch. Every prompt is written naturally from a human user's perspective, completely free of hardcoded file names, CSS classes, or complex technical jargon.

---

## 📌 How to Use This Roadmap
1. Follow each **Phase** sequentially from 1 to 6.
2. Copy the natural prompt inside **"📋 Copy-Paste Prompt for AI Assistant"** and paste it directly into your AI coding tool.
3. Once the AI generates the code for that phase, run the simple **"🧪 User-Facing Verification Steps"** in your browser to confirm everything works before moving to the next phase.
4. **Simple & Natural** — No technical code experience needed! The AI handles all file creation, folder structures, styling, and coding logic behind the scenes.

---

## Phase 1: Creating the Application & Visual Design System

### 🎯 Phase Goal
Build the initial visual layout and establish a futuristic dark navy space theme with ambient glowing background lights, custom typography, and a technical blueprint grid.

### 📋 Copy-Paste Prompt for AI Assistant
```text
Build the foundation for an AI Jira User Story Quality Reviewer dashboard called "StoryMind AI". 

Create a modern, futuristic dark space theme with a deep navy background, a subtle grid blueprint pattern overlay, and soft glowing ambient light orbs in electric cyan and deep blue floating gently in the background corners. Use clean typography with high-contrast white text and custom glowing cyan scrollbars.
```

### 🧪 User-Facing Verification Steps
* [ ] Open the application in a web browser.
* [ ] **Theme Check**: Confirm the screen displays a deep navy space background with subtle grid lines.
* [ ] **Animation Check**: Observe soft glowing cyan and blue light spots slowly floating around the background corners.

---

## Phase 2: Building the Sticky Header & Navigation Bar

### 🎯 Phase Goal
Add a top sticky glassmorphism navigation bar containing the glowing brand logo, menu links, live n8n connection indicator, and user profile badge.

### 📋 Copy-Paste Prompt for AI Assistant
```text
Add a sleek glassmorphic navigation bar pinned to the top of the dashboard.

Include the brand title "StoryMind AI" on the left with a glowing icon box containing a star logo that gently floats up and down.

In the middle, add navigation links for "Dashboard" (active state), "Jira Connection", "History", and "API Docs" with smooth hover highlights.

On the right, add an n8n connection status badge showing "n8n Connected" with a pulsing green light dot, and a circular user profile avatar with initials "PM". Give the navigation bar a translucent frosted glass look with a subtle bottom border.
```

### 🧪 User-Facing Verification Steps
* [ ] **Header Check**: Scroll the page and verify the navigation bar stays pinned to the top with a blurred glass effect.
* [ ] **Logo Check**: Confirm the star logo icon gently floats up and down.
* [ ] **Status Check**: Verify the "n8n Connected" badge features a glowing green dot that pulses continuously.
* [ ] **Hover Check**: Move your mouse over navigation links to see the pill highlight effects.

---

## Phase 3: Building the 2-Column Dashboard & Control Sidebar

### 🎯 Phase Goal
Construct a responsive two-column dashboard featuring a left input control card with module toggles and promo banner, plus top right metrics summary cards.

### 📋 Copy-Paste Prompt for AI Assistant
```text
Create a two-column dashboard layout with a control sidebar on the left and a main workspace on the right.

In the left sidebar, add a glass card titled "Jira Analyzer". Place an input field with a cube icon for typing a Jira story key (placeholder: "e.g. TES-1"), 3 pre-checked module option checkboxes (Clarity & Grammar, Acceptance Criteria, Technical Feasibility), and a full-width gradient "Review Story" button that shimmers on hover. Below this, add a card for upgrading to a Pro Plan.

At the top of the right workspace, add 3 metric summary cards showing "24 Stories Checked", "86% Avg Quality Score", and "Active Jira Sync Status" with distinct glowing blue, cyan, and mint green icons. Ensure the layout neatly stacks vertically on mobile screens.
```

### 🧪 User-Facing Verification Steps
* [ ] **Layout Check**: Verify the dashboard is split into a left sidebar card and a right workspace panel.
* [ ] **Input Check**: Click inside the "Jira Story Key" input box and check if it lights up with a glowing cyan outline.
* [ ] **Button Hover Check**: Move your mouse over the "Review Story" button and observe the light shimmer sweep animation.
* [ ] **Metrics Check**: Confirm the 3 top metric cards display cyan, blue, and green glowing icons with statistics.

---

## Phase 4: Designing the AI Review Workspace & Loading Effects

### 🎯 Phase Goal
Create the main review workspace card with a default waiting screen, rotating cyber spinner rings, a top-to-bottom laser scan beam, and error shake effects.

### 📋 Copy-Paste Prompt for AI Assistant
```text
In the right workspace panel, build a large glass card titled "Review Workspace" for displaying AI user story reviews.

By default, display a friendly waiting screen with concentric dashed cyber rings spinning around a pulsing radar icon, asking the user to enter a Jira key and click "Review Story".

Design a dynamic loading state for when an analysis is running: show a glowing cyan laser scan line moving top-to-bottom across the card and an animated status progress ticker. Also add a smooth horizontal shake animation for errors.
```

### 🧪 User-Facing Verification Steps
* [ ] **Waiting State Check**: Verify the review workspace card displays spinning concentric rings around a radar icon with friendly instructions.
* [ ] **Card Layout Check**: Verify the review workspace card has a clean glass border and ample space for displaying upcoming analysis results.

---

## Phase 5: Interactive Input Validation, Webhook Connection & Error Handling

### 🎯 Phase Goal
Add full interactivity to validate empty inputs, cycle progress status ticker messages every 1.5s, execute an asynchronous POST request to the n8n webhook `/webhook/userstory_reviewer`, and handle connection errors gracefully.

### 📋 Copy-Paste Prompt for AI Assistant
```text
Make the dashboard fully interactive and connect it to an n8n AI webhook endpoint at /webhook/userstory_reviewer.

When a user submits a Jira story key (by clicking "Review Story" or pressing Enter):
1. If the input field is empty, highlight the input box in red, shake the review card, and display a helpful error message asking for a story key.
2. If a story key is entered (e.g. "TES-1"), disable the input field and button, change button text to "Analyzing...", and activate the laser scanning beam.
3. Cycle through realistic progress status messages ("Reading story key...", "Contacting Jira API...", "Evaluating description clarity...", "Synthesizing recommendations...") every 1.5 seconds so the user knows analysis is happening.
4. Send a POST request to /webhook/userstory_reviewer sending the JSON payload with the story key.
5. Ensure rock-solid error handling: if the server is unreachable or returns an error, show a clear error card explaining the connection failure instead of breaking the page. Unpack any response format flexibly whether returned as plain text, JSON object, or nested array.
```

### 🧪 User-Facing Verification Steps
* [ ] **Validation Test**: Click "Review Story" with an empty input box.
  - Verify the input box highlights red with a warning icon.
  - Verify a helpful message appears asking for a valid story key.
  - Verify the card performs a brief horizontal shake animation.
* [ ] **Interactive Search Test**: Type "TES-1" into the input box and press Enter.
  - Verify the input box locks and button text changes to "Analyzing...".
  - Verify the status text updates every 1.5 seconds ("Reading story key...", "Contacting Jira API...", etc.).
  - Verify the cyan laser scan beam animates vertically across the workspace card.
* [ ] **Network Dispatch Check**: Open Browser Developer Tools -> Network tab and submit key "TES-1". Verify a `POST` request is sent to `/webhook/userstory_reviewer`.

---

## Phase 6: Automatic Formatting of AI Analysis & Results Display

### 🎯 Phase Goal
Parse raw markdown responses automatically into clean HTML headings, bold text, lists, code boxes, and styled tables, completing the analysis with a pop-up "Analysis Complete" badge.

### 📋 Copy-Paste Prompt for AI Assistant
```text
Add automatic markdown formatting to render the AI review analysis beautifully inside the workspace without any external libraries.

Convert raw markdown response text into clean, structured HTML:
- Format section headings with glowing cyan and blue titles.
- Format bold text and bullet lists neatly.
- Display code blocks inside dark monospace boxes with electric cyan text.
- Render markdown tables (| Col 1 | Col 2 |) as styled HTML tables with cyan header backgrounds and alternating row colors.

When the analysis completes, pop up an animated green "Analysis Complete" badge in the top right header, reveal the formatted report with a smooth fade-in animation, and re-enable the input form for another search.
```

### 🧪 User-Facing Verification Steps
* [ ] **Completion Badge Check**: When analysis finishes, verify an "ANALYSIS COMPLETE" green badge pops into the workspace header.
* [ ] **Formatting Check**: Verify section headings, bold text, bullet points, code snippets, and tables render with clean formatting and cyan highlights.
* [ ] **Reset Check**: Verify the input field and submit button unlock, ready for you to enter another Jira story key.
* [ ] **End-to-End Test**: Enter key "TES-2", click "Review Story", watch the progress ticker & laser scan, and view the formatted AI quality report!

---

## 🎨 Summary of Architecture & Technologies Used
- **Frontend Core**: HTML5, Modern JavaScript (Async/Await, Fetch API, DOM manipulation, Regex Markdown Engine).
- **Design System**: Pure CSS3 Glassmorphism (CSS Variables, Flexbox, Grid, Backdrop Filters, Keyframe Animations, Responsive Design).
- **External Typography**: Google Fonts (`Outfit`, `Inter`, `JetBrains Mono`). Zero third-party JS libraries required!
- **Backend Integration**: REST Webhook Endpoint (`POST /webhook/userstory_reviewer`) transmitting JSON payloads to n8n / AI workflows.
