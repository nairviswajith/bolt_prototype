// Role and User Types
export type RoleType = 'Admin' | 'Management' | 'Control Center Unit' | 'General User';

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  createdAt: Date;
  features: string[];
  permissions: {
    [key: string]: {
      view: boolean;
      update: boolean;
      alerts: boolean;
    };
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  roleId: string;
  createdAt: Date;
  active: boolean;
}

// Feature and Permission Types
export type Feature = 
  | 'Dashboard' 
  | 'User Management' 
  | 'Data Setup' 
  | 'Add Route' 
  | 'Add Trip' 
  | 'Route Monitoring' 
  | 'Live Tracking';

export interface Permission {
  view: boolean;
  update: boolean;
  alerts: boolean;
}

export type PermissionKey = keyof Permission;

// Search Types
export type RoleSearchField = 'name' | 'type';
export type UserSearchField = 'name' | 'email' | 'role';