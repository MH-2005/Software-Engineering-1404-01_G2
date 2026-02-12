import React, { useMemo } from 'react';
import MultiRangeSlider, { RangeSection } from '@/components/ui/MultiRangeSlider';
import TripItemCard from '@/components/TripItemCard';
import { TripItemWithDay } from '@/types/trip';

interface TimelineProps {
  title: string;
  items: TripItemWithDay[];
  totalDays: number;
  onItemTimeChange: (itemId: string, startTime: string, endTime: string) => void;
  onDeleteItem: (itemId: string) => void;
  onSuggestAlternative: (itemId: string) => void;
  color: string;
}

// Constants for timeline visualization
const MINUTES_PER_PIXEL = 0.5; // 0.5 minute per pixel (larger timeline)
const CARD_MAX_WIDTH = 500;
const TIMELINE_START_HOUR = 0; // 00:00
const TIMELINE_END_HOUR = 24; // 24:00

const Timeline: React.FC<TimelineProps> = ({
  title,
  items,
  totalDays,
  onItemTimeChange,
  onDeleteItem,
  onSuggestAlternative,
  color,
}) => {
  // Convert time string (HH:MM) and day to minutes from trip start
  const timeToMinutesFromTripStart = (time: string, dayNumber: number): number => {
    const [hours, minutes] = time.split(':').map(Number);
    const minutesInDay = hours * 60 + minutes;
    const dayOffset = (dayNumber - 1) * 24 * 60; // Convert day to minutes
    return dayOffset + minutesInDay;
  };

  // Convert minutes from trip start to time string (HH:MM)
  const minutesToTime = (minutes: number): string => {
    const minutesInDay = minutes % (24 * 60);
    const hours = Math.floor(minutesInDay / 60);
    const mins = minutesInDay % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate total timeline in minutes (all days)
  const totalMinutes = totalDays * 24 * 60;
  
  // Calculate total timeline width in pixels
  const timelineWidth = totalMinutes / MINUTES_PER_PIXEL;

  // Convert items to range sections
  const rangeSections: RangeSection[] = useMemo(() => {
    return items.map((item) => ({
      start: timeToMinutesFromTripStart(item.start_time, item.day_number),
      end: timeToMinutesFromTripStart(item.end_time, item.day_number),
    }));
  }, [items, totalDays]);

  // Handle range changes
  const handleRangeChange = (sections: RangeSection[]) => {
    sections.forEach((section, index) => {
      const item = items[index];
      if (item) {
        const newStartTime = minutesToTime(section.start);
        const newEndTime = minutesToTime(section.end);
        
        if (newStartTime !== item.start_time || newEndTime !== item.end_time) {
          onItemTimeChange(item.id, newStartTime, newEndTime);
        }
      }
    });
  };

  // Calculate card positions and widths
  const cardPositions = useMemo(() => {
    return items.map((item) => {
      const startMinutes = timeToMinutesFromTripStart(item.start_time, item.day_number);
      const endMinutes = timeToMinutesFromTripStart(item.end_time, item.day_number);
      const durationMinutes = endMinutes - startMinutes;
      // Use exact same formula for both width and position
      const width = Math.min(durationMinutes / MINUTES_PER_PIXEL, CARD_MAX_WIDTH);
      const translateX = endMinutes / MINUTES_PER_PIXEL - width;

      return { width, translateX };
    });
  }, [items, totalDays]);

  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Timeline Header */}
      <div className="mb-6 pb-4 border-b-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>

      {/* Timeline Track */}
      <div className="relative" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ width: `${timelineWidth}px`, minWidth: '100%', position: 'relative' }}>
          {/* Cards Container */}
          <div className="relative mb-4" style={{ height: '240px' }}>
            {items.map((item, index) => {
              const { width, translateX } = cardPositions[index];
              return (
                <div
                  key={item.id}
                  className="absolute top-0 left-0"
                  style={{ 
                    transform: `translateX(${translateX}px)`,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <TripItemCard
                    item={item}
                    width={width}
                    maxWidth={CARD_MAX_WIDTH}
                    onDelete={onDeleteItem}
                    onSuggestAlternative={onSuggestAlternative}
                  />
                </div>
              );
            })}
          </div>

          {/* Slider with custom thumbs showing time */}
          <MultiRangeSlider
            sections={rangeSections}
            min={0}
            max={totalMinutes}
            step={15}
            onChange={handleRangeChange}
            activeColor={color}
            gapColor="#e2e8f0"
            renderThumb={(params: any) => {
              const item = items[params.sectionIndex];
              const time = params.isStartThumb ? item?.start_time : item?.end_time;

              return (
                <div
                  {...params.props}
                  key={params.props.key}
                  style={{
                    ...params.props.style,
                    height: '32px',
                    width: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.25)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'grab',
                    outline: 'none',
                    border: `2px solid ${color}`,
                  }}
                >
                  <div
                    className="absolute top-full mt-2 text-xs font-semibold text-gray-700 whitespace-nowrap"
                    style={{ pointerEvents: 'none' }}
                  >
                    {time}
                  </div>
                </div>
              );
            }}
          />

          {/* Time markers */}
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {[0, 4, 8, 12, 16, 20, 24].map((hour) => (
              <span key={hour}>{hour.toString().padStart(2, '0')}:00</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
