/**
 * Platform-level role (on the User itself).
 * Distinct from CompanyRole which is per-company membership.
 */
export type UserRole = 'OWNER' | 'WORKER' | 'ACCOUNTANT' | 'ADMIN';

export const USER_ROLES: UserRole[] = ['OWNER', 'WORKER', 'ACCOUNTANT', 'ADMIN'];

