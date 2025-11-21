import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading sensor data...</p>
      </div>
    </div>
  );
}
