# Campus Companion Implementation Plan & Architecture

Based on the analysis of the project repository, **Phase 1 (Authentication)** and **Phase 2 (Lost & Found)** have been primarily implemented. We currently have models, routes, and basic frontend scaffolding connecting these areas.

**The logical next step is Phase 3: AI Student Assistant.**

Below is the complete system architecture, database design, API design, folder structure, UI/UX, roadmap, advanced feature suggestions, and deployment strategy as requested.

## A. Complete System Architecture

### Frontend Architecture
- **Framework:** React.js utilizing Vite
- **State Management:** Context API for simple global states (e.g., Auth, Theme) and Redux Toolkit for complex states (e.g., AI Assistant cache, Marketplace items).
- **Styling:** Tailwind CSS for rapid scaling and responsive utility classes.
- **Routing:** React Router DOM (v6+).

### Backend Architecture
- **Environment:** Node.js + Express.js.
- **Authentication:** JWT (JSON Web Tokens) with robust refresh token logic.
- **RESTful API:** Modular monolithic approach, scaled progressively into microservices if needed. Include robust error handling and rate-limiting.

### Database Architecture
- **Primary Database:** MongoDB hosted on MongoDB Atlas.
- **ORM/ODM:** Mongoose for schema validation.
- **AI Vector Search:** MongoDB Atlas Vector Search utilizing `textEmbedding` inside the Lost & Found and AI modules for semantic search.

### Socket.IO Integration Flow
- **Event-Driven Architecture:**
  - Real-time matches for Lost & Found items.
  - Live chat functions in Study Groups and Marketplace.
  - Bi-directional AI agent typing streams.
  - Notifications for campus announcements.

### AI Integration Architecture
- **Model:** OpenAI API (e.g., `gpt-4o-mini` or `gpt-4o` for higher reasoning).
- **Feature Layer:** LangChain (or direct API interactions) for managing context memory in Study Assistants, Quiz generation routines, and summarization pipelines.

---

## B. Database Design

### Core MongoDB Collections

1. **Users** (*Existing*)
2. **LostAndFound** (*Existing with textEmbedding*)
3. **Claims** (*Existing*)
4. **StudyMaterials** (AI Assistant)
    - `studentId`, `title`, `contentUrl`, `summary`, `generatedQuizzes` (Array of objects)
5. **MarketplaceItems**
    - `sellerId`, `title`, `description`, `price`, `category`, `status`, `images`
6. **StudyGroups**
    - `name`, `description`, `members` (Array of User IDs), `events`
7. **Announcements**
    - `title`, `body`, `authorId`, `category`, `priorityLevel`

### Relationships & Indexing Strategy
- Heavy use of `ref` in Mongoose to link items to `User`.
- **Indexes:** 
  - Geo-indexing (`2dsphere`) on locations.
  - Vector indexing on `textEmbedding` fields for similarity searches.
  - Compound indexing on [(category, status)](file:///c:/Users/DELL/OneDrive/Desktop/project/CampusCompanion/client/src/App.jsx#13-53) for fast filtering in Marketplace.

---

## C. API Design Overview

### REST Endpoints (Examples)

**Auth (`/api/auth`)**
- `POST /register`, `POST /login`, `GET /me`

**Lost & Found (`/api/lost-found`)**
- `POST /`, `GET /`, `GET /:id`, `POST /matches`

**AI Assistant (`/api/ai-assistant`)**
- `POST /summarize` (Body: `{ text | fileUrl }`) -> Returns `{ summary: "..." }`
- `POST /chat` (Body: `{ message, contextId }`)
- `POST /generate-quiz` (Body: `{ topic, difficulty }`)

**Marketplace (`/api/marketplace`)**
- `POST /items`, `GET /items?category=books&sort=-price`

### Authentication Flow
- Client sends credentials -> Server validates against bcrypt hash -> Server issues `access_token` (15m expiry) & HttpOnly `refresh_token` (7d expiry) cookie. Client uses interceptors via Axios to attach tokens.

---

## D. Folder Structure

### Frontend Structure
```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/       # Reusable UI (Buttons, Modals, Navbars)
│   ├── context/          # React Context (AuthContext, ThemeContext)
│   ├── hooks/            # Custom Hooks (useSocket, useAuth)
│   ├── pages/            # View level components
│   ├── services/         # Axios configurations and API calls
│   ├── App.jsx
│   └── index.css         # Tailwind directives
```

### Backend Structure
```
server/
├── src/
│   ├── config/           # DB and Socket setup
│   ├── controllers/      # Route logic
│   ├── middlewares/      # Auth, Error Handling, File Uploads
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── services/         # AI integration, Cloudinary uploads
│   └── utils/            # Helper functions
├── index.js
└── .env
```

---

## E. UI/UX Design Goals

- **Modern Dashboard:** "Bento-grid" style layout to showcase notifications, recent study groups, and quick AI actions immediately upon login.
- **Mobile Responsiveness:** Bottom tab navigations for mobile users mirroring Instagram/Discord utility.
- **Dark/Light Mode:** First-class dark mode leveraging standard Tailwind `dark:` variants.
- **Aesthetic:** Modern, accessible gradients and glassmorphism elements to create a premium university portal experience.

---

## F. Development Roadmap

- [x] **Phase 1: Authentication** (Base done)
- [x] **Phase 2: Lost & Found** (Base done)
- **Phase 3: AI Assistant** (Next Step)
  - Integrating OpenAI.
  - Setting up chat UI and study document parsing.
- **Phase 4: Marketplace**
- **Phase 5: Study Groups**
- **Phase 6: Announcements**
- **Phase 7: Testing & Deployment**

---

## G. 15 Advanced Features to Elevate Campus Companion

1. **Auto-Scheduling Study Sessions:** AI looks at group members' timetables and automatically finds overlapping free time.
2. **"Flashcards" Tinder:** A Tinder-like swipe UI to study generated index cards quickly.
3. **Campus Navigation Maps:** Interactive maps detailing exact building locations, especially useful for new students and lost items.
4. **Peer Tutoring Platform:** Allow top students to monetize directly matching them with students struggling based on syllabus overlaps.
5. **Audio Note Transcription:** AI converts recorded professor lectures natively.
6. **Mental Health Check-in:** A passive daily mood tracker suggesting campus wellness resources.
7. **Used Textbook Barcode Scanner:** Scan a barcode via device camera to instantly list an item on the marketplace or fetch values.
8. **Carpooling Hub:** Connect students commuting from same regions.
9. **Event Ticketing System:** Directly purchase or RSVP to campus parties/events with generated QR pass.
10. **Roommate Matchmaker:** Algorithm matching based on cleanliness, sleep schedules, and study habits.
11. **Library Seat Availability:** Real-time checking if sections of the library are full (if hardware APIs let us, or crowdsourced).
12. **Alumni Mentorship Network:** Connect current students with grads from the same program.
13. **Anonymous Confessions/Spotted:** Moderated localized social feed mimicking YikYak/campus spotted pages.
14. **Food Delivery Pooling:** Combining UberEats/DoorDash orders for nearby dorms to save fees.
15. **Gamification & Leaderboards:** "Campus Points" rewarded for finding lost items, answering in study groups, or tutoring, allowing badging/achievements.

---

## H. Deployment Architecture

- **Frontend Hosting:** Vercel or Netlify (Zero-config React/Vite deployment, global CDN, automated branch previews).
- **Backend Hosting:** Render or Railway (Generous Node.js limits, easy WebSocket handling for Socket.io).
- **Database:** MongoDB Atlas (Serverless or Dedicated based on scale).
- **Environment Variables:** Secure secrets management for API keys, JWT Secrets, Mongo URIs, and Cloudinary keys.
- **CI/CD:** GitHub Actions to run ESLint, unit tests, and handle seamless deployments on `main` branch merges.

---

## Verification Plan
This plan documents the intended structures and concepts. Validation of work occurs through:
1. End-To-End verification of implementations per phase.
2. Confirming endpoints map directly to Database definitions and Frontend Hooks successfully consume endpoints via standard tests and browser interactions later.
