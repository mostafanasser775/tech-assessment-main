# Blurr.so Technical Assessment

This repository contains a full-stack Next.js application built as a technical assessment for Blurr.so. The application is a comprehensive project management system with employee management capabilities.

## Features

### Project Management
- Kanban board with drag-and-drop functionality for task management
- Task status tracking (Backlog, To Do, In Progress, Review, Done)
- Task priority levels (Low, Medium, High, Urgent)
- Task assignment to employees
- Project creation and management
- Real-time task status updates

### Employee Management
- Employee profile management
- Employee task tracking
- Salary management system
- Employee performance monitoring
- Task assignment and tracking per employee

### AI Integration
- AI-powered chatbot for project and task queries
- Natural language processing for task management
- Intelligent task recommendations

## Tech Stack

- **Frontend**: 
  - React with TypeScript
  - Tailwind CSS for styling
  - shadcn/ui components for UI elements
  - DND Kit for drag-and-drop functionality
  - Lucide icons for visual elements

- **Backend**: 
  - Next.js App Router with Server Actions
  - API Routes for data handling
  - Server-side rendering for improved performance

- **Database**: 
  - SQLite with Prisma ORM
  - Efficient data modeling and relationships

- **Authentication**: 
  - NextAuth.js (Auth.js for Next.js)
  - Secure session management
  - Protected routes and API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git for version control

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
   # Database Configuration
   DATABASE_URL="file:./dev.db"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # AI Integration (Optional)
   GROQ_API_KEY="your-groq-api-key-here"
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
  - `/dashboard` - Main application dashboard
  - `/dashboard/projects` - Project management
  - `/dashboard/employees` - Employee management
  - `/dashboard/chat` - AI chatbot interface
- `src/components` - Reusable UI components
  - `/dashboard/projects` - Project-related components
  - `/dashboard/employees` - Employee-related components
  - `/dashboard/chat` - Chat interface components
- `src/lib` - Utility functions and shared logic
- `prisma` - Database schema and migrations

## Database Schema

The database includes the following models:
- User - Authentication and user management
- Account - User account details
- Session - User session management
- VerificationToken - Email verification
- Project - Project management
- Task - Task tracking and management
- Employee - Employee information and management
- Salary - Employee salary records

## Features in Detail

### Kanban Board
- Drag-and-drop task management
- Real-time status updates
- Task priority visualization
- Employee assignment
- Task filtering and sorting

### Employee Management
- Employee profile creation and editing
- Task assignment tracking
- Salary management
- Performance monitoring
- Task history view

### AI Chatbot
- Natural language task queries
- Project status updates
- Task assignment suggestions
- Employee performance insights
- Intelligent task recommendations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
