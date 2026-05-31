// equivalent of typescript-angular generator output — hand-authored fallback
export interface AdminPublicView {
  id: string;
  email: string;
  name: string;
  role: AdminPublicView.RoleEnum;
  createdAt: string;
  updatedAt: string;
}

export namespace AdminPublicView {
  export type RoleEnum = 'admin' | 'manager';
  export const RoleEnum = {
    Admin: 'admin' as RoleEnum,
    Manager: 'manager' as RoleEnum,
  };
}
