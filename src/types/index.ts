export type ReportType = 'lost' | 'found';

export type ReportStatus = 'pending' | 'processing' | 'matched' | 'contacted' | 'closed';

export type ItemCategory = 
  | 'electronics' 
  | 'documents' 
  | 'jewelry' 
  | 'bags' 
  | 'keys' 
  | 'pets' 
  | 'clothing' 
  | 'other';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  category: ItemCategory;
  color: string;
  distinguishingMarks?: string;
  images: string[];
  location: Location;
  date: string;
  status: ReportStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMatch {
  id: string;
  lostReportId: string;
  foundReportId: string;
  imageScore: number;
  textScore: number;
  locationScore: number;
  finalScore: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'support';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'status' | 'admin' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Stats {
  totalLostReports: number;
  totalFoundReports: number;
  successfulMatches: number;
  pendingReports: number;
  matchRate: number;
}
