import { Role, User, Feature, Permission } from '@/types';

// IndexedDB setup
const DB_NAME = 'userManagementDB';
const DB_VERSION = 1;
const ROLES_STORE = 'roles';
const USERS_STORE = 'users';

let db: IDBDatabase | null = null;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening database');
      reject(false);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create roles store
      if (!db.objectStoreNames.contains(ROLES_STORE)) {
        const rolesStore = db.createObjectStore(ROLES_STORE, { keyPath: 'id' });
        rolesStore.createIndex('name', 'name', { unique: false });
        rolesStore.createIndex('type', 'type', { unique: false });
        rolesStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create users store
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('roleId', 'roleId', { unique: false });
        usersStore.createIndex('createdAt', 'createdAt', { unique: false });
        usersStore.createIndex('active', 'active', { unique: false });
      }
    };
  });
};

// Roles CRUD operations
export const addRole = (role: Role): Promise<Role> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([ROLES_STORE], 'readwrite');
    const store = transaction.objectStore(ROLES_STORE);
    const request = store.add(role);

    request.onsuccess = () => {
      resolve(role);
    };

    request.onerror = () => {
      reject(new Error('Error adding role'));
    };
  });
};

export const getRoles = (): Promise<Role[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([ROLES_STORE], 'readonly');
    const store = transaction.objectStore(ROLES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Error getting roles'));
    };
  });
};

export const getRole = (id: string): Promise<Role | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([ROLES_STORE], 'readonly');
    const store = transaction.objectStore(ROLES_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('Error getting role'));
    };
  });
};

export const updateRole = (role: Role): Promise<Role> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([ROLES_STORE], 'readwrite');
    const store = transaction.objectStore(ROLES_STORE);
    const request = store.put(role);

    request.onsuccess = () => {
      resolve(role);
    };

    request.onerror = () => {
      reject(new Error('Error updating role'));
    };
  });
};

// Users CRUD operations
export const addUser = (user: User): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.add(user);

    request.onsuccess = () => {
      resolve(user);
    };

    request.onerror = () => {
      reject(new Error('Error adding user'));
    };
  });
};

export const getUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Error getting users'));
    };
  });
};

export const updateUser = (user: User): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.put(user);

    request.onsuccess = () => {
      resolve(user);
    };

    request.onerror = () => {
      reject(new Error('Error updating user'));
    };
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generation
export const seedInitialData = async (): Promise<void> => {
  // Features
  const allFeatures: Feature[] = [
    'Dashboard',
    'User Management',
    'Data Setup',
    'Add Route',
    'Add Trip',
    'Route Monitoring',
    'Live Tracking'
  ];

  // Generate mock roles
  const mockRoles: Role[] = [
    {
      id: '1',
      name: 'Product Manager',
      type: 'Admin',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      features: allFeatures,
      permissions: allFeatures.reduce((acc, feature) => {
        acc[feature] = { view: true, update: true, alerts: true };
        return acc;
      }, {} as Record<string, Permission>)
    },
    {
      id: '2',
      name: 'Marketing Specialist',
      type: 'Management',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      features: ['Dashboard', 'Add Route', 'Add Trip'],
      permissions: {
        'Dashboard': { view: true, update: false, alerts: false },
        'Add Route': { view: true, update: true, alerts: false },
        'Add Trip': { view: true, update: true, alerts: false }
      }
    },
    {
      id: '3',
      name: 'Field Inspector',
      type: 'Control Center Unit',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      features: ['Dashboard', 'Route Monitoring', 'Live Tracking'],
      permissions: {
        'Dashboard': { view: true, update: false, alerts: false },
        'Route Monitoring': { view: true, update: false, alerts: true },
        'Live Tracking': { view: true, update: false, alerts: true }
      }
    },
    {
      id: '4',
      name: 'Content Creator',
      type: 'General User',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      features: ['Dashboard'],
      permissions: {
        'Dashboard': { view: true, update: false, alerts: false }
      }
    },
    {
      id: '5',
      name: 'System Administrator',
      type: 'Admin',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      features: allFeatures,
      permissions: allFeatures.reduce((acc, feature) => {
        acc[feature] = { view: true, update: true, alerts: true };
        return acc;
      }, {} as Record<string, Permission>)
    }
  ];

  // Generate mock users
  const mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Jon',
      lastName: 'Doe',
      email: 'jondoe@gmail.com',
      mobile: '+1 (555) 123-4567',
      roleId: '1',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      active: true
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      mobile: '+1 (555) 987-6543',
      roleId: '2',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      active: true
    },
    {
      id: '3',
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      mobile: '+1 (555) 567-8901',
      roleId: '3',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      active: false
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      mobile: '+1 (555) 234-5678',
      roleId: '4',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      active: true
    },
    {
      id: '5',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      mobile: '+1 (555) 345-6789',
      roleId: '5',
      createdAt: new Date(2025, 2, 8, 1, 21, 8),
      active: true
    }
  ];

  // Wait for database to be initialized
  if (!db) {
    await delay(1000); // Wait for 1 second
    if (!db) {
      throw new Error('Database failed to initialize');
    }
  }

  try {
    // Add roles with individual error handling
    for (const role of mockRoles) {
      try {
        await addRole(role);
      } catch (error) {
        console.warn(`Failed to add role ${role.name}:`, error);
        // Continue with next role instead of stopping
      }
    }
    
    // Add users with individual error handling
    for (const user of mockUsers) {
      try {
        await addUser(user);
      } catch (error) {
        console.warn(`Failed to add user ${user.email}:`, error);
        // Continue with next user instead of stopping
      }
    }
    
    console.log('Initial data seeding completed');
  } catch (error) {
    console.error('Error during data seeding:', error);
    throw error;
  }
};