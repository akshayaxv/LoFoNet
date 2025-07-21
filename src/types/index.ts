export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  contactInfo: string;
  userId: string;
  userDisplayName: string;
  createdAt: Date;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
}