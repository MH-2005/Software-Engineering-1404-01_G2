import React, { useState } from 'react';
import { TripItem } from '@/types/trip';

interface TripItemCardProps {
  item: TripItem;
  width: number;
  maxWidth?: number;
  onDelete: (itemId: string) => void;
  onSuggestAlternative: (itemId: string) => void;
}

const TripItemCard: React.FC<TripItemCardProps> = ({
  item,
  width,
  maxWidth = 400,
  onDelete,
  onSuggestAlternative,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardWidth = Math.min(width, maxWidth);

  return (
    <div
      className="relative"
      style={{ width: `${cardWidth}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Actions Bar - Hidden by default, shown on hover */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gray-800 bg-opacity-90 rounded-t-lg px-3 py-2 flex items-center justify-end gap-2 transition-all duration-200 z-10 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={() => onSuggestAlternative(item.id)}
          className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
          title="پیشنهاد آیتم جایگزین"
        >
          <i className="fa-solid fa-wand-magic-sparkles ml-1"></i>
          پیشنهاد جایگزین
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-400 hover:text-red-300 transition-colors text-sm"
          title="حذف"
        >
          <i className="fa-solid fa-trash ml-1"></i>
          حذف
        </button>
      </div>

      {/* Card Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-[260px]">
        <div className="p-4 h-full flex flex-col">
          {/* Type Badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                item.type === 'VISIT'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {item.type === 'VISIT' ? 'بازدید' : 'اقامت'}
            </span>
            <span className="text-sm font-bold text-gray-700">
              {item.cost.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 flex-grow">
            {item.summery}
          </p>

          {/* Address & URL */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="line-clamp-1 flex-1">
              <i className="fa-solid fa-location-dot ml-1"></i>
              {item.address}
            </span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 mr-2 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                اطلاعات بیشتر
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripItemCard;
