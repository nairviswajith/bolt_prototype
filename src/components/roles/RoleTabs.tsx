import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';

export function RoleTabs() {
  const { activeTab, setActiveTab } = useRole();
  
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            className={cn(
              "inline-block py-4 px-4 font-medium text-sm focus:outline-none",
              activeTab === 'existing'
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveTab('existing')}
          >
            Existing Roles
          </button>
          <button
            className={cn(
              "inline-block py-4 px-4 font-medium text-sm focus:outline-none",
              activeTab === 'add'
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveTab('add')}
          >
            Add New Role
          </button>
        </div>
      </div>
    </div>
  );
}