/**
 * Platform-level role (on the User itself).
 * Distinct from CompanyRole which is per-company membership.
 */
export type UserRole = 'USER'| 'ADMIN';

export const USER_ROLES: UserRole[] = ['USER', 'ADMIN'];

