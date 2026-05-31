/**
 * Shared domain types for POS-Coffee.
 *
 * This file is intentionally minimal in PC-1 — PC-2 fills in the full
 * domain model (User, Category, Product, Modifier, Order, etc.). Keeping
 * the file in place from day one prevents scattered local type
 * declarations and gives every component a single import target.
 */

export type Role = "admin" | "cashier"

export interface BaseEntity {
  id: string
  createdAt: string
}
