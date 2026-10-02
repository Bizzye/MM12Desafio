export type UserRole = 'admin' | 'stockist';

export interface AppUser {
  readonly uid: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  admin: 'Administrador',
  stockist: 'Estoquista',
};
