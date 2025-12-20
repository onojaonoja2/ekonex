# Ekonex - Next-Gen Learning Management System

Ekonex is a modern LMS built with functionalities for students, instructors, and ease of deployment.

## 🚀 Features
- **Course Management**: Instructor dashboard to create/edit courses, lessons, and quizzes.
- **Student Learning**: Rich content delivery (Video + Text), quizzes with auto-grading.
- **AI Assistant**: Context-aware RAG chat for students within lessons.
- **Offline Support**: PWA capabilities for learning on the go.
- **Authentication**: Secure role-based access (Instructor/Student) via Supabase.

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Global Variables
- **Database/Auth**: Supabase
- **Deployment**: Vercel (Recommended)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account

### Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

### Installation
```bash
npm install
# or
yarn install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment on Vercel
1.  Push your code to a Git repository (GitHub/GitLab).
2.  Import the project into Vercel.
3.  Add the **Environment Variables** listed above in the Vercel Project Settings.
4.  Deploy!

## 🤝 Contributing
1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
