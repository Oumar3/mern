export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  isAdmin?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    contact?: string;
    address?: string;
    profilePicture?: string;
    team?: string; // Should be Team _id as string
    role?: 'supervisor' | 'IT' | 'executive' | 'agent' | 'user' | 'Chef Logistique' | 'Chef de Departement';
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


export interface Organisation {
  _id: string;
  name: string;
  shortName?: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

