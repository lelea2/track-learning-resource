Build a polished Airtable-style “AI Learning Radar” web app.

The app helps a user organize daily technical learning from messy sources like blog posts, Medium links, Hacker News posts, DEV.to articles, and copied notes.

Use React, TypeScript, and Vite. Keep the app frontend-only with local state. Use clean component architecture and deterministic mock AI logic where real AI is not necessary.

Core goal:
Turn scattered learning links and public article suggestions into a structured, sortable study tracker.

Main user flow:
1. User chooses a learning focus:
   - React performance
   - Frontend system design
   - TypeScript
   - AI coding agents
   - Accessibility
   - Airtable-style data modeling

2. User can click “Fetch Suggestions”.
   Pull article suggestions from a public source such as:
   - Hacker News API top/best stories
   - DEV.to articles by tag
   - Medium RSS if simple enough

3. User can also paste article links or messy notes manually.

4. The app creates an editable Airtable-style table with columns:
   - Title
   - Source
   - URL
   - Topic
   - Difficulty
   - Priority
   - Status
   - Estimated Time
   - Interview Relevance
   - Key Takeaway
   - Next Action

5. User can:
   - Edit cells inline
   - Add a row
   - Delete a row
   - Sort by priority, topic, or estimated time
   - Filter by status or topic
   - Mark article as To Read, Reading, Summarized, Practiced, or Done

6. Add a “Generate Today’s Study Plan” panel.
   It should pick 3 items:
   - One high-priority article
   - One practical coding topic
   - One leadership/system-design topic

7. Add summary metrics:
   - Total articles
   - To Read count
   - Completed count
   - High-priority count
   - Estimated study time today

Design:
Make it clean, dense, and practical like an Airtable-inspired productivity tool. Avoid a marketing landing page. The first screen should be the usable app.

Architecture:
- Separate API fetching from UI.
- Separate table state logic from rendering.
- Create TypeScript types for ArticleItem, LearningRow, StudyStatus, StudyPlan, and LearningFocus.
- Add utility functions for filtering, sorting, topic inference, priority scoring, and study plan generation.
- Include graceful loading and error states.

Important:
This is for an Airtable interview assignment about building a workflow with an AI coding agent. Optimize for a working demo, clean code, and a clear walkthrough story.

After implementation, provide:
1. A short summary of what was built.
2. A walkthrough script for a 3-5 minute recording.
3. A list of tradeoffs and future improvements.