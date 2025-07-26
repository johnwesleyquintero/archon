# Archon

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nebula-singularity/archon)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/VGyjSRXfzOE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Demo

🚀 [Live Demo](https://wesarchon.vercel.app)

![Archon Dashboard Preview](public/placeholder.jpg)

> Note: Add a screenshot or GIF of your application here to showcase its features.

## Overview

Archon is a modern, responsive dashboard application built with Next.js 14 (App Router), React Server Components, and Supabase. It provides a comprehensive solution for personal productivity and organization, featuring robust authentication, seamless data management, and a sleek, dark-themed user interface. Manage your tasks, track your goals, and organize your journal entries efficiently, all in one place.

## Features

- **Responsive Dashboard Layout**: Enjoy a sleek, dark-themed user interface that seamlessly adapts to various screen sizes, complete with a collapsible sidebar for enhanced navigation.
- **Robust User Authentication**: Securely sign up and sign in using Supabase Auth, supporting both email/password and Google OAuth. User profiles are automatically created upon registration.
- **Dynamic Task Management**: A comprehensive system for adding, completing, deleting, filtering, and sorting tasks. Includes a dedicated "Today's Tasks" widget with robust state management.
- **Strategic Goal Tracking**: Set and monitor your strategic goals with intuitive progress bars and status badges. Attach relevant documents directly to your goals for easy access.
- **Rich Journaling System**: Create and manage journal entries using a versatile rich text editor, supporting various templates and file attachments for comprehensive record-keeping.
- **Personalized User Settings**: Customize your experience by managing profile information, account settings, and appearance preferences, including avatar uploads and a convenient dark/light mode toggle.
- **Efficient File Uploads**: Seamlessly integrate and store files across journal entries, goals, and user avatars with efficient Vercel Blob storage.
- **AI-Powered Insights**: Leverage **GroqFast AI Inference** for rapid, low-latency AI responses, enabling intelligent features like smart suggestions, content generation, and conversational AI.
- **Reusable UI Components**: Utilize generic `LoadingSkeleton`, `EmptyState`, and `ErrorState` components to gracefully handle common UI scenarios, providing excellent user feedback and a consistent experience.
- **Modular & Maintainable Codebase**: The application is built with a modular architecture, breaking down components into smaller, reusable pieces with clear separation of concerns (e.g., custom hooks like `useTasks` for logic abstraction), ensuring high maintainability and scalability.

## Technologies Used

- **Next.js 14 (App Router)**: Utilizes the latest Next.js features for server-centric routing, React Server Components, and efficient API routes.
- **React**: Powers the interactive and dynamic user interfaces.
- **TypeScript**: Ensures type safety across the codebase, enhancing code quality and developer experience.
- **Supabase**: Provides a robust Backend-as-a-Service, handling authentication and serving as the PostgreSQL database.
- **Groq**: Integrated for ultra-fast AI inference, leveraging Language Processing Units (LPUs) for low-latency responses [^1].
- **AI SDK**: A powerful TypeScript toolkit designed for building AI-powered applications [^2].
- **Tailwind CSS**: Enables rapid and highly customizable UI development with a utility-first CSS framework.
- **shadcn/ui**: Offers a collection of beautifully designed, reusable UI components built on Radix UI and styled with Tailwind CSS.
- **Lucide React**: Provides a comprehensive and customizable set of open-source icons.
- **Vercel Blob**: Ensures efficient and scalable file storage for various application assets.
- **next-themes**: Facilitates easy integration and management of dark/light mode themes.

## Getting Started

Follow these steps to set up and run the Archon Dashboard locally.

### 1. Clone the Repository

```bash
git clone https://github.com/johnwesleyquintero/archon.git
cd archon
```

### 2. Install Dependencies

```bash
npm install

# or

yarn install
```

### 3. Set Up Supabase

1.  **Create a Supabase Project**: If you don't have one, sign up at [Supabase](https://supabase.com/) and create a new project.
2.  **Get API Keys**: Go to your Supabase project dashboard, navigate to `Project Settings > API`. Copy your `Project URL` and `anon public` key.
3.  **Configure Environment Variables**: Create a `.env.local` file in the root of your project and add the following:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # Optional: For server-side operations that require elevated permissions

    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

    # Vercel Blob Storage (if using file uploads)

    BLOB_READ_WRITE_TOKEN=YOUR_BLOB_READ_WRITE_TOKEN

    # Groq AI Inference

    GROQ_API_KEY=YOUR_GROQ_API_KEY
    ```

    Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, `YOUR_SUPABASE_SERVICE_ROLE_KEY`, `YOUR_BLOB_READ_WRITE_TOKEN`, and `YOUR_GROQ_API_KEY` with your actual credentials.

### 4. Run Database Migrations

The project includes a SQL script to set up the necessary tables and Row Level Security (RLS) policies in your Supabase database, including a trigger for automatic user profile creation.

1.  Go to your Supabase project dashboard.
2.  Navigate to `SQL Editor`.
3.  Open the `scripts/create-tables.sql` file from this repository.
4.  Copy the entire content of `create-tables.sql` and paste it into the Supabase SQL Editor.
5.  Run the query. This will create `profiles`, `tasks`, `goals`, and `journal_entries` tables, along with RLS policies and a trigger to automatically create a profile for new user sign-ups.

### 5. Run the Development Server

```bash
npm run dev

# or

yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development Workflow

1. **Branch Creation**: Create a new branch for each feature or bugfix

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Code Style**: The project uses ESLint and Prettier for code formatting

   ```bash
   # Run ESLint
   npm run lint

   # Format code with Prettier
   npm run format
   ```

3. **Type Checking**: Ensure TypeScript compilation succeeds

   ```bash
   npm run type-check
   ```

4. **Testing**: Run tests before submitting PR

   ```bash
   npm run test
   ```

5. **Commit Messages**: Follow conventional commits format
   ```bash
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   style: format code
   refactor: restructure code
   test: add tests
   chore: update dependencies
   ```

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your environment variables are correctly set
   - Ensure your IP is allowlisted in Supabase dashboard
   - Check if the database is accessible

2. **Build Errors**
   - Clear your `.next` cache: `rm -rf .next`
   - Ensure all dependencies are installed: `npm install`
   - Verify Node.js version matches the project requirements

3. **Authentication Problems**
   - Confirm Supabase authentication is properly configured
   - Check if the necessary auth providers are enabled
   - Verify redirect URLs are correctly set

4. **File Upload Issues**
   - Validate Vercel Blob storage configuration
   - Check file size limits
   - Verify proper CORS settings

For more detailed troubleshooting, please check our [Wiki](https://github.com/johnwesleyquintero/archon/wiki) or open an issue.

## Deployment

This project is designed to be easily deployed to [Vercel](https://vercel.com/).

1.  **Connect to Vercel**: If you haven't already, connect your Git repository (GitHub, GitLab, or Bitbucket) to Vercel.
2.  **Configure Environment Variables**: Ensure you add the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`, and `GROQ_API_KEY` environment variables to your Vercel project settings.
3.  **Deploy**: Vercel will automatically detect the Next.js project and deploy it.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).

````

```plaintext file="LICENSE"
MIT License

Copyright (c) 2025 John Wesley Quintero

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````
