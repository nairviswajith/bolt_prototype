import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { RoleProvider } from '@/context/RoleContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleManagement } from '@/components/roles/RoleManagement';
import { UserManagement } from '@/components/users/UserManagement';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function AppContent() {
  const { isLoading, activeSection, sidebarExpanded } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'roles' ? <RoleManagement /> : <UserManagement />}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

function App() {
  useEffect(() => {
    document.title = 'User Management System';
  }, []);

  return (
    <AppProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </AppProvider>
  );
}

export default App;