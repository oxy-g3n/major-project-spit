'use client';

interface TimeSliderProps {
  times: string[];
  value: string;
  onChange: (time: string) => void;
}

export default function TimeSlider({ times, value, onChange }: TimeSliderProps) {
  if (!times || times.length === 0) {
    return null;
  }
  
  const currentIndex = times.indexOf(value);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onChange(times[index]);
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">
          Select Time:
        </label>
        <span className="text-sm font-semibold text-blue-600">
          {value.substring(0, 5)}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max={times.length - 1}
        value={currentIndex}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{times[0]?.substring(0, 5)}</span>
        <span>{times[Math.floor(times.length / 2)]?.substring(0, 5)}</span>
        <span>{times[times.length - 1]?.substring(0, 5)}</span>
      </div>
    </div>
  );
}
