/**
 * Centralised mock data for POS-Coffee.
 *
 * This is the single source of truth for seed users, categories, products,
 * and modifiers. The Zustand stores import these helpers on first run to
 * populate empty localStorage. Components MUST import from here instead of
 * hard-coding values inline.
 */

import type { Category, Modifier, Product, User } from "@/types"

export const APP_NAME = "POS-Coffee"

export const APP_TAGLINE = "A warm point of sale for small coffee shops."

/** Fixed ISO timestamp so seed snapshots stay stable across reloads. */
const SEED_TIMESTAMP = "2026-01-01T08:00:00.000Z"

// ---------- Seed users ----------

export const SEED_USERS: User[] = [
  {
    id: "user-admin",
    createdAt: SEED_TIMESTAMP,
    username: "admin",
    displayName: "Admin",
    role: "admin",
    password: "admin123",
  },
  {
    id: "user-cashier",
    createdAt: SEED_TIMESTAMP,
    username: "cashier",
    displayName: "Cashier",
    role: "cashier",
    password: "cashier123",
  },
]

// ---------- Seed modifier (shared "Size") ----------

const SIZE_MODIFIER_ID = "mod-size"

export const SEED_MODIFIERS: Modifier[] = [
  {
    id: SIZE_MODIFIER_ID,
    createdAt: SEED_TIMESTAMP,
    name: "Size",
    selectionType: "single",
    required: true,
    options: [
      { id: "mod-size-s", name: "Small", priceDelta: 0 },
      { id: "mod-size-m", name: "Medium", priceDelta: 0.5 },
      { id: "mod-size-l", name: "Large", priceDelta: 1.0 },
    ],
  },
]

// ---------- Seed categories ----------

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-espresso",
    createdAt: SEED_TIMESTAMP,
    name: "Espresso",
    sortOrder: 1,
  },
  {
    id: "cat-brewed",
    createdAt: SEED_TIMESTAMP,
    name: "Brewed",
    sortOrder: 2,
  },
]

// ---------- Seed products ----------

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-espresso",
    createdAt: SEED_TIMESTAMP,
    name: "Espresso",
    description: "A single shot pulled fresh on demand.",
    basePrice: 3.0,
    categoryId: "cat-espresso",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
  {
    id: "prod-latte",
    createdAt: SEED_TIMESTAMP,
    name: "Latte",
    description: "Silky steamed milk over a double espresso.",
    basePrice: 4.5,
    categoryId: "cat-espresso",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
  {
    id: "prod-cappuccino",
    createdAt: SEED_TIMESTAMP,
    name: "Cappuccino",
    description: "Equal parts espresso, milk, and dense foam.",
    basePrice: 4.25,
    categoryId: "cat-espresso",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
  {
    id: "prod-mocha",
    createdAt: SEED_TIMESTAMP,
    name: "Mocha",
    description: "Espresso, chocolate, and steamed milk.",
    basePrice: 4.75,
    categoryId: "cat-espresso",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
  {
    id: "prod-drip",
    createdAt: SEED_TIMESTAMP,
    name: "Drip Coffee",
    description: "Today's house drip — clean and bright.",
    basePrice: 2.75,
    categoryId: "cat-brewed",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
  {
    id: "prod-coldbrew",
    createdAt: SEED_TIMESTAMP,
    name: "Cold Brew",
    description: "Smooth, low-acid cold-brewed coffee.",
    basePrice: 4.0,
    categoryId: "cat-brewed",
    modifierIds: [SIZE_MODIFIER_ID],
    active: true,
  },
]
