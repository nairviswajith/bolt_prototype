import { useState } from 'react';
import { Bell, AlertCircle, ChevronDown, Search, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const { toggleSidebar, webSocketConnected } = useApp();
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-700"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <img 
              src="https://placekitten.com/32/32" 
              alt="Logo" 
              className="h-8 w-8 rounded-full"
            />
            <img 
              src="https://placekitten.com/34/34" 
              alt="Second Logo" 
              className="h-8 w-8 rounded-full -ml-1"
            />
          </div>
          <div className="text-gray-800 font-medium">Hello Jon,</div>
        </div>
      </div>
      
      <div className="hidden md:flex relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          type="text" 
          placeholder="Search by Fish groups, Trip IDs, Vehicle..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-md w-full"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell className="text-gray-500" size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </div>
        
        <div className="relative">
          <AlertCircle className={cn(
            "transition-colors duration-300",
            webSocketConnected ? "text-green-500" : "text-red-500"
          )} size={20} />
          <span className={cn(
            "absolute -top-1 -right-1 text-white text-xs rounded-full h-2 w-2 flex items-center justify-center",
            webSocketConnected ? "bg-green-500" : "bg-red-500"
          )}></span>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://placekitten.com/100/100" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <ChevronDown className="text-gray-500" size={16} />
        </div>
      </div>
    </div>
  );
}