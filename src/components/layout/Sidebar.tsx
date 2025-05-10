import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Waypoints,
  MapPin,
  BarChartHorizontal,
  Map
} from 'lucide-react';

export function Sidebar() {
  const { activeSection, setActiveSection, sidebarExpanded } = useApp();
  const [userManagementExpanded, setUserManagementExpanded] = useState(true);

  const toggleUserManagement = () => {
    setUserManagementExpanded(!userManagementExpanded);
  };

  const handleSectionClick = (section: 'roles' | 'users') => {
    setActiveSection(section);
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      sidebarExpanded ? "w-[180px]" : "w-[70px]"
    )}>
      <div className="p-4 text-sm font-medium text-gray-500">
        {sidebarExpanded ? 'User Panel' : 'UP'}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 p-2">
        {/* Dashboard */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <LayoutDashboard size={20} />
          {sidebarExpanded && <span>Dashboard</span>}
        </div>
        
        {/* User Management */}
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-md cursor-pointer",
            userManagementExpanded ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
          )}
          onClick={toggleUserManagement}
        >
          <Users size={20} />
          {sidebarExpanded && <span>User Management</span>}
        </div>
        
        {/* User Management SubItems */}
        {userManagementExpanded && (
          <div className="pl-8">
            {/* Roles */}
            <div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-md cursor-pointer",
                activeSection === 'roles' ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => handleSectionClick('roles')}
            >
              <Users size={16} />
              {sidebarExpanded && <span>Roles</span>}
            </div>
            
            {/* Users */}
            <div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-md cursor-pointer",
                activeSection === 'users' ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => handleSectionClick('users')}
            >
              <Users size={16} />
              {sidebarExpanded && <span>Users</span>}
            </div>
          </div>
        )}
        
        {/* Date Setup */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <Settings size={20} />
          {sidebarExpanded && <span>Date Setup</span>}
        </div>
        
        {/* Add Route */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <Waypoints size={20} />
          {sidebarExpanded && <span>Add Route</span>}
        </div>
        
        {/* Add Trip */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <MapPin size={20} />
          {sidebarExpanded && <span>Add Trip</span>}
        </div>
        
        {/* Route Monitoring */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <BarChartHorizontal size={20} />
          {sidebarExpanded && <span>Route Monitoring</span>}
        </div>
        
        {/* Live Tracking */}
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer text-gray-700">
          <Map size={20} />
          {sidebarExpanded && <span>Live Tracking</span>}
        </div>
      </div>
    </div>
  );
}