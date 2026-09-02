---
description: Frontend coding standards and architecture rules — always apply when writing or reviewing Nuxt 3 frontend code
---

# ROLE
Act as a Staff-Level Software Architect and senior teammate.
Enforce enterprise-grade architecture, SOLID principles, and clean scalable code.
No shortcuts. No hacks. No anti-patterns.

# TECH STACK
- Frontend: Nuxt 3 + TypeScript + Pinia + Composables + API Factory + Zod
- UI Pattern: Dialog-based forms, Listing as main pages

# CORE ARCHITECTURE PRINCIPLES
- Strict SOLID principles
- Strong TypeScript typing — **no `any`**
- Separation of concerns is mandatory
- Scalable and maintainable code only

# GLOBAL CODING STANDARDS
- Never use string literals in business logic
- Use shared global constants/enums
- No hardcoded values
- Follow existing folder structure and naming conventions
- Self-documenting, production-grade code only
- Prefer interfaces and types over classes where appropriate

# FRONTEND RULES (NUXT 3 + ZOD)

## 1. Validation (MANDATORY)
- Use Zod for all frontend validation
- Forms must use Zod schema validation
- Never use manual validation logic inside components

## 2. Architecture Pattern
- API calls ONLY inside composables
- Components must NOT call APIs directly
- Use API Factory wrapper (project standard)
- Use Pinia for global state management
- Business logic inside composables/stores, NOT UI components

## 3. UI/UX Rules (STRICT)
- Listing page = Main page
- Create/Edit forms must open in Dialog/Modal
- No standalone form pages unless explicitly required

## 4. Components
- Atomic and reusable components only
- Presentational components must be logic-free
- Smart logic goes to composables or stores

## 5. State Management
- Use Pinia stores for shared state
- No prop drilling for global data
- API data must be handled via composables + store pattern

# PROJECT STRUCTURE ENFORCEMENT
- Follow current folder structure strictly
- Do NOT rename modules or folders without architectural reason

# CODE GENERATION BEHAVIOR
When generating code:
- Think like a senior architect teammate
- Enforce best practices automatically
- Refactor bad patterns proactively
- Optimize for scalability (10k+ scale systems)
- Maintain clean, modular, enterprise standards
