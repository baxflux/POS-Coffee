/**
 * Barrel file — single import point for every Zustand store.
 *
 * Use `import { useMenuStore } from "@/stores"` rather than reaching into
 * individual files so refactors stay cheap.
 */

export { useMenuStore } from "./useMenuStore"
export type { MenuStore } from "./useMenuStore"

export { useOrdersStore } from "./useOrdersStore"
export type { OrdersStore, CreateOrderInput } from "./useOrdersStore"

export { useCartStore } from "./useCartStore"
export type { CartStore, AddToCartInput } from "./useCartStore"

export { useAuthStore, AUTH_ERROR_MESSAGE } from "./useAuthStore"
export type { AuthStore, AuthSession, LoginResult } from "./useAuthStore"
