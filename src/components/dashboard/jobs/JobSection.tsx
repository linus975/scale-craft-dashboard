
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus } from 'lucide-react';
import { JobCard } from './JobCard';

interface JobSectionProps {
  jobs: any[];
  title: string;
  icon: React.ReactNode;
  description: string;
  showRetry?: boolean;
  showQuantity?: boolean;
  showRepeat?: boolean;
  viewType?: string;
  allowJobClick?: boolean;
  showAddButton?: boolean;
  currentView: string;
  loadingJobs: Set<string>; // Changed from Set<number> to Set<string>
  onJobClick?: (job: any) => void;
  onQuantityChange?: (jobId: string, change: number) => void; // Changed from number to string
  onAddJob?: (jobId: string) => void; // Changed from number to string
  onRetryJob?: (jobId: string) => void; // Changed from number to string
  onRepeatJob?: (jobId: string) => void; // Changed from number to string
  onSectionClick?: () => void;
  onViewAll?: () => void;
  onAddNewJob?: () => void;
}

export const JobSection: React.FC<JobSectionProps> = ({
  jobs,
  title,
  icon,
  description,
  showRetry = false,
  showQuantity = false,
  showRepeat = false,
  viewType,
  allowJobClick = true,
  showAddButton = false,
  currentView,
  loadingJobs,
  onJobClick,
  onQuantityChange,
  onAddJob,
  onRetryJob,
  onRepeatJob,
  onSectionClick,
  onViewAll,
  onAddNewJob
}) => {
  if (jobs.length === 0 && !showAddButton) return null;

  const displayJobs = currentView === 'main' ? jobs.slice(0, 3) : jobs;
  const hasMoreJobs = jobs.length > 3 && currentView === 'main';

  return (
    <Card 
      className={`bg-slate-50/50 border border-slate-200 ${currentView === 'main' && viewType ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onSectionClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {jobs.length}
            </Badge>
          </div>
          <div className="flex gap-2">
            {showAddButton && currentView !== 'main' && onAddNewJob && (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewJob();
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Job
              </Button>
            )}
            {hasMoreJobs && viewType && onViewAll && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAll();
                }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              allowJobClick={allowJobClick}
              showQuantity={showQuantity}
              showRetry={showRetry}
              showRepeat={showRepeat}
              loadingJobs={loadingJobs}
              onJobClick={onJobClick}
              onQuantityChange={onQuantityChange}
              onAddJob={onAddJob}
              onRetryJob={onRetryJob}
              onRepeatJob={onRepeatJob}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
