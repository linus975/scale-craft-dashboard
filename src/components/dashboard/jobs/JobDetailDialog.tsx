
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  RotateCcw, 
  Download, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Settings,
  Clock,
  Printer
} from 'lucide-react';

interface JobDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: any;
  loadingJobs: Set<string>; // Changed from Set<number> to Set<string>
  onPriorityChange?: (jobId: string, newPriority: 'high' | 'normal') => void; // Changed from number to string
  onAddJob?: (jobId: string) => void; // Changed from number to string
  onRepeatJob?: (jobId: string) => void; // Changed from number to string
  onDownloadGCode?: (filePath: string, fileName: string) => void;
  onDownloadIni?: (iniPath: string, fileName: string) => void;
}

export const JobDetailDialog: React.FC<JobDetailDialogProps> = ({
  isOpen,
  onClose,
  selectedJob,
  loadingJobs,
  onPriorityChange,
  onAddJob,
  onRepeatJob,
  onDownloadGCode,
  onDownloadIni
}) => {
  if (!selectedJob) return null;

  const isLoading = loadingJobs.has(selectedJob.id);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Details: {selectedJob.name}
          </DialogTitle>
          <DialogDescription>
            Job Number: {selectedJob.job_number || selectedJob.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
              <Badge className={getStatusColor(selectedJob.status)}>
                {selectedJob.status}
              </Badge>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600 mb-1">Priority</div>
              <Badge className={getPriorityColor(selectedJob.priority)}>
                {selectedJob.priority === 'high' ? 'High Priority' : 'Normal Priority'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Material</div>
              <div className="text-sm">{selectedJob.material || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Quantity</div>
              <div className="text-sm">{selectedJob.count || selectedJob.quantity || 1}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Estimated Time</div>
              <div className="text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedJob.estimatedTime || 'Not calculated'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Printer</div>
              <div className="text-sm flex items-center gap-1">
                <Printer className="h-4 w-4" />
                {selectedJob.printer || 'Auto-assign'}
              </div>
            </div>
          </div>

          {selectedJob.progress !== undefined && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${selectedJob.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{selectedJob.progress}% complete</div>
              </div>
            </>
          )}

          <Separator />

          {/* Priority Change Buttons */}
          {onPriorityChange && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Change Priority</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPriorityChange(selectedJob.id, 'high')}
                  disabled={selectedJob.priority === 'high' || isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  Set High Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPriorityChange(selectedJob.id, 'normal')}
                  disabled={selectedJob.priority === 'normal' || isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  Set Normal Priority
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {onAddJob && selectedJob.status === 'queued' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddJob(selectedJob.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isLoading ? 'Processing...' : 'Start Job'}
              </Button>
            )}

            {onRepeatJob && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRepeatJob(selectedJob.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Repeat Job
              </Button>
            )}

            {onDownloadGCode && selectedJob.filePath && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadGCode(selectedJob.filePath, `${selectedJob.name}.gcode`)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download G-Code
              </Button>
            )}

            {onDownloadIni && selectedJob.iniFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadIni(selectedJob.iniFile, `${selectedJob.name}.ini`)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Download Settings
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
