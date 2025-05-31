import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  ExternalLink,
  Plus,
  Minus,
  Download,
  FileCode,
  ArrowLeft,
  Settings,
  Loader2
} from 'lucide-react';
import JobCreationDialog from './JobCreationDialog';
import CurrentPrintingJobsPage from './CurrentPrintingJobsPage';
import { webhookService } from '@/services/webhookService';
import { useToast } from '@/hooks/use-toast';

const JobsTab: React.FC = () => {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'currentJobs' | 'allHigh' | 'allNormal' | 'allCompleted' | 'allFailed'>('main');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const [jobs, setJobs] = useState([
    { id: 1, name: "Custom Gear Set", status: "printing", progress: 75, material: "PLA", printer: "X1C-2", priority: "normal", count: 3, estimatedTime: "2h 45m", filePath: "/gcode/gear_set.gcode", iniFile: "/settings/gear_set.ini" },
    { id: 2, name: "Prototype Housing", status: "queued", progress: 0, material: "ABS", printer: "A1 Mini-1", priority: "high", count: 5, estimatedTime: "4h 20m", filePath: "/gcode/housing.gcode", iniFile: "/settings/housing.ini" },
    { id: 3, name: "Bracket Design", status: "completed", progress: 100, material: "PETG", printer: "X1C-1", priority: "normal", count: 2, estimatedTime: "1h 30m", filePath: "/gcode/bracket.gcode", iniFile: "/settings/bracket.ini" },
    { id: 4, name: "Enclosure Part", status: "failed", progress: 45, material: "PLA", printer: "Mk3-2", priority: "normal", count: 1, estimatedTime: "3h 15m", filePath: "/gcode/enclosure.gcode", iniFile: "/settings/enclosure.ini" },
    { id: 5, name: "Phone Case Custom", status: "queued", progress: 0, material: "TPU", printer: "X1C-1", priority: "normal", count: 4, estimatedTime: "2h 10m", filePath: "/gcode/phone_case.gcode", iniFile: "/settings/phone_case.ini" },
    { id: 6, name: "Test Print", status: "completed", progress: 100, material: "PLA", printer: "X1C-2", priority: "high", count: 1, estimatedTime: "45m", filePath: "/gcode/test.gcode", iniFile: "/settings/test.ini" },
    { id: 7, name: "Large Component", status: "failed", progress: 20, material: "ABS", printer: "Mk3-2", priority: "normal", count: 2, estimatedTime: "6h 30m", filePath: "/gcode/large.gcode", iniFile: "/settings/large.ini" },
  ]);

  if (currentView === 'currentJobs') {
    return <CurrentPrintingJobsPage onBack={() => setCurrentView('main')} />;
  }

  const handleAddJob = async (jobId: number) => {
    if (loadingJobs.has(jobId)) return; // Prevent multiple calls

    setLoadingJobs(prev => new Set(prev).add(jobId));

    try {
      await webhookService.classifyJob(jobId.toString());
      
      toast({
        title: "Job Classification Started",
        description: `Job ${jobId} has been sent for classification.`,
      });

      // Optionally update job status
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'classifying' }
          : job
      ));

    } catch (error) {
      console.error('Error starting job classification:', error);
      toast({
        title: "Error",
        description: "Failed to start job classification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

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

  const handleCreateJob = (jobData: any) => {
    const newJob = {
      ...jobData,
      id: Date.now(),
      name: jobData.designName,
      status: 'queued',
      progress: 0,
      count: jobData.quantity || 1,
      estimatedTime: "2h 30m",
      filePath: "/gcode/new_job.gcode",
      iniFile: "/settings/new_job.ini"
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

  const handleRepeatJob = (jobId: number) => {
    const jobToRepeat = jobs.find(job => job.id === jobId);
    if (jobToRepeat) {
      const newJob = {
        ...jobToRepeat,
        id: Date.now(),
        status: 'queued',
        progress: 0,
        name: `${jobToRepeat.name} (Copy)`
      };
      setJobs(prev => [...prev, newJob]);
    }
  };

  const handleQuantityChange = (jobId: number, change: number) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, count: Math.max(1, job.count + change) }
        : job
    ));
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const handleDownloadGCode = (filePath: string, fileName: string) => {
    console.log(`Downloading GCode from ${filePath} as ${fileName}`);
    // In a real app, this would trigger a file download
  };

  const handleDownloadIni = (iniPath: string, fileName: string) => {
    console.log(`Downloading INI file from ${iniPath} as ${fileName}`);
    // In a real app, this would trigger a file download
  };

  const handlePriorityChange = (jobId: number, newPriority: 'high' | 'normal') => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, priority: newPriority }
        : job
    ));
    
    // Close the dialog and show a success message
    setIsJobDetailOpen(false);
    console.log(`Job priority changed to ${newPriority}`);
  };

  // Separate jobs by priority and status
  const printingJobs = jobs.filter(job => job.status === 'printing');
  const highPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'high');
  const normalPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'normal');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  const renderJobSection = (jobs: any[], title: string, icon: React.ReactNode, description: string, showRetry?: boolean, showQuantity?: boolean, showRepeat?: boolean, viewType?: string, allowJobClick: boolean = true, showAddButton: boolean = false) => {
    if (jobs.length === 0 && !showAddButton) return null;

    const displayJobs = currentView === 'main' ? jobs.slice(0, 3) : jobs;
    const hasMoreJobs = jobs.length > 3 && currentView === 'main';

    return (
      <Card 
        className={`bg-slate-50/50 border border-slate-200 ${currentView === 'main' && viewType ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={currentView === 'main' && viewType ? () => setCurrentView(viewType as any) : undefined}
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
              {showAddButton && currentView !== 'main' && (
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsJobDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Job
                </Button>
              )}
              {hasMoreJobs && viewType && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView(viewType as any);
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
            {displayJobs.map((job, index) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div className="flex items-center gap-2">
                    {job.priority && getPriorityIcon(job.priority)}
                    <div>
                      <h4 
                        className={`font-medium text-slate-900 ${allowJobClick ? 'cursor-pointer hover:text-blue-600' : ''}`} 
                        onClick={allowJobClick ? (e) => {
                          e.stopPropagation();
                          handleJobClick(job);
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
                  {showQuantity && (job.status === 'queued') && (
                    <div className="flex items-center gap-1 mr-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(job.id, -1);
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
                          handleQuantityChange(job.id, 1);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Add Job Button for queued jobs */}
                  {job.status === 'queued' && (
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddJob(job.id);
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
                  {showRetry && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetryJob(job.id);
                      }}
                      className="ml-2"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  {showRepeat && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepeatJob(job.id);
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
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle different views
  if (currentView === 'allHigh') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to QueueBoard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Priority Jobs</h2>
            <p className="text-slate-600">High priority jobs in the queue</p>
          </div>
        </div>
        {renderJobSection(highPriorityQueued, "Priority Jobs", <ArrowUp className="h-5 w-5 text-red-500" />, "High priority jobs", false, true, false, undefined, true, true)}
      </div>
    );
  }

  if (currentView === 'allNormal') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to QueueBoard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Normal Jobs</h2>
            <p className="text-slate-600">Standard priority jobs in the queue</p>
          </div>
        </div>
        {renderJobSection(normalPriorityQueued, "Normal Jobs", <ArrowDown className="h-5 w-5 text-blue-500" />, "Standard priority jobs", false, true, false, undefined, true, true)}
      </div>
    );
  }

  if (currentView === 'allCompleted') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to QueueBoard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Completed Jobs</h2>
            <p className="text-slate-600">Successfully completed jobs</p>
          </div>
        </div>
        {renderJobSection(completedJobs, "Completed Jobs", <CheckCircle className="h-5 w-5 text-blue-500" />, "Successfully completed jobs", false, false, true, undefined, true)}
      </div>
    );
  }

  if (currentView === 'allFailed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to QueueBoard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Failed Jobs</h2>
            <p className="text-slate-600">Jobs that encountered errors</p>
          </div>
        </div>
        {renderJobSection(failedJobs, "Failed Jobs", <AlertCircle className="h-5 w-5 text-red-500" />, "Jobs that encountered errors", true, false, false, undefined, true)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">QueueBoard</h2>
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
        {/* Currently Printing - Pure Link */}
        <Card className="bg-green-50/50 border border-green-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('currentJobs')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-green-500" />
                <div>
                  <CardTitle className="text-lg">Active Jobs</CardTitle>
                  <CardDescription className="text-sm">Jobs currently being printed</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white">
                  {printingJobs.length}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('currentJobs');
                }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Active Jobs
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* High Priority Queue */}
        {renderJobSection(
          highPriorityQueued, 
          "Priority Jobs", 
          <ArrowUp className="h-5 w-5 text-red-500" />,
          "High priority jobs - will be processed next",
          false,
          true,
          false,
          'allHigh'
        )}

        {/* Normal Priority Queue */}
        {renderJobSection(
          normalPriorityQueued, 
          "Normal Jobs", 
          <ArrowDown className="h-5 w-5 text-blue-500" />,
          "Standard priority jobs",
          false,
          true,
          false,
          'allNormal'
        )}

        {/* Separator */}
        <Separator className="my-6" />

        {/* Completed Jobs */}
        {renderJobSection(
          completedJobs,
          "Completed Jobs", 
          <CheckCircle className="h-5 w-5 text-blue-500" />,
          "Successfully completed jobs",
          false,
          false,
          true,
          'allCompleted'
        )}

        {/* Failed Jobs */}
        {renderJobSection(
          failedJobs,
          "Failed Jobs", 
          <AlertCircle className="h-5 w-5 text-red-500" />,
          "Jobs that encountered errors",
          true,
          false,
          false,
          'allFailed'
        )}
      </div>

      <JobCreationDialog
        isOpen={isJobDialogOpen}
        onClose={() => setIsJobDialogOpen(false)}
        onCreateJob={handleCreateJob}
      />

      {/* Job Detail Dialog */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Job Details - {selectedJob?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this print job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
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
                      onClick={() => handlePriorityChange(selectedJob.id, 'high')}
                      className="flex items-center gap-1"
                    >
                      <ArrowUp className="h-3 w-3" />
                      High Priority
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedJob.priority === 'normal' ? 'default' : 'outline'}
                      onClick={() => handlePriorityChange(selectedJob.id, 'normal')}
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
                    onClick={() => {
                      handleAddJob(selectedJob.id);
                      setIsJobDetailOpen(false);
                    }}
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
                    onClick={() => {
                      handleRepeatJob(selectedJob.id);
                      setIsJobDetailOpen(false);
                    }}
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
                  onClick={() => handleDownloadGCode(selectedJob.filePath, `${selectedJob.name}.gcode`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download G-Code
                </Button>
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={() => handleDownloadIni(selectedJob.iniFile, `${selectedJob.name}.ini`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Download INI File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsTab;
