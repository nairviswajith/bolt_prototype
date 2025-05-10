import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRole } from '@/context/RoleContext';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ExistingUsers() {
  const {
    paginatedUsers,
    isLoading,
    searchField,
    setSearchField,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleUserStatus,
    selectedUsers,
    toggleUserSelection,
    selectAllUsers,
    filterStatus,
    setFilterStatus
  } = useUser();
  
  const { roles } = useRole();
  
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };
  
  const getRoleType = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.type : 'Unknown';
  };
  
  const handleSearch = () => {
    // Search is already being handled by the context via state changes
  };
  
  const areAllCurrentPageSelected = paginatedUsers.length > 0 && 
    paginatedUsers.every(user => selectedUsers.includes(user.id));

  if (isLoading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Total Users - {paginatedUsers.length}</h3>
        
        <div className="flex gap-2">
          <div className="flex">
            <Button
              variant={filterStatus === 'inactive' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('inactive')}
              className={cn(
                "rounded-l-md rounded-r-none border-r-0",
                filterStatus === 'inactive' ? "bg-blue-700 hover:bg-blue-800" : ""
              )}
            >
              Inactive
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('active')}
              className={cn(
                "rounded-l-none rounded-r-md",
                filterStatus === 'active' ? "bg-blue-700 hover:bg-blue-800" : ""
              )}
            >
              Active
            </Button>
          </div>
          
          <div className="relative">
            <Select
              value={searchField}
              onValueChange={(value) => setSearchField(value as 'name' | 'email' | 'role')}
            >
              <SelectTrigger className="w-[180px] bg-gray-100 border-0">
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  <span>Search By</span>
                </span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Input
            type="text"
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-gray-100 border-0"
          />
          
          <Button onClick={handleSearch} className="bg-blue-700 hover:bg-blue-800">
            Search
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-3 px-4">
                <Checkbox
                  checked={areAllCurrentPageSelected}
                  onCheckedChange={selectAllUsers}
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 px-4 text-gray-500 font-medium">Creation Date</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Role Name</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Role Type</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Email Address</th>
              <th className="py-3 px-4 text-gray-500 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 last:border-0">
                  <td className="py-4 px-4">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                      aria-label={`Select ${user.firstName} ${user.lastName}`}
                    />
                  </td>
                  <td className="py-4 px-4 text-gray-800">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy, HH:mm:ss')}
                  </td>
                  <td className="py-4 px-4 text-gray-800">{`${user.firstName} ${user.lastName}`}</td>
                  <td className="py-4 px-4 text-gray-800">{getRoleName(user.roleId)}</td>
                  <td className="py-4 px-4 text-gray-800">{getRoleType(user.roleId)}</td>
                  <td className="py-4 px-4 text-gray-800">{user.email}</td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant={user.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                      className={cn(
                        "text-xs px-3 py-1",
                        user.active ? "bg-green-600 hover:bg-green-700" : "text-red-600 border-red-600 hover:bg-red-50"
                      )}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft size={16} />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logic for showing current page in the middle when possible
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => setCurrentPage(pageNum)}
                className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-blue-600' : ''}`}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="mx-1">...</span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}