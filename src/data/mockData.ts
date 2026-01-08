// ==================== Labels Only - No Mock Data ====================

export const categoryLabels: Record<string, string> = {
  electronics: 'إلكترونيات',
  documents: 'وثائق',
  jewelry: 'مجوهرات',
  bags: 'حقائب ومحافظ',
  keys: 'مفاتيح',
  pets: 'حيوانات أليفة',
  clothing: 'ملابس',
  other: 'أخرى',
};

export const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'جاري الفحص',
  matched: 'تم التطابق',
  contacted: 'تم التواصل',
  closed: 'مغلق',
};

// قائمة مدن عامة (يمكن استبدالها بـ API أو قائمة أوسع لاحقاً)
export const cities = [
  'الرياض',
  'جدة',
  'الدمام',
  'دبي',
  'أبو ظبي',
  'الكويت',
  'المنامة',
  'الدوحة',
  'مسقط',
  'بيروت',
  'عمّان',
  'القاهرة',
  'الإسكندرية',
  'الدار البيضاء',
  'تونس',
  'الجزائر',
  'خرطوم',
  'بغداد',
  'أربيل',
  'صنعاء',
  'عدن',
  'أخرى',
];

// التحقق من رقم الجوال (عام)
export function validatePhone(phone: string): boolean {
  // يقبل الأرقام التي تبدأ بـ + أو 00، وتحتوي على 7 إلى 15 رقم
  const cleanPhone = phone.replace(/\s|-/g, '');
  return /^(\+|00)?[0-9]{7,15}$/.test(cleanPhone);
}

// تنسيق رقم الجوال (عام)
export function formatPhone(phone: string): string {
  // إزالة الرموز غير الرقمية ما عدا +
  return phone.replace(/[^0-9+]/g, '');
}
