# MLBB Tournament Platform Specification

## 1. Project Overview
A web-based platform for organizing and participating in Mobile Legends: Bang Bang (MLBB) tournaments. The platform supports various game modes (1v1, 2v2, 3v3, 5v5) and allows solo players to form or join teams. It features real-time chat and a dark-themed UI inspired by GameCentric.

## 2. Core Features

### 2.1 User Management
- **Authentication**: Sign up, Login, Logout (Email/Password or OAuth).
- **Profile**:
  - Username, Avatar.
  - MLBB In-Game ID (Server ID).
  - Rank/Role preferences.
  - Team affiliations.

### 2.2 Team System
- **Create Team**:
  - Team Name, Logo/Avatar.
  - Description.
  - Captain assignment.
- **Join Team**:
  - Browse available teams looking for members.
  - Request to join / Accept invitation.
- **Roster Management**:
  - Add/Remove members.
  - Assign roles (Captain, Member).

### 2.3 Tournament System
- **Modes**:
  - 1v1 (Solo).
  - 2v2, 3v3 (Small Team).
  - 5v5 Classic / Draft Pick (Full Team).
- **Format**:
  - Single Elimination / Double Elimination brackets.
  - Round Robin (optional).
- **Registration**:
  - Solo registration (for 1v1).
  - Team registration (for team modes).
- **Match Management**:
  - Match lobby generation.
  - Score reporting (screenshot upload or manual entry).
  - Dispute handling.

### 2.4 Real-time Communication
- **Chat**:
  - Global lobby chat.
  - Team chat (private).
  - Match lobby chat (between opponents).

### 2.5 UI/UX
- **Theme**: Dark mode, gaming aesthetic (Neon accents, dark backgrounds).
- **Dashboard**: Overview of active tournaments, upcoming matches.
- **Responsive Design**: Mobile-first approach.

## 3. Technology Stack
- **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes (Serverless functions).
- **Database**: PostgreSQL (via Neon).
- **ORM**: Prisma or Drizzle (TBD).
- **Authentication**: NextAuth.js (Auth.js) or Supabase Auth.
- **Real-time**: Pusher or Socket.io (for chat).
- **Deployment**: Vercel.

## 4. Database Schema (Draft)
- `User`: id, email, name, image, mlbb_id, rank.
- `Team`: id, name, logo, captain_id.
- `TeamMember`: team_id, user_id, role.
- `Tournament`: id, title, mode, format, status, start_date.
- `Match`: id, tournament_id, round, team_a_id, team_b_id, winner_id.
- `Message`: id, content, sender_id, room_id, created_at.

## 5. Directory Structure
```
/
├── components/        # Reusable UI components
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── (auth)/       # Authentication pages
│   ├── dashboard/    # User dashboard
│   ├── teams/        # Team management
│   └── tournaments/  # Tournament listing/details
├── lib/              # Utility functions, db clients
├── prisma/           # Database schema
└── public/           # Static assets
```
