This project uses App Router, Next.js, and Tailwind CSS.

# Archon - Developer Guide

This document provides instructions and guidelines for developers contributing to the Archon project. For a general overview, features, and initial setup, please see `README.md`.

## 1. Coding Standards & Conventions

- **Linting & Formatting**: Run `npm run lint` to check for code quality issues and `npm run format` (if configured) to format the code. Please ensure all code passes the linter before creating a pull request.
- **Naming Conventions**:
  - **Components**: `PascalCase` (e.g., `TaskItem.tsx`).
  - **Files/Folders**: `kebab-case` (e.g., `todays-tasks/`).
  - **Variables/Functions**: `camelCase` (e.g., `fetchTasks`).
  - **Hooks**: `useCamelCase` (e.g., `useTasks.ts`).
- **TypeScript**:
  - Strive for strong type safety. Avoid `any` where possible.
  - Use utility types (`Partial`, `Omit`, etc.) to keep code DRY.
  - Define types for API responses and database tables in a central location (e.g., `lib/types.ts`).

## 2. Project Structure

A brief overview of the key directories:

- **`app/`**: Contains all routes, pages, and layouts, following the Next.js App Router conventions.
  - **`(auth)/`**: Routes for authentication (login, signup).
  - **`(dashboard)/`**: Protected routes for the main application dashboard.
  - **`api/`**: API routes for server-side logic.
- **`components/`**:
  - **`ui/`**: Components from `shadcn/ui`. Do not modify these directly. Use the `shadcn-ui` CLI to add new ones.
  - **`custom/` or `shared/`**: (Suggestion) Create a directory for custom, reusable components shared across the application.
- **`lib/`**: Shared utilities, helper functions, and client initializations.
  - `supabase.ts`: Supabase client instance.
  - `utils.ts`: General utility functions.
- **`hooks/`**: Custom React hooks that encapsulate business logic (e.g., `useTasks`, `useGoals`).

## 3. Working with the Backend (Supabase)

- **Database Migrations**: All schema changes should be scripted. Place new SQL scripts in the `scripts/` directory. See `scripts/create-tables.sql` for an example.
- **Data Access**:
  - Prefer Server Components or Server Actions for data fetching to keep client-side bundles small and improve security.
  - When fetching on the client, use the custom hooks (e.g., `useTasks`) which should handle loading, error, and empty states.
- **Row Level Security (RLS)**: RLS is enabled on all tables containing user data. Ensure all new tables have appropriate RLS policies.

## 4. State Management

- **Server State**: Managed by React Server Components and fetched via Supabase. Revalidation is handled by Next.js caching strategies (`revalidatePath`, `revalidateTag`).
- **Client State**:
  - For simple, local component state, use `useState`.
  - For complex state shared between components, use `useReducer` and/or React Context.
  - For cross-cutting client-side logic (like fetching/mutating tasks), use the provided custom hooks in `hooks/`.

## 5. UI & Theming

- **Adding Components**: To add a new component from `shadcn/ui`, use the CLI: `npx shadcn-ui@latest add [component-name]`.
- **Styling**: Use Tailwind CSS utility classes directly in your JSX. For complex, repeated styles, consider creating a custom component with `@apply` in a global CSS file if necessary, but prefer component composition.
- **Theming**: Dark/light mode is handled by `next-themes`. The toggle logic is in the user settings/header.

## 6. Special Features

### AI Integration (Groq & Vercel AI SDK)

- The project uses Groq for fast AI inference and the Vercel AI SDK for streamable UI responses.
- API keys are managed via `.env.local`.
- When adding new AI features, create a new server-side route or Server Action to handle the interaction with the Groq API.

### Error Handling

- The application is wrapped in a custom `ErrorBoundary` (`app/error-boundary.tsx`). This component provides a detailed error screen in development and a user-friendly message in production.
- For data fetching, always handle loading, error, and empty states gracefully. The reusable `LoadingSkeleton`, `EmptyState`, and `ErrorState` components should be used.

## 7. Git & Version Control

- **Branching**: Create a new branch for each new feature or bug fix (e.g., `feat/add-goal-editing`, `fix/task-sorting-bug`).
- **Pull Requests (PRs)**:
  - All work should be submitted via a PR to the `main` branch.
  - Provide a clear description of the changes in the PR.
  - Ensure all checks (linting, tests) pass before requesting a review.
