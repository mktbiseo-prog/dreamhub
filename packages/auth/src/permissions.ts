// ---------------------------------------------------------------------------
// Service Permissions — Constants & Defaults
//
// Every Dream ID user receives DEFAULT_PERMISSIONS on signup.
// Special permissions (PLACE_MATCH, STORE_SELL, CAFE_CHECKIN, CAFE_DOORBELL)
// are granted through specific actions (e.g., completing onboarding,
// verifying identity, visiting a café).
// ---------------------------------------------------------------------------

import { Permission } from "@dreamhub/shared-types";

/** Permissions granted to every new Dream ID user on signup */
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Brain
  Permission.BRAIN_READ,
  Permission.BRAIN_WRITE,

  // Planner
  Permission.PLANNER_READ,
  Permission.PLANNER_WRITE,

  // Place
  Permission.PLACE_READ,
  Permission.PLACE_WRITE,

  // Store
  Permission.STORE_READ,
  Permission.STORE_WRITE,

  // Café
  Permission.CAFE_READ,
];

/** All permissions available in the system */
export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

/** Group permissions by service for admin/display purposes */
export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  brain: [Permission.BRAIN_READ, Permission.BRAIN_WRITE],
  planner: [Permission.PLANNER_READ, Permission.PLANNER_WRITE],
  place: [Permission.PLACE_READ, Permission.PLACE_WRITE, Permission.PLACE_MATCH],
  store: [Permission.STORE_READ, Permission.STORE_WRITE, Permission.STORE_SELL],
  cafe: [Permission.CAFE_READ, Permission.CAFE_CHECKIN, Permission.CAFE_DOORBELL],
};

/**
 * Check whether a permission set includes a specific permission.
 */
export function hasPermission(
  userPermissions: Permission[],
  required: Permission,
): boolean {
  return userPermissions.includes(required);
}

/**
 * Check whether a permission set includes ALL of the required permissions.
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission[],
): boolean {
  return required.every((p) => userPermissions.includes(p));
}
