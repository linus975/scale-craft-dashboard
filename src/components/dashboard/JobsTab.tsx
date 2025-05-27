
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye
} from 'lucide-react';
import JobCreationDialog from './JobCreationDialog';
import CurrentPrintingJobsPage from './CurrentPrintingJobsPage';

const JobsTab: React.FC = () => {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'currentJobs'>('main');
  const [highPriorityCount, setHighPriorityCount] = useState(5);
  const [normalPriorityCount, setNormalPriorityCount] = useState(10);
  const [jobs, setJobs] = useState([
    { id: 1, name: "Custom Gear Set", status: "printing", progress: 75, material: "PLA", printer: "X1C-2", priority: "normal" },
    { id: 2, name: "Prototype Housing", status: "queued", progress: 0, material: "ABS", printer: "A1 Mini-1", priority: "high" },
    { id: 3, name: "Bracket Design", status: "completed", progress: 100, material: "PETG", printer: "X1C-1", priority: "normal" },
    { id: 4, name: "Enclosure Part", status: "failed", progress: 45, material: "PLA", printer: "Mk3-2", priority: "normal" },
    { id: 5, name: "Phone Case Custom", status: "queued", progress: 0, material: "TPU", printer: "X1C-1", priority: "normal" },
  ]);

  if (currentView === 'currentJobs') {
    return <CurrentPrintingJobsPage onBack={() => setCurrentView('main')} />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing': return <Play className="h-4 w-4 text-green-500" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
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
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? 
      <ArrowUp className="h-3 w-3 text-red-500" /> : 
      <ArrowDown className="h-3 w-3 text-blue-500" />;
  };

  const handleCreateJob = (jobData: any) => {
    const newJob = {
      ...jobData,
      id: Date.now(),
      name: jobData.designName,
      status: 'queued',
      progress: 0
    };

    setJobs(prev => {
      if (jobData.priority === 'high') {
        const printingJobs = prev.filter(job => job.status === 'printing');
        const otherJobs = prev.filter(job => job.status !== 'printing');
        return [...printingJobs, newJob, ...otherJobs];
      } else {
        return [...prev, newJob];
      }
    });
  };

  const handleRetryJob = (jobId: number) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'queued', progress: 0 }
        : job
    ));
  };

  // Separate jobs by priority and status
  const printingJobs = jobs.filter(job => job.status === 'printing');
  const highPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'high');
  const normalPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'normal');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  const renderJobSection = (jobs: any[], title: string, icon: React.ReactNode, description: string, showCount?: boolean, count?: number, onCountChange?: (value: number) => void, showRetry?: boolean) => {
    if (jobs.length === 0 && !showCount) return null;

    return (
      <Card className="bg-slate-50/50 border border-slate-200">
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
            {showCount && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Max:</span>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => onCountChange?.(parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-sm"
                  min="0"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {jobs.map((job, index) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div className="flex items-center gap-2">
                    {job.priority && getPriorityIcon(job.priority)}
                    <div>
                      <h4 className="font-medium text-slate-900">{job.name}</h4>
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
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                  {showRetry && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRetryJob(job.id)}
                      className="ml-2"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
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
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Production Jobs</h2>
          <p className="text-slate-600">Monitor and manage your print queue with priority management</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => setIsJobDialogOpen(true)}
        >
          <Play className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <div className="space-y-4">
        {/* Currently Printing */}
        {printingJobs.length > 0 ? (
          <Card className="bg-green-50/50 border border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-green-500" />
                  <div>
                    <CardTitle className="text-lg">Currently Printing</CardTitle>
                    <CardDescription className="text-sm">Jobs currently being printed</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {printingJobs.length}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView('currentJobs')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {printingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-medium text-slate-900">{job.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{job.printer}</span>
                          <span>•</span>
                          <span>{job.material}</span>
                          <span>•</span>
                          <span>{job.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <div className="w-16 bg-slate-200 rounded-full h-2 ml-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* High Priority Queue */}
        {renderJobSection(
          highPriorityQueued, 
          "Priority Jobs", 
          <ArrowUp className="h-5 w-5 text-red-500" />,
          "High priority jobs - will be processed next",
          true,
          highPriorityCount,
          setHighPriorityCount
        )}

        {/* Normal Priority Queue */}
        {renderJobSection(
          normalPriorityQueued, 
          "Normal Jobs", 
          <ArrowDown className="h-5 w-5 text-blue-500" />,
          "Standard priority jobs",
          true,
          normalPriorityCount,
          setNormalPriorityCount
        )}

        {/* Completed Jobs */}
        {renderJobSection(
          completedJobs.slice(-3),
          "Completed Jobs", 
          <CheckCircle className="h-5 w-5 text-blue-500" />,
          "Successfully completed jobs (last 3)"
        )}

        {/* Failed Jobs */}
        {renderJobSection(
          failedJobs.slice(-2),
          "Failed Jobs", 
          <AlertCircle className="h-5 w-5 text-red-500" />,
          "Jobs that encountered errors (last 2)",
          false,
          undefined,
          undefined,
          true
        )}
      </div>

      <JobCreationDialog
        isOpen={isJobDialogOpen}
        onClose={() => setIsJobDialogOpen(false)}
        onCreateJob={handleCreateJob}
      />
    </div>
  );
};

export default JobsTab;
