# Ekonex — MVP Sprint-by-Sprint Backlog

A 6‑sprint roadmap designed to deliver the MVP of the Ekonex LMS.
Each sprint includes: Goals, User Stories, Tasks, Deliverables, and Acceptance Criteria.

---

# 🌟 Overview of MVP Scope
The MVP includes:
- Authentication & Profiles
- Course Catalog & Enrollment
- Lesson Delivery (Video + Text)
- Basic Quiz Engine
- AI Assistant (RAG-lite)
- Instructor Portal (Basic Upload)
- Notifications (Email + In-App)
- Offline-ready PWA (basic caching)

---

# 🟦 Sprint 1 — Foundations & Authentication 
## 🎯 Goals
- Set up development environments, repositories, CI/CD.
- Implement authentication, user profile, and roles.
- Build tenant structure (single-tenant for MVP).

## 📌 User Stories
- As a user, I can create an account.
- As a user, I can log in and log out.
- As a user, I can update my profile.
- As an admin, I can assign roles (instructor, student).

## 🛠️ Tasks
- Initialize backend repo (NestJS/FastAPI).
- Initialize frontend (React PWA).
- Design DB schema (Users, Roles, Tenants).
- Implement JWT auth + refresh tokens.
- Build Profile UI.
- Add CI pipeline & deployment workflows.

## 📦 Deliverables
- Auth service running in dev & staging.
- Working signup/login/logout.
- Profile management.
- CI/CD pipelines.

## ✅ Acceptance Criteria
- A user can sign up, verify email (optional), and log in.
- Protected routes work.
- Profile updates persist.

---

# 🟧 Sprint 2 — Course Catalog + Enrollment
## 🎯 Goals
- Create course management backend.
- Build learner catalog and enrollment logic.

## 📌 User Stories
- As a learner, I can browse available courses.
- As a learner, I can search and filter courses.
- As a learner, I can enroll in a course.
- As an instructor, I can create/update courses.

## 🛠️ Tasks
- Build Course service (CRUD).
- Define Course, Module, Lesson schemas.
- Build catalog listing UI.
- Implement enrollment flows.
- Admin/instructor course management dashboard.

## 📦 Deliverables
- Course catalog API + UI.
- Enrollment working end-to-end.

## ✅ Acceptance Criteria
- A learner can enroll and see "My courses".
- Instructors can publish courses with modules.

---

# 🟩 Sprint 3 — Content Delivery (Video + Text)
## 🎯 Goals
- Integrate video and text lesson delivery.
- Enable content upload via instructor portal.

## 📌 User Stories
- As a learner, I can watch lesson videos.
- As a learner, I can read text-based lessons.
- As an instructor, I can upload lesson content.

## 🛠️ Tasks
- Connect to S3-compatible storage.
- Video upload + transcoding pipeline (use Mux or internal job).
- Build lesson viewer UI.
- Add content editor for text lessons.

## 📦 Deliverables
- Fully functional lesson pages.
- Video streaming capability.
- Instructor upload features.

## ✅ Acceptance Criteria
- Lessons load quickly and reliably.
- Adaptive video (multiple resolutions) available.

---

# 🟥 Sprint 4 — Basic Quiz Engine + Assessment
## 🎯 Goals
- Implement quizzes and auto-grading.
- Allow instructors to create quizzes.

## 📌 User Stories
- As a learner, I can take quizzes.
- As a learner, I can view my scores.
- As an instructor, I can create quizzes with questions.

## 🛠️ Tasks
- Quiz service (multiple-choice first).
- Timed quizzes (optional).
- Quiz UI in lesson flow.
- Auto-grading backend.
- Store attempts and scores.

## 📦 Deliverables
- Quiz creation + learner quiz-taking workflow.

## ✅ Acceptance Criteria
- A learner completes a quiz and sees a grade.
- Instructor sees results.

---

# 🟪 Sprint 5 — AI Assistant (RAG-Lite)
## 🎯 Goals
- Integrate a minimal version of the AI tutor.
- Implement document embeddings and Q&A.

## 📌 User Stories
- As a learner, I can ask the AI assistant questions.
- As an instructor, I can enable AI for my course.

## 🛠️ Tasks
- Create embeddings for course text.
- Build RAG pipeline (top‑k retrieval + LLM API).
- Chat UI component.
- AI rate limits + safety filters.
- Store conversation history (basic).

## 📦 Deliverables
- Working AI chat inside course view.

## ✅ Acceptance Criteria
- AI answers questions using course content (no hallucinations).
- Response time < 5 seconds average.

---

# 🟫 Sprint 6 — PWA Offline Mode + Notifications
## 🎯 Goals
- Add offline-first capabilities.
- Implement notification system.

## 📌 User Stories
- As a learner, I can view downloaded lessons offline.
- As a learner, I can receive course alerts.
- As an instructor, I can notify learners.

## 🛠️ Tasks
- Service worker: cache lessons.
- Offline progress queue.
- Notification service setup.
- Email + in-app notifications.
- Push notifications (optional for MVP).

## 📦 Deliverables
- Offline-ready app.
- Notification engine.

## ✅ Acceptance Criteria
- Learner can load previously viewed lessons without internet.
- Notifications delivered reliably.

---

# ⭐ MVP Completion Criteria
- Students can sign up, enroll, consume content, take quizzes.
- Instructors can create courses and upload lessons.
- AI assistant works for course questions.
- Offline mode supports cached lessons.
- System is stable, monitored, and deployable.

---

# 🚀 Optional Sprint 7 — Polish & Launch Prep
- UI refinements
- Final QA + Load testing
- Documentation
- Deploy to production cluster

---


