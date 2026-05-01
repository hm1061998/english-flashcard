# AI Collaboration Guidelines: English Flashcard Project

As an AI assistant working on this project, please adhere to the following technical and architectural standards.

## 1. General Principles
- **Clarity & Clean Code**: Write readable, well-documented code.
- **Consistency**: Follow the existing folder structure and naming conventions.
- **Modern Standards**: Use the latest stable versions of frameworks and libraries.

## 2. Backend (NestJS)
- **Directory Structure**:
  - `src/common/`: Place reusable logic here (constants, utilities, filters).
  - `src/modules/`: Every feature must be a self-contained module.
- **API Standards**:
  - Use standard HTTP methods (GET, POST, PATCH, DELETE).
  - All responses should follow a consistent format (e.g., `{ success: boolean, data: any, message?: string }`).
  - Use DTOs for request validation.
- **Constants**: Centralize all static values in `src/common/constants/`.

## 3. Frontend (ReactJS)
- **Mobile-First**: Always design for mobile screens first using media queries for larger displays.
- **Notebook Aesthetic**: Maintain a "personal notebook" look (e.g., stacked paper effects, lined backgrounds).
- **No TailwindCSS**: Strictly use SCSS or LESS for styling.
- **System Design**:
  - Build reusable components in `src/components/`.
  - Use SCSS variables for colors, spacing, and typography.
- **Service Layer**: All API calls must go through `src/services/api.ts` to utilize the Axios interceptor.
- **State Management**: Use Redux Toolkit (RTK).
- **Directory Structure**:
  - Module-based organization in `src/features/`.
  - Layouts should be separated from page content.

## 4. UI/UX Standards
- **Aesthetics**: Aim for a "Premium" feel. Use smooth transitions (`transition: all 0.3s ease`).
- **Feedback**: Provide visual feedback for all user actions (loading states, success/error toasts).
- **Responsiveness**: Ensure the app works flawlessly on mobile, tablet, and desktop.

## 5. Development Workflow
- When adding a new feature:
  1. Create the backend DTOs and Entity.
  2. Implement the Service and Controller.
  3. Update the Frontend Redux slice and API service.
  4. Build the UI components and integrate.
