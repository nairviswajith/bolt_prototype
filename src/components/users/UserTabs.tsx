import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

export function UserTabs() {
  const { activeTab, setActiveTab } = useUser();
  
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
            Existing Users
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
            Add New Users
          </button>
        </div>
      </div>
    </div>
  );
}