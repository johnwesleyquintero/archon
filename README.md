# Archon Dashboard

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nebula-singularity/archon)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/VGyjSRXfzOE)

## Overview

Archon is a powerful, responsive dashboard application designed to help you manage your tasks, track your goals, and organize your journal entries. Built with Next.js 14 (App Router), React Server Components, and Supabase, it offers a modern, dark-themed user interface with robust authentication and data management capabilities.

## Features

-   **Responsive Dashboard Layout**: A sleek, dark-themed UI that adapts to various screen sizes, featuring a collapsible sidebar.
-   **User Authentication**: Secure sign-up and sign-in flows powered by Supabase Auth, including email/password and Google OAuth, with automatic user profile creation.
-   **Task Management**: A dynamic and scalable system to add, complete, delete, filter, and sort tasks. Features a dedicated "Today's Tasks" widget with robust state handling.
-   **Goal Tracking**: Set and monitor strategic goals with progress bars and status badges, including document attachments.
-   **Journaling System**: Create and manage journal entries using various templates and a rich text editor, with support for file attachments.
-   **User Settings**: Manage profile information, account settings, and appearance preferences, including avatar uploads and dark/light mode toggle.
-   **File Uploads**: Seamless integration with Vercel Blob for efficient file storage across journal entries, goals, and user avatars.
-   **AI-Powered Features**: Leverages **GroqFast AI Inference** for rapid, low-latency AI responses, enabling potential features like smart suggestions, content generation, or conversational AI.
-   **Reusable UI States**: Generic components for `LoadingSkeleton`, `EmptyState`, and `ErrorState` to handle common UI scenarios gracefully, providing excellent user feedback.
-   **Modular & Maintainable Code**: Components are broken down into smaller, reusable pieces with clear separation of concerns (e.g., `useTasks` hook for logic abstraction).

## Technologies Used

-   **Next.js 14 (App Router)**: For server-centric routing, React Server Components, and API routes.
-   **React**: Building interactive user interfaces.
-   **TypeScript**: For type safety and improved developer experience.
-   **Supabase**: Backend-as-a-Service for authentication and PostgreSQL database.
-   **Groq**: For ultra-fast AI inference with Language Processing Units (LPUs) [^1].
-   **AI SDK**: A TypeScript toolkit for building AI-powered applications [^2].
-   **Tailwind CSS**: For rapid and responsive UI development.
-   **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
-   **Lucide React**: For a comprehensive set of icons.
-   **Vercel Blob**: For efficient file storage.
-   **next-themes**: For easy dark/light mode integration.

## Getting Started

Follow these steps to set up and run the Archon Dashboard locally.

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/archon.git # Replace with your repo URL
cd archon-dashboard
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Set Up Supabase

1.  **Create a Supabase Project**: If you don't have one, sign up at [Supabase](https://supabase.com/) and create a new project.
2.  **Get API Keys**: Go to your Supabase project dashboard, navigate to `Project Settings > API`. Copy your `Project URL` and `anon public` key.
3.  **Configure Environment Variables**: Create a `.env.local` file in the root of your project and add the following:

    \`\`\`env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # Optional: For server-side operations that require elevated permissions
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    # Vercel Blob Storage (if using file uploads)
    BLOB_READ_WRITE_TOKEN=YOUR_BLOB_READ_WRITE_TOKEN
    # Groq AI Inference
    GROQ_API_KEY=YOUR_GROQ_API_KEY
    \`\`\`
    Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, `YOUR_SUPABASE_SERVICE_ROLE_KEY`, `YOUR_BLOB_READ_WRITE_TOKEN`, and `YOUR_GROQ_API_KEY` with your actual credentials.

### 4. Run Database Migrations

The project includes a SQL script to set up the necessary tables and Row Level Security (RLS) policies in your Supabase database, including a trigger for automatic user profile creation.

1.  Go to your Supabase project dashboard.
2.  Navigate to `SQL Editor`.
3.  Open the `scripts/create-tables.sql` file from this repository.
4.  Copy the entire content of `create-tables.sql` and paste it into the Supabase SQL Editor.
5.  Run the query. This will create `profiles`, `tasks`, `goals`, and `journal_entries` tables, along with RLS policies and a trigger to automatically create a profile for new user sign-ups.

### 5. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is designed to be easily deployed to [Vercel](https://vercel.com/).

1.  **Connect to Vercel**: If you haven't already, connect your Git repository (GitHub, GitLab, or Bitbucket) to Vercel.
2.  **Configure Environment Variables**: Ensure you add the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`, and `GROQ_API_KEY` environment variables to your Vercel project settings.
3.  **Deploy**: Vercel will automatically detect the Next.js project and deploy it.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
