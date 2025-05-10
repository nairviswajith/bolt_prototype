import { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Role, RoleType, Feature, Permission } from '@/types';
import { cn } from '@/lib/utils';

export function AddNewRole() {
  const { createRole, allFeatures } = useRole();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isRoleCreationOpen, setIsRoleCreationOpen] = useState(true);
  const [isFeatureAccessOpen, setIsFeatureAccessOpen] = useState(false);
  const [isPrivilegeRightsOpen, setIsPrivilegeRightsOpen] = useState(false);

  const [roleName, setRoleName] = useState('');
  const [roleType, setRoleType] = useState<RoleType | ''>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    features?: string;
  }>({});

  const toggleRoleCreation = () => {
    setIsRoleCreationOpen(!isRoleCreationOpen);
  };

  const toggleFeatureAccess = () => {
    setIsFeatureAccessOpen(!isFeatureAccessOpen);
  };

  const togglePrivilegeRights = () => {
    setIsPrivilegeRightsOpen(!isPrivilegeRightsOpen);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate Role Creation
      const newErrors: typeof errors = {};
      if (!roleName.trim()) {
        newErrors.name = 'Role name is required';
      }
      if (!roleType) {
        newErrors.type = 'Role type is required';
      }
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        setStep(2);
        setIsRoleCreationOpen(false);
        setIsFeatureAccessOpen(true);
      }
    } else if (step === 2) {
      // Validate Feature Access
      if (selectedFeatures.length === 0) {
        setErrors({ features: 'Select at least one feature' });
        return;
      }
      
      // Initialize permissions for selected features
      const initialPermissions: Record<string, Permission> = {};
      selectedFeatures.forEach(feature => {
        initialPermissions[feature] = { view: true, update: false, alerts: false };
      });
      setPermissions(initialPermissions);
      
      setStep(3);
      setIsFeatureAccessOpen(false);
      setIsPrivilegeRightsOpen(true);
    }
  };

  const handleSelectAllFeatures = (checked: boolean) => {
    if (checked) {
      setSelectedFeatures([...allFeatures]);
    } else {
      setSelectedFeatures([]);
    }
  };

  const handleFeatureSelection = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures(prev => [...prev, feature]);
    } else {
      setSelectedFeatures(prev => prev.filter(f => f !== feature));
    }
  };

  const handlePermissionChange = (feature: string, permType: keyof Permission, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [permType]: checked
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const newRole: Omit<Role, 'id' | 'createdAt'> = {
        name: roleName,
        type: roleType as RoleType,
        features: selectedFeatures,
        permissions
      };
      
      await createRole(newRole);
      
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
      
      // Reset form
      setRoleName('');
      setRoleType('');
      setSelectedFeatures([]);
      setPermissions({});
      setStep(1);
      setIsRoleCreationOpen(true);
      setIsFeatureAccessOpen(false);
      setIsPrivilegeRightsOpen(false);
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Role Creation */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          className={cn(
            "flex justify-between items-center p-4 cursor-pointer bg-white",
            isRoleCreationOpen && "border-b"
          )}
          onClick={toggleRoleCreation}
        >
          <h3 className="text-lg font-medium">Role Creation</h3>
          {isRoleCreationOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {isRoleCreationOpen && (
          <div className="p-6 bg-white">
            <p className="text-sm text-gray-500 mb-6">Select features to create roles</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700">*Role Name</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter here"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700">*Role Type</span>
                </label>
                <Select value={roleType} onValueChange={(value) => setRoleType(value as RoleType)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Control Center Unit">Control Center Unit</SelectItem>
                    <SelectItem value="General User">General User</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>
            </div>
            
            {step === 1 && (
              <div className="mt-6">
                <Button
                  onClick={handleNext}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Step 2: Feature Access */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          className={cn(
            "flex justify-between items-center p-4 cursor-pointer bg-white",
            isFeatureAccessOpen && "border-b"
          )}
          onClick={toggleFeatureAccess}
        >
          <h3 className="text-lg font-medium">Feature Access</h3>
          {isFeatureAccessOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {isFeatureAccessOpen && (
          <div className="p-6 bg-white">
            <p className="text-sm text-gray-500 mb-6">Select features to assign per user role</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedFeatures.length === allFeatures.length}
                  onCheckedChange={(checked) => handleSelectAllFeatures(!!checked)}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-600"
                >
                  Select All
                </label>
              </div>
              
              {allFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureSelection(feature, !!checked)}
                  />
                  <label
                    htmlFor={`feature-${feature}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {feature}
                  </label>
                </div>
              ))}
              
              {errors.features && (
                <p className="text-red-500 text-sm mt-1">{errors.features}</p>
              )}
            </div>
            
            {step === 2 && (
              <div className="mt-6">
                <Button
                  onClick={handleNext}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Step 3: Privilege Rights */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          className={cn(
            "flex justify-between items-center p-4 cursor-pointer bg-white",
            isPrivilegeRightsOpen && "border-b"
          )}
          onClick={togglePrivilegeRights}
        >
          <h3 className="text-lg font-medium">Privilege Rights</h3>
          {isPrivilegeRightsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {isPrivilegeRightsOpen && (
          <div className="p-6 bg-white">
            <p className="text-sm text-gray-500 mb-6">Select access type per feature for this role</p>
            
            <div className="border rounded overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-100 p-4">
                <div className="text-sm font-medium">Features</div>
                <div className="text-sm font-medium flex justify-center">
                  <Checkbox
                    id="view-all"
                    checked={Object.values(permissions).every(p => p.view)}
                    onCheckedChange={(checked) => {
                      const newPermissions = { ...permissions };
                      Object.keys(newPermissions).forEach(feature => {
                        newPermissions[feature].view = !!checked;
                      });
                      setPermissions(newPermissions);
                    }}
                  />
                  <label htmlFor="view-all" className="ml-2">View</label>
                </div>
                <div className="text-sm font-medium flex justify-center">
                  <Checkbox
                    id="update-all"
                    checked={Object.values(permissions).every(p => p.update)}
                    onCheckedChange={(checked) => {
                      const newPermissions = { ...permissions };
                      Object.keys(newPermissions).forEach(feature => {
                        newPermissions[feature].update = !!checked;
                      });
                      setPermissions(newPermissions);
                    }}
                  />
                  <label htmlFor="update-all" className="ml-2">Update</label>
                </div>
                <div className="text-sm font-medium flex justify-center">
                  <Checkbox
                    id="alerts-all"
                    checked={Object.values(permissions).every(p => p.alerts)}
                    onCheckedChange={(checked) => {
                      const newPermissions = { ...permissions };
                      Object.keys(newPermissions).forEach(feature => {
                        newPermissions[feature].alerts = !!checked;
                      });
                      setPermissions(newPermissions);
                    }}
                  />
                  <label htmlFor="alerts-all" className="ml-2">Alerts</label>
                </div>
              </div>
              
              {selectedFeatures.map((feature) => (
                <div key={feature} className="grid grid-cols-4 p-4 border-t">
                  <div className="text-sm">{feature}</div>
                  <div className="flex justify-center">
                    <Checkbox
                      id={`view-${feature}`}
                      checked={permissions[feature]?.view ?? false}
                      onCheckedChange={(checked) => handlePermissionChange(feature, 'view', !!checked)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id={`update-${feature}`}
                      checked={permissions[feature]?.update ?? false}
                      onCheckedChange={(checked) => handlePermissionChange(feature, 'update', !!checked)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id={`alerts-${feature}`}
                      checked={permissions[feature]?.alerts ?? false}
                      onCheckedChange={(checked) => handlePermissionChange(feature, 'alerts', !!checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {step === 3 && (
              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}