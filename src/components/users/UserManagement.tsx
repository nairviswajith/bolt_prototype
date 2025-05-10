import { UserProvider, useUser } from '@/context/UserContext';
import { UserTabs } from './UserTabs';
import { ExistingUsers } from './ExistingUsers';
import { AddNewUser } from './AddNewUser';

export function UserManagement() {
  return (
    <UserProvider>
      <div className="p-6">
        <UserTabs />
        <UserContent />
      </div>
    </UserProvider>
  );
}

function UserContent() {
  const { activeTab } = useUser();
  
  return (
    <div>
      {activeTab === 'existing' ? <ExistingUsers /> : <AddNewUser />}
    </div>
  );
}