import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Role, RoleType, Feature, RoleSearchField } from '@/types';
import { getRoles, addRole, updateRole } from '@/lib/db';
import webSocketInstance from '@/lib/websocket';
import { toast } from '@/hooks/use-toast';

interface RoleContextProps {
  roles: Role[];
  isLoading: boolean;
  activeTab: 'existing' | 'add';
  setActiveTab: (tab: 'existing' | 'add') => void;
  createRole: (role: Omit<Role, 'id' | 'createdAt'>) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  searchField: RoleSearchField;
  setSearchField: (field: RoleSearchField) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredRoles: Role[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  itemsPerPage: number;
  paginatedRoles: Role[];
  getRoleById: (id: string) => Role | undefined;
  roleDetails: Role | null;
  setRoleDetails: (role: Role | null) => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  allFeatures: Feature[];
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'existing' | 'add'>('existing');
  const [searchField, setSearchField] = useState<RoleSearchField>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [roleDetails, setRoleDetails] = useState<Role | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const allFeatures: Feature[] = [
    'Dashboard',
    'User Management',
    'Data Setup',
    'Add Route',
    'Add Trip',
    'Route Monitoring',
    'Live Tracking'
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetchedRoles = await getRoles();
        setRoles(fetchedRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load roles',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();

    // Subscribe to role updates via WebSocket
    const handleRoleUpdate = (data: { action: string; role: Role }) => {
      if (data.action === 'add') {
        setRoles(prev => [...prev, data.role]);
        toast({
          title: 'Role Added',
          description: `Role "${data.role.name}" has been added`,
        });
      } else if (data.action === 'update') {
        setRoles(prev => 
          prev.map(role => role.id === data.role.id ? data.role : role)
        );
        toast({
          title: 'Role Updated',
          description: `Role "${data.role.name}" has been updated`,
        });
      }
    };

    webSocketInstance.subscribe('roles', handleRoleUpdate);

    return () => {
      webSocketInstance.unsubscribe('roles', handleRoleUpdate);
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchField]);

  // Create new role
  const createRole = async (roleData: Omit<Role, 'id' | 'createdAt'>): Promise<Role> => {
    const newRole: Role = {
      ...roleData,
      id: uuidv4(),
      createdAt: new Date()
    };

    try {
      const createdRole = await addRole(newRole);
      
      // Publish update to WebSocket
      webSocketInstance.publish('roles', {
        action: 'add',
        role: createdRole
      });
      
      return createdRole;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  };

  // Update existing role
  const updateExistingRole = async (role: Role): Promise<Role> => {
    try {
      const updatedRole = await updateRole(role);
      
      // Publish update to WebSocket
      webSocketInstance.publish('roles', {
        action: 'update',
        role: updatedRole
      });
      
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  // Filter roles based on search criteria
  const filteredRoles = roles.filter(role => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    if (searchField === 'name') {
      return role.name.toLowerCase().includes(query);
    } else if (searchField === 'type') {
      return role.type.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  // Get paginated roles
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get role by ID
  const getRoleById = (id: string): Role | undefined => {
    return roles.find(role => role.id === id);
  };

  const value = {
    roles,
    isLoading,
    activeTab,
    setActiveTab,
    createRole,
    updateRole: updateExistingRole,
    searchField,
    setSearchField,
    searchQuery,
    setSearchQuery,
    filteredRoles,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    paginatedRoles,
    getRoleById,
    roleDetails,
    setRoleDetails,
    editMode,
    setEditMode,
    allFeatures
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = (): RoleContextProps => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};