import { RoleProvider } from '@/context/RoleContext';
import { useRole } from '@/context/RoleContext';
import { RoleTabs } from './RoleTabs';
import { ExistingRoles } from './ExistingRoles';
import { AddNewRole } from './AddNewRole';

export function RoleManagement() {
  return (
    <RoleProvider>
      <div className="p-6">
        <RoleTabs />
        <RoleContent />
      </div>
    </RoleProvider>
  );
}

function RoleContent() {
  const { activeTab } = useRole();
  
  return (
    <div>
      {activeTab === 'existing' ? <ExistingRoles /> : <AddNewRole />}
    </div>
  );
}