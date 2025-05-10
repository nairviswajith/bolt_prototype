import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { format } from 'date-fns';

export function AddNewUser() {
  const { createUser, recentlyAddedUsers } = useUser();
  const { roles } = useRole();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [roleId, setRoleId] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!roleId) {
      newErrors.roleId = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newUser: Omit<User, 'id' | 'createdAt'> = {
        firstName,
        lastName,
        email,
        mobile: mobile ? `${countryCode} ${mobile}` : undefined,
        roleId,
        active: true
      };
      
      await createUser(newUser);
      
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setRoleId('');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };
  
  const getRoleType = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.type : 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-6">Add New User</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700">First Name*</span>
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2">
                <span className="text-gray-700">Last Name*</span>
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2">
                <span className="text-gray-700">Role*</span>
              </label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className={errors.roleId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} ({role.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2">
                <span className="text-gray-700">Email Address*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2">
                <span className="text-gray-700">Mobile Number</span>
              </label>
              <div className="flex">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[80px] rounded-r-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+61">+61</SelectItem>
                    <SelectItem value="+81">+81</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="rounded-l-none"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {isSubmitting ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Recently Invited Users */}
      {recentlyAddedUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-6">Recently Invited Users</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-3 px-4 text-gray-500 font-medium">Creation Date</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Role Name</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Role Type</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Email Address</th>
                  <th className="py-3 px-4 text-gray-500 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentlyAddedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 last:border-0">
                    <td className="py-4 px-4 text-gray-800">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy, HH:mm:ss')}
                    </td>
                    <td className="py-4 px-4 text-gray-800">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="py-4 px-4 text-gray-800">{getRoleName(user.roleId)}</td>
                    <td className="py-4 px-4 text-gray-800">{getRoleType(user.roleId)}</td>
                    <td className="py-4 px-4 text-gray-800">{user.email}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}