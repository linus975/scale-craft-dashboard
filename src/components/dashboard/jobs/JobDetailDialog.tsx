
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  Download,
  Settings,
  Loader2
} from 'lucide-react';

interface JobDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: any | null;
  loadingJobs: Set<number>;
  onPriorityChange: (jobId: number, newPriority: 'high' | 'normal') => void;
  onAddJob: (jobId: number) => void;
  onRepeatJob: (jobId: number) => void;
  onDownloadGCode: (filePath: string, fileName: string) => void;
  onDownloadIni: (iniPath: string, fileName: string) => void;
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

  const handlePriorityChange = (newPriority: 'high' | 'normal') => {
    if (selectedJob) {
      onPriorityChange(selectedJob.id, newPriority);
      onClose();
    }
  };

  const handleAddJob = () => {
    if (selectedJob) {
      onAddJob(selectedJob.id);
      onClose();
    }
  };

  const handleRepeatJob = () => {
    if (selectedJob) {
      onRepeatJob(selectedJob.id);
      onClose();
    }
  };

  if (!selectedJob) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Job Details - {selectedJob.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this print job
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <Badge className={getStatusColor(selectedJob.status)}>
                {getStatusText(selectedJob.status)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Quantity</label>
              <p className="text-sm">{selectedJob.count} pieces</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Material</label>
              <p className="text-sm">{selectedJob.material}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Printer</label>
              <p className="text-sm">{selectedJob.printer}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Estimated Time</label>
              <p className="text-sm">{selectedJob.estimatedTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Priority</label>
              <div className="flex items-center gap-1">
                {getPriorityIcon(selectedJob.priority)}
                <span className="text-sm capitalize">{selectedJob.priority}</span>
              </div>
            </div>
          </div>
          
          {/* Priority Change Section */}
          {selectedJob.status === 'queued' && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-slate-600 block mb-2">Change Priority</label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedJob.priority === 'high' ? 'default' : 'outline'}
                  onClick={() => handlePriorityChange('high')}
                  className="flex items-center gap-1"
                >
                  <ArrowUp className="h-3 w-3" />
                  High Priority
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedJob.priority === 'normal' ? 'default' : 'outline'}
                  onClick={() => handlePriorityChange('normal')}
                  className="flex items-center gap-1"
                >
                  <ArrowDown className="h-3 w-3" />
                  Normal Priority
                </Button>
              </div>
            </div>
          )}

          {/* Add Job Section for Queued Jobs */}
          {selectedJob.status === 'queued' && (
            <div className="border-t pt-4">
              <Button 
                className="w-full mb-2" 
                onClick={handleAddJob}
                disabled={loadingJobs.has(selectedJob.id)}
              >
                {loadingJobs.has(selectedJob.id) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Job
              </Button>
            </div>
          )}

          {/* Repeat Job Section for Completed Jobs */}
          {selectedJob.status === 'completed' && (
            <div className="border-t pt-4">
              <Button 
                className="w-full mb-2" 
                onClick={handleRepeatJob}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Repeat Job
              </Button>
            </div>
          )}

          {selectedJob.progress > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-600">Progress</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedJob.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm">{selectedJob.progress}%</span>
              </div>
            </div>
          )}
          <div className="pt-4 border-t space-y-2">
            <Button 
              className="w-full" 
              onClick={() => onDownloadGCode(selectedJob.filePath, `${selectedJob.name}.gcode`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download G-Code
            </Button>
            <Button 
              variant="outline"
              className="w-full" 
              onClick={() => onDownloadIni(selectedJob.iniFile, `${selectedJob.name}.ini`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Download INI File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
