# Implementation Plan: English Flashcard App

## 1. Overview
A simple English learning web application with a NestJS backend and a ReactJS frontend.
- **Admin Side**: Management and statistics (Login required).
- **User Side**: Flashcard learning (No login required).

## 2. Tech Stack
- **Backend**: NestJS, TypeORM (Postgres/MySQL), JWT for Auth.
- **Frontend**: ReactJS (Vite), Redux Toolkit, SCSS (Mobile-First), Axios with Interceptors.

## 3. Backend Architecture (NestJS)
### Structure
- `src/common/`: Shared constants, decorators, filters, guards, interceptors, and utilities.
- `src/modules/`: Functional modules (Auth, Users, Flashcards, Stats).
- `src/config/`: Configuration files (DB, JWT, etc.).
- `src/database/`: Entities and migrations.

### Core Features
- **Modern CRUD**: Standardized API responses and error handling.
- **Auth**: Admin login via JWT.
- **Flashcard Management**: CRUD for words, meanings, examples, and images.
- **Statistics**: Basic data overview for the admin dashboard.

## 4. Frontend Architecture (ReactJS)
### Structure
- `src/assets/`: Static files (images, icons).
- `src/components/`: Design System (Buttons, Inputs, Cards, Modals).
- `src/features/`: Redux slices and logic for specific features (auth, flashcards, admin).
- `src/layouts/`: AdminLayout (sidebar/header) and PublicLayout.
- `src/styles/`: Global SCSS, variables, mixins.
- `src/store/`: Redux Toolkit store configuration.

- **Notebook UI**: Designed as a personal notebook where users can add and review vocabulary.
- **Design System**: Mobile-first components (Buttons, Inputs, Cards).
- **Service Layer**: Centralized `apiService` with Axios interceptors for auth and response normalization.
- **Smart Flashcards**: Interactive learning with mobile-friendly touch interactions.

## 5. Implementation Steps
### Phase 1: Foundation
- [ ] Initialize NestJS project in `backend/`.
- [ ] Initialize React (Vite) project in `frontend/`.
- [ ] Create `ai_instructions.md` for AI collaboration.

### Phase 2: Backend Development
- [ ] Setup Database connection & Common utilities.
- [ ] Implement Auth module (Login, Register for Admin).
- [ ] Implement Flashcard CRUD.
- [ ] Implement Stats API.

### Phase 3: Frontend Development
- [ ] Setup SCSS architecture & Design System components.
- [ ] Setup Redux Toolkit (Store, Thunks).
- [ ] Create Admin Dashboard (Login & Data Management).
- [ ] Create User Flashcard UI (Learning Interface).

### Phase 4: Integration & Polish
- [ ] API integration.
- [ ] Polish UI/UX (Animations, Responsiveness).
- [ ] Documentation.
