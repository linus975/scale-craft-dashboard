
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { JobSection } from './JobSection';
import { convertToLegacyFormat } from '@/utils/jobFormatters';

interface JobSectionsLayoutProps {
  highPriorityJobs: any[];
  normalPriorityJobs: any[];
  completedJobs: any[];
  failedJobs: any[];
  currentView: string;
  loadingJobs: Set<string>;
  onJobClick: (job: any) => void;
  onQuantityChange: (jobId: string, change: number) => void;
  onAddJob: (jobId: string) => void;
  onRepeatJob: (jobId: string) => void;
  onRetryJob: (jobId: string) => void;
  onSectionClick: (view: string) => void;
  onViewAll: (view: string) => void;
}

export const JobSectionsLayout: React.FC<JobSectionsLayoutProps> = ({
  highPriorityJobs,
  normalPriorityJobs,
  completedJobs,
  failedJobs,
  currentView,
  loadingJobs,
  onJobClick,
  onQuantityChange,
  onAddJob,
  onRepeatJob,
  onRetryJob,
  onSectionClick,
  onViewAll
}) => {
  return (
    <>
      {/* High Priority Queue */}
      <JobSection
        jobs={convertToLegacyFormat(highPriorityJobs)}
        title="Priority Jobs"
        icon={<ArrowUp className="h-5 w-5 text-red-500" />}
        description="High priority jobs - will be processed next"
        showQuantity={true}
        viewType="allHigh"
        currentView={currentView}
        loadingJobs={loadingJobs}
        onJobClick={onJobClick}
        onQuantityChange={onQuantityChange}
        onAddJob={onAddJob}
        onSectionClick={() => onSectionClick('allHigh')}
        onViewAll={() => onViewAll('allHigh')}
      />

      {/* Normal Priority Queue */}
      <JobSection
        jobs={convertToLegacyFormat(normalPriorityJobs)}
        title="Normal Jobs"
        icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
        description="Standard priority jobs"
        showQuantity={true}
        viewType="allNormal"
        currentView={currentView}
        loadingJobs={loadingJobs}
        onJobClick={onJobClick}
        onQuantityChange={onQuantityChange}
        onAddJob={onAddJob}
        onSectionClick={() => onSectionClick('allNormal')}
        onViewAll={() => onViewAll('allNormal')}
      />

      {/* Separator */}
      <Separator className="my-6" />

      {/* Completed Jobs */}
      <JobSection
        jobs={convertToLegacyFormat(completedJobs)}
        title="Completed Jobs"
        icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
        description="Successfully completed jobs"
        showRepeat={true}
        viewType="allCompleted"
        currentView={currentView}
        loadingJobs={loadingJobs}
        onJobClick={onJobClick}
        onRepeatJob={onRepeatJob}
        onSectionClick={() => onSectionClick('allCompleted')}
        onViewAll={() => onViewAll('allCompleted')}
      />

      {/* Failed Jobs */}
      <JobSection
        jobs={convertToLegacyFormat(failedJobs)}
        title="Failed Jobs"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        description="Jobs that encountered errors"
        showRetry={true}
        viewType="allFailed"
        currentView={currentView}
        loadingJobs={loadingJobs}
        onJobClick={onJobClick}
        onRetryJob={onRetryJob}
        onSectionClick={() => onSectionClick('allFailed')}
        onViewAll={() => onViewAll('allFailed')}
      />
    </>
  );
};
