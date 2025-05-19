# Blurr.so Technical Assessment

This repository contains a full-stack Next.js application built as a technical assessment for Blurr.so.

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js App Router with Server Actions
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js for Next.js)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tech-assessment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Application Structure

- `src/app` - Next.js App Router pages and API routes
- `src/components` - UI components
- `src/lib` - Utility functions
- `prisma` - Database schema and migrations

## Database Schema

The database includes the following models:
- User
- Account
- Session
- VerificationToken
