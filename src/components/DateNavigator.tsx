import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onDateChange }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleTodayClick = () => {
    onDateChange(todayStr);
  };

  // Human date formatting
  const dateObj = new Date(currentDate + 'T12:00:00');
  const formattedString = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2 bg-white border border-neutral-200/90 rounded-lg p-1 shadow-2xs">
      <button
        onClick={handlePrevDay}
        className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        title="Previous Day"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2 text-sm font-semibold text-neutral-900 tabular-nums">
        <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{formattedString}</span>
        {isToday && (
          <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            Today
          </span>
        )}
      </div>

      <input
        type="date"
        value={currentDate}
        onChange={(e) => e.target.value && onDateChange(e.target.value)}
        className="sr-only"
        id="date-picker-hidden"
      />
      <label
        htmlFor="date-picker-hidden"
        className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-800 px-1.5 py-1 rounded hover:bg-neutral-100 transition-colors"
      >
        Change
      </label>

      <button
        onClick={handleNextDay}
        className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        title="Next Day"
        aria-label="Next day"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isToday && (
        <button
          onClick={handleTodayClick}
          className="ml-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
        >
          Jump to Today
        </button>
      )}
    </div>
  );
};
