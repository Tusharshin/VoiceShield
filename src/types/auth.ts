export type AccountType = 'individual' | 'organization';

export type OrganizationType = 
  | 'Security & Fraud'
  | 'Media & Journalism'
  | 'Finance & Banking'
  | 'Customer Support'
  | 'Healthcare'
  | 'Technology'
  | 'Other Enterprise';

export type TeamSize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  phoneNumber?: string;
  organizationName?: string;
  organizationType?: OrganizationType | string;
  teamSize?: TeamSize | string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}
