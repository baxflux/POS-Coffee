# POS-Coffee

## Project Configuration

> **Update these two values before running any agent.**

| Key                | Value                |
| ------------------ | -------------------- |
| `GITHUB_REPO`      | `baxflux/POS-Coffee` |
| `JIRA_PROJECT_KEY` | `PC`                 |

---

## Project Overview

A simple, modern web-based Point of Sale system for a small coffee shop. This is a lightweight MVP/demo version that focuses on core functionality and can be easily deployed.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Hook Form + Zod (forms & validation)
- Lucide React (icons)
- date-fns (date handling)
- Deployment: Vercel

## Core Features (MVP)

1. Staff login (simple Admin / Cashier roles)
2. Menu management (products, categories, basic modifiers)
3. Order creation with modifiers and notes
4. Order management (view today's orders with status)
5. Simulated payment (Cash, Card, Mobile)
6. Receipt display & print
7. Basic daily report (revenue, order count, top items)

## Non-functional Requirements

- Clean, warm, coffee-shop aesthetic
- Responsive design (optimized for tablet and desktop)
- Fast and smooth user experience
- Clean, well-organized code

## Workflow

1. Requirement Gathering → Create Requirement Document
2. Project Planning → Create PLAN.md + Jira tasks (10 tasks total)
3. Development Loop:
   - Developer Agent picks one task → creates branch → implements → creates PR
   - Tester Agent reviews + tests + scores
   - User reviews PR → Approve (merge) or Request changes
4. Repeat until all tasks are Done
5. Final deployment to Vercel
