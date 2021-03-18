export type Roles = 'GUEST' | 'EDITOR' | 'ADMIN';
export interface GlobalInformation{
    user_id: string;
    user_email: string;
    email_verified: boolean;
    displayName?: string;
    photoURL?: string;
    role: Roles;
    employeeID?: string;
    employee_email?: string;
    id_company: string;
    company_name: string;
}
