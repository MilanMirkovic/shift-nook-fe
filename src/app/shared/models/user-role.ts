/**
 * Platform-level role (on the User itself).
 * Distinct from CompanyRole which is per-company membership.
 */
export type UserRole = 'OWNER'| 'ADMIN';

export const USER_ROLES: UserRole[] = ['OWNER', 'ADMIN'];

