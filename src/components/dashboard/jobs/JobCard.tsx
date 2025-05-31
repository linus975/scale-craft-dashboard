
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface JobCardProps {
  job: any;
  allowJobClick?: boolean;
  showQuantity?: boolean;
  showRetry?: boolean;
  showRepeat?: boolean;
  loadingJobs: Set<number>;
  onJobClick?: (job: any) => void;
  onQuantityChange?: (jobId: number, change: number) => void;
  onAddJob?: (jobId: number) => void;
  onRetryJob?: (jobId: number) => void;
  onRepeatJob?: (jobId: number) => void;
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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing': return <Play className="h-4 w-4 text-green-500" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
      case 'classifying': return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'bg-green-100 text-green-800 border-green-200';
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'classifying': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'printing': return 'Printing';
      case 'queued': return 'Queued';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'paused': return 'Paused';
      case 'classifying': return 'Classifying';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? 
      <ArrowUp className="h-3 w-3 text-red-500" /> : 
      <ArrowDown className="h-3 w-3 text-blue-500" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        {getStatusIcon(job.status)}
        <div className="flex items-center gap-2">
          {job.priority && getPriorityIcon(job.priority)}
          <div>
            <h4 
              className={`font-medium text-slate-900 ${allowJobClick ? 'cursor-pointer hover:text-blue-600' : ''}`} 
              onClick={allowJobClick && onJobClick ? (e) => {
                e.stopPropagation();
                onJobClick(job);
              } : undefined}
            >
              {job.name} ({job.count})
            </h4>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{job.printer}</span>
              <span>•</span>
              <span>{job.material}</span>
              {job.progress > 0 && (
                <>
                  <span>•</span>
                  <span>{job.progress}% complete</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showQuantity && (job.status === 'queued') && onQuantityChange && (
          <div className="flex items-center gap-1 mr-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(job.id, -1);
              }}
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-8 text-center">{job.count}</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(job.id, 1);
              }}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {/* Add Job Button for queued jobs */}
        {job.status === 'queued' && onAddJob && (
          <Button 
            size="sm" 
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onAddJob(job.id);
            }}
            disabled={loadingJobs.has(job.id)}
            className="ml-2"
          >
            {loadingJobs.has(job.id) ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            Add Job
          </Button>
        )}

        <Badge className={getStatusColor(job.status)}>
          {getStatusText(job.status)}
        </Badge>
        {showRetry && onRetryJob && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRetryJob(job.id);
            }}
            className="ml-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        {showRepeat && onRepeatJob && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRepeatJob(job.id);
            }}
            className="ml-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Repeat
          </Button>
        )}
        {job.status === 'printing' && (
          <div className="w-16 bg-slate-200 rounded-full h-2 ml-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};
