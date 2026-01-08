// ==================== Labels Only - No Mock Data ====================

export const categoryLabels: Record<string, string> = {
  electronics: 'Electronics',
  documents: 'Documents',
  jewelry: 'Jewelry',
  bags: 'Bags & Wallets',
  keys: 'Keys',
  pets: 'Pets',
  clothing: 'Clothing',
  other: 'Other',
};

export const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  matched: 'Matched',
  contacted: 'Contacted',
  closed: 'Closed',
};

// List of major Indian cities (can be replaced with API or broader list later)
export const cities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Varanasi',
  'Srinagar',
  'Amritsar',
  'Coimbatore',
  'Kochi',
  'Chandigarh',
  'Guwahati',
  'Thiruvananthapuram',
  'Other',
];

// Phone number validation (general)
export function validatePhone(phone: string): boolean {
  // Accepts numbers starting with + or 00, containing 7 to 15 digits
  const cleanPhone = phone.replace(/\s|-/g, '');
  return /^(\+|00)?[0-9]{7,15}$/.test(cleanPhone);
}

// Phone number formatting (general)
export function formatPhone(phone: string): string {
  // Remove non-numeric characters except +
  return phone.replace(/[^0-9+]/g, '');
}