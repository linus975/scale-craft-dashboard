
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface JobViewHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export const JobViewHeader: React.FC<JobViewHeaderProps> = ({
  title,
  description,
  onBack
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to QueueBoard
      </Button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
};
