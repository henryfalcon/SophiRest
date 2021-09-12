export type Roles = 'GUEST' | 'EDITOR' | 'ADMIN';
export interface UserI {
    uid: string;
    email: string;
    displayName?: string;
    emailVerified: boolean;
    password?: string;
    photoURL?: string;
    role?: Roles;
    employeeID?: string;
    id_company?: string;
    company_name?: string;
}
