import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, AccountType, OrganizationType, TeamSize } from '../types/auth';

interface SignupIndividualParams {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
}

interface SignupOrganizationParams {
  name: string;
  email: string;
  password?: string;
  organizationName: string;
  organizationType: OrganizationType | string;
  teamSize: TeamSize | string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  signupIndividual: (data: SignupIndividualParams) => Promise<UserProfile>;
  signupOrganization: (data: SignupOrganizationParams) => Promise<UserProfile>;
  logout: () => void;
  switchAccountType: (type: AccountType) => void;
}

const DEFAULT_INDIVIDUAL_USER: UserProfile = {
  id: 'usr_indiv_01',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  accountType: 'individual',
  phoneNumber: '+91 98765 43210',
  createdAt: new Date().toISOString(),
};

const DEFAULT_ORG_USER: UserProfile = {
  id: 'usr_org_01',
  name: 'Ananya Verma',
  email: 'ananya.v@securecyber.io',
  accountType: 'organization',
  organizationName: 'SecureCyber Sentinel Labs',
  organizationType: 'Security & Fraud',
  teamSize: '11-50',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('voiceshield_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore JSON parse error
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('voiceshield_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('voiceshield_user');
    }
  }, [user]);

  const login = async (email: string): Promise<UserProfile> => {
    // Check if email contains corporate domain or organization keywords
    const isOrg = email.includes('@company') || email.includes('.io') || email.includes('@org') || email.includes('@secure');
    
    const loggedInUser: UserProfile = isOrg
      ? {
          ...DEFAULT_ORG_USER,
          email,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        }
      : {
          ...DEFAULT_INDIVIDUAL_USER,
          email,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        };

    setUser(loggedInUser);
    return loggedInUser;
  };

  const signupIndividual = async (data: SignupIndividualParams): Promise<UserProfile> => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      accountType: 'individual',
      phoneNumber: data.phoneNumber,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  };

  const signupOrganization = async (data: SignupOrganizationParams): Promise<UserProfile> => {
    const newUser: UserProfile = {
      id: `usr_org_${Date.now()}`,
      name: data.name,
      email: data.email,
      accountType: 'organization',
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      teamSize: data.teamSize,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const switchAccountType = (type: AccountType) => {
    if (type === 'individual') {
      setUser(DEFAULT_INDIVIDUAL_USER);
    } else {
      setUser(DEFAULT_ORG_USER);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signupIndividual,
        signupOrganization,
        logout,
        switchAccountType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
