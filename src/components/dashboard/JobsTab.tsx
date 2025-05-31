import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import JobCreationDialog from './JobCreationDialog';
import CurrentPrintingJobsPage from './CurrentPrintingJobsPage';
import { JobSection } from './jobs/JobSection';
import { JobDetailDialog } from './jobs/JobDetailDialog';
import { JobViewHeader } from './jobs/JobViewHeader';
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
    if (loadingJobs.has(jobId)) return;

    setLoadingJobs(prev => new Set(prev).add(jobId));

    try {
      await webhookService.classifyJob(jobId.toString());
      
      toast({
        title: "Job Classification Started",
        description: `Job ${jobId} has been sent for classification.`,
      });

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
  };

  const handleDownloadIni = (iniPath: string, fileName: string) => {
    console.log(`Downloading INI file from ${iniPath} as ${fileName}`);
  };

  const handlePriorityChange = (jobId: number, newPriority: 'high' | 'normal') => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, priority: newPriority }
        : job
    ));
    
    setIsJobDetailOpen(false);
    console.log(`Job priority changed to ${newPriority}`);
  };

  // Separate jobs by priority and status
  const printingJobs = jobs.filter(job => job.status === 'printing');
  const highPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'high');
  const normalPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'normal');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  // Handle different views
  if (currentView === 'allHigh') {
    return (
      <div className="space-y-6">
        <JobViewHeader 
          title="All Priority Jobs"
          description="High priority jobs in the queue"
          onBack={() => setCurrentView('main')}
        />
        <JobSection
          jobs={highPriorityQueued}
          title="Priority Jobs"
          icon={<ArrowUp className="h-5 w-5 text-red-500" />}
          description="High priority jobs"
          showQuantity={true}
          showAddButton={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChange}
          onAddJob={handleAddJob}
          onAddNewJob={() => setIsJobDialogOpen(true)}
        />
      </div>
    );
  }

  if (currentView === 'allNormal') {
    return (
      <div className="space-y-6">
        <JobViewHeader 
          title="All Normal Jobs"
          description="Standard priority jobs in the queue"
          onBack={() => setCurrentView('main')}
        />
        <JobSection
          jobs={normalPriorityQueued}
          title="Normal Jobs"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
          description="Standard priority jobs"
          showQuantity={true}
          showAddButton={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChange}
          onAddJob={handleAddJob}
          onAddNewJob={() => setIsJobDialogOpen(true)}
        />
      </div>
    );
  }

  if (currentView === 'allCompleted') {
    return (
      <div className="space-y-6">
        <JobViewHeader 
          title="All Completed Jobs"
          description="Successfully completed jobs"
          onBack={() => setCurrentView('main')}
        />
        <JobSection
          jobs={completedJobs}
          title="Completed Jobs"
          icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
          description="Successfully completed jobs"
          showRepeat={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onRepeatJob={handleRepeatJob}
        />
      </div>
    );
  }

  if (currentView === 'allFailed') {
    return (
      <div className="space-y-6">
        <JobViewHeader 
          title="All Failed Jobs"
          description="Jobs that encountered errors"
          onBack={() => setCurrentView('main')}
        />
        <JobSection
          jobs={failedJobs}
          title="Failed Jobs"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          description="Jobs that encountered errors"
          showRetry={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onRetryJob={handleRetryJob}
        />
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
          Add Job
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
        <JobSection
          jobs={highPriorityQueued}
          title="Priority Jobs"
          icon={<ArrowUp className="h-5 w-5 text-red-500" />}
          description="High priority jobs - will be processed next"
          showQuantity={true}
          viewType="allHigh"
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChange}
          onAddJob={handleAddJob}
          onSectionClick={() => setCurrentView('allHigh')}
          onViewAll={() => setCurrentView('allHigh')}
        />

        {/* Normal Priority Queue */}
        <JobSection
          jobs={normalPriorityQueued}
          title="Normal Jobs"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
          description="Standard priority jobs"
          showQuantity={true}
          viewType="allNormal"
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChange}
          onAddJob={handleAddJob}
          onSectionClick={() => setCurrentView('allNormal')}
          onViewAll={() => setCurrentView('allNormal')}
        />

        {/* Separator */}
        <Separator className="my-6" />

        {/* Completed Jobs */}
        <JobSection
          jobs={completedJobs}
          title="Completed Jobs"
          icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
          description="Successfully completed jobs"
          showRepeat={true}
          viewType="allCompleted"
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onRepeatJob={handleRepeatJob}
          onSectionClick={() => setCurrentView('allCompleted')}
          onViewAll={() => setCurrentView('allCompleted')}
        />

        {/* Failed Jobs */}
        <JobSection
          jobs={failedJobs}
          title="Failed Jobs"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          description="Jobs that encountered errors"
          showRetry={true}
          viewType="allFailed"
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onRetryJob={handleRetryJob}
          onSectionClick={() => setCurrentView('allFailed')}
          onViewAll={() => setCurrentView('allFailed')}
        />
      </div>

      <JobCreationDialog
        isOpen={isJobDialogOpen}
        onClose={() => setIsJobDialogOpen(false)}
        onCreateJob={handleCreateJob}
      />

      <JobDetailDialog
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        selectedJob={selectedJob}
        loadingJobs={loadingJobs}
        onPriorityChange={handlePriorityChange}
        onAddJob={handleAddJob}
        onRepeatJob={handleRepeatJob}
        onDownloadGCode={handleDownloadGCode}
        onDownloadIni={handleDownloadIni}
      />
    </div>
  );
};

export default JobsTab;
