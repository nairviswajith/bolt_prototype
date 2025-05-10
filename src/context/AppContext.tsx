import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initDB, seedInitialData } from '@/lib/db';
import webSocketInstance from '@/lib/websocket';
import { toast } from '@/hooks/use-toast';

interface AppContextProps {
  isLoading: boolean;
  activeSection: 'roles' | 'users';
  setActiveSection: (section: 'roles' | 'users') => void;
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  webSocketConnected: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'roles' | 'users'>('roles');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize IndexedDB
        await initDB();
        
        // Seed initial data
        await seedInitialData();
        
        // Set up WebSocket connection listener
        webSocketInstance.onConnectionChange((connected) => {
          setWebSocketConnected(connected);
          if (connected) {
            toast({
              title: 'Connected',
              description: 'Real-time connection established',
              variant: 'default',
            });
          } else {
            toast({
              title: 'Disconnected',
              description: 'Real-time connection lost',
              variant: 'destructive',
            });
          }
        });
        
        // Connect WebSocket
        webSocketInstance.connect();
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize application',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      webSocketInstance.disconnect();
      webSocketInstance.cleanup();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  const value = {
    isLoading,
    activeSection,
    setActiveSection,
    sidebarExpanded,
    toggleSidebar,
    webSocketConnected
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};