import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, UserSearchField } from '@/types';
import { getUsers, addUser, updateUser, getRoles } from '@/lib/db';
import webSocketInstance from '@/lib/websocket';
import { toast } from '@/hooks/use-toast';

interface UserContextProps {
  users: User[];
  isLoading: boolean;
  activeTab: 'existing' | 'add';
  setActiveTab: (tab: 'existing' | 'add') => void;
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (user: User) => Promise<User>;
  searchField: UserSearchField;
  setSearchField: (field: UserSearchField) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredUsers: User[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  itemsPerPage: number;
  paginatedUsers: User[];
  toggleUserStatus: (id: string) => Promise<void>;
  selectedUsers: string[];
  toggleUserSelection: (id: string) => void;
  clearSelectedUsers: () => void;
  selectAllUsers: () => void;
  recentlyAddedUsers: User[];
  getUserById: (id: string) => User | undefined;
  filterStatus: 'all' | 'active' | 'inactive';
  setFilterStatus: (status: 'all' | 'active' | 'inactive') => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'existing' | 'add'>('existing');
  const [searchField, setSearchField] = useState<UserSearchField>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    // Subscribe to user updates via WebSocket
    const handleUserUpdate = (data: { action: string; user: User }) => {
      if (data.action === 'add') {
        setUsers(prev => [...prev, data.user]);
        setRecentlyAddedUsers(prev => [data.user, ...prev].slice(0, 5));
        toast({
          title: 'User Added',
          description: `User "${data.user.firstName} ${data.user.lastName}" has been added`,
        });
      } else if (data.action === 'update') {
        setUsers(prev => 
          prev.map(user => user.id === data.user.id ? data.user : user)
        );
        toast({
          title: 'User Updated',
          description: `User "${data.user.firstName} ${data.user.lastName}" has been updated`,
        });
      }
    };

    webSocketInstance.subscribe('users', handleUserUpdate);

    return () => {
      webSocketInstance.unsubscribe('users', handleUserUpdate);
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchField, filterStatus]);

  // Create new user
  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date()
    };

    try {
      const createdUser = await addUser(newUser);
      
      // Publish update to WebSocket
      webSocketInstance.publish('users', {
        action: 'add',
        user: createdUser
      });
      
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // Update existing user
  const updateExistingUser = async (user: User): Promise<User> => {
    try {
      const updatedUser = await updateUser(user);
      
      // Publish update to WebSocket
      webSocketInstance.publish('users', {
        action: 'update',
        user: updatedUser
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (id: string): Promise<void> => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const updatedUser = {
      ...user,
      active: !user.active
    };

    try {
      await updateExistingUser(updatedUser);
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };

  // Toggle user selection for batch actions
  const toggleUserSelection = (id: string): void => {
    setSelectedUsers(prev => {
      if (prev.includes(id)) {
        return prev.filter(userId => userId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Clear all selected users
  const clearSelectedUsers = (): void => {
    setSelectedUsers([]);
  };

  // Select all users on the current page
  const selectAllUsers = (): void => {
    const allPageUserIds = paginatedUsers.map(user => user.id);
    setSelectedUsers(prev => {
      // If all users on this page are already selected, deselect them
      if (allPageUserIds.every(id => prev.includes(id))) {
        return prev.filter(id => !allPageUserIds.includes(id));
      }
      // Otherwise, add all users from this page
      return [...new Set([...prev, ...allPageUserIds])];
    });
  };

  // Filter and process users based on search criteria and status filter
  const filteredUsers = users.filter(user => {
    // First filter by status
    if (filterStatus === 'active' && !user.active) return false;
    if (filterStatus === 'inactive' && user.active) return false;
    
    // Then filter by search query
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    if (searchField === 'name') {
      return `${user.firstName} ${user.lastName}`.toLowerCase().includes(query);
    } else if (searchField === 'email') {
      return user.email.toLowerCase().includes(query);
    } else if (searchField === 'role') {
      // This would require looking up the role name, which we don't have here
      // In a real implementation, we'd need to join with role data
      return true;
    }
    return true;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Get paginated users
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get user by ID
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const value = {
    users,
    isLoading,
    activeTab,
    setActiveTab,
    createUser,
    updateUser: updateExistingUser,
    searchField,
    setSearchField,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    paginatedUsers,
    toggleUserStatus,
    selectedUsers,
    toggleUserSelection,
    clearSelectedUsers,
    selectAllUsers,
    recentlyAddedUsers,
    getUserById,
    filterStatus,
    setFilterStatus
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};