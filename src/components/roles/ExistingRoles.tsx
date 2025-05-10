import { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { Eye, Pencil, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export function ExistingRoles() {
  const {
    paginatedRoles,
    isLoading,
    searchField,
    setSearchField,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    setRoleDetails,
    roleDetails,
    setEditMode
  } = useRole();
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleSearch = () => {
    // Search is already being handled by the context via state changes
  };
  
  const handleViewRole = (roleId: string) => {
    const role = paginatedRoles.find(r => r.id === roleId);
    if (role) {
      setRoleDetails(role);
      setShowViewDialog(true);
    }
  };
  
  const handleEditRole = (roleId: string) => {
    const role = paginatedRoles.find(r => r.id === roleId);
    if (role) {
      setRoleDetails(role);
      setEditMode(true);
      // Navigate to edit mode (in a real app, we'd switch tabs or open a dialog)
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading roles...</div>;
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Total Roles - {paginatedRoles.length}</h3>
        
        <div className="flex gap-2">
          <div className="relative">
            <Select
              value={searchField}
              onValueChange={(value) => setSearchField(value as 'name' | 'type')}
            >
              <SelectTrigger className="w-[180px] bg-gray-100 border-0">
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  <span>Search By</span>
                </span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Role Name</SelectItem>
                <SelectItem value="type">Role Type</SelectItem>
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
              <th className="py-3 px-4 text-gray-500 font-medium">Creation Date</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Role Name</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Role Type</th>
              <th className="py-3 px-4 text-gray-500 font-medium text-right">Take Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoles.length > 0 ? (
              paginatedRoles.map((role) => (
                <tr key={role.id} className="border-b border-gray-200 last:border-0">
                  <td className="py-4 px-4 text-gray-800">
                    {format(new Date(role.createdAt), 'dd/MM/yyyy, HH:mm:ss')}
                  </td>
                  <td className="py-4 px-4 text-gray-800">{role.name}</td>
                  <td className="py-4 px-4 text-gray-800">{role.type}</td>
                  <td className="py-4 px-4 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewRole(role.id)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Eye size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRole(role.id)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No roles found
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
      
      {/* Role View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
          </DialogHeader>
          
          {roleDetails && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role Name</h4>
                  <p className="text-gray-900">{roleDetails.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role Type</h4>
                  <p className="text-gray-900">{roleDetails.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Creation Date</h4>
                  <p className="text-gray-900">{format(new Date(roleDetails.createdAt), 'dd/MM/yyyy, HH:mm:ss')}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
                <ul className="space-y-1">
                  {roleDetails.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-900">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Permissions</h4>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Feature</th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">View</th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">Update</th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(roleDetails.permissions).map(([feature, perms]) => (
                        <tr key={feature} className="border-b last:border-0">
                          <td className="py-2 px-4 text-sm text-gray-900">{feature}</td>
                          <td className="py-2 px-4 text-center">
                            {perms.view ? '✓' : '—'}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {perms.update ? '✓' : '—'}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {perms.alerts ? '✓' : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}