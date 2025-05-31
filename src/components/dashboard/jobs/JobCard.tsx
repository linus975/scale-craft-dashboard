
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Plus, Minus, AlertCircle } from 'lucide-react';

interface JobCardProps {
  job: any;
  allowJobClick?: boolean;
  showQuantity?: boolean;
  showRetry?: boolean;
  showRepeat?: boolean;
  loadingJobs: Set<string>; // Changed from Set<number> to Set<string>
  onJobClick?: (job: any) => void;
  onQuantityChange?: (jobId: string, change: number) => void; // Changed from number to string
  onAddJob?: (jobId: string) => void; // Changed from number to string
  onRetryJob?: (jobId: string) => void; // Changed from number to string
  onRepeatJob?: (jobId: string) => void; // Changed from number to string
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  allowJobClick = true,
  showQuantity = false,
  showRetry = false,
  showRepeat = false,
  loadingJobs,
  onJobClick,
  onQuantityChange,
  onAddJob,
  onRetryJob,
  onRepeatJob
}) => {
  const isLoading = loadingJobs.has(job.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div 
      className={`p-3 border rounded-lg hover:shadow-sm transition-shadow ${allowJobClick ? 'cursor-pointer' : ''}`}
      onClick={allowJobClick ? () => onJobClick?.(job) : undefined}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm">{job.name}</div>
          <div className="text-xs text-gray-500">#{job.job_number || job.id}</div>
        </div>
        <div className="flex gap-1">
          <Badge className={getStatusColor(job.status)} variant="outline">
            {job.status}
          </Badge>
          {job.priority && (
            <Badge className={getPriorityColor(job.priority)} variant="outline">
              {job.priority === 'high' ? 'High' : 'Normal'}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        {job.material && <span>Material: {job.material}</span>}
        {job.printer && <span>• Printer: {job.printer}</span>}
      </div>

      {job.progress !== undefined && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${job.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{job.progress}% complete</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {showQuantity && onQuantityChange && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(job.id, -1);
                }}
                disabled={isLoading || (job.count || job.quantity || 1) <= 1}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs px-2">{job.count || job.quantity || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(job.id, 1);
                }}
                disabled={isLoading}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {showRetry && onRetryJob && job.status === 'failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRetryJob(job.id);
              }}
              disabled={isLoading}
              className="h-6 px-2 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Retry</span>
            </Button>
          )}

          {showRepeat && onRepeatJob && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRepeatJob(job.id);
              }}
              disabled={isLoading}
              className="h-6 px-2 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="text-xs">Repeat</span>
            </Button>
          )}

          {onAddJob && job.status === 'queued' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddJob(job.id);
              }}
              disabled={isLoading}
              className="h-6 px-2 flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              <span className="text-xs">{isLoading ? 'Processing...' : 'Start'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
