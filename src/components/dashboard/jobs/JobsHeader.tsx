
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface JobsHeaderProps {
  onAddJob: () => void;
}

export const JobsHeader: React.FC<JobsHeaderProps> = ({ onAddJob }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">QueueBoard</h2>
        <p className="text-slate-600">Monitor and manage your print queue with priority management</p>
      </div>
      <Button 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        onClick={onAddJob}
      >
        <Play className="h-4 w-4 mr-2" />
        Add Job
      </Button>
    </div>
  );
};
