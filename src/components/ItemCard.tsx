import React from 'react';
import { Phone, Mail, Instagram, Clock, User, Trash2 } from 'lucide-react';
import { LostFoundItem } from '../types';

interface ItemCardProps {
  item: LostFoundItem;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, showDelete, onDelete }) => {
  const formatContact = (contact: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const instagramRegex = /^@[\w\.]+$/;

    if (phoneRegex.test(contact)) {
      return { icon: Phone, text: contact, type: 'phone' };
    } else if (emailRegex.test(contact)) {
      return { icon: Mail, text: contact, type: 'email' };
    } else if (instagramRegex.test(contact)) {
      return { icon: Instagram, text: contact, type: 'instagram' };
    } else {
      return { icon: User, text: contact, type: 'other' };
    }
  };

  const contact = formatContact(item.contactInfo);
  const ContactIcon = contact.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.type === 'lost'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}
        >
          {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
        </span>
        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {item.title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {item.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <ContactIcon className="h-4 w-4" />
          <span>{contact.text}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span>{item.userDisplayName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>{item.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;