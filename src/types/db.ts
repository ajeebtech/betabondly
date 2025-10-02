export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  inviteCode: string | null;
  coupleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  code: string;
  createdBy: string; // User ID
  createdAt: string;
  used: boolean;
  usedBy: string | null; // User ID
  usedAt: string | null;
}

export interface Couple {
  id: string; // Same as invite code
  members: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}
