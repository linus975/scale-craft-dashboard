
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
import { useJobsIntegration } from '@/hooks/useJobsIntegration';

const JobsTab: React.FC = () => {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'currentJobs' | 'allHigh' | 'allNormal' | 'allCompleted' | 'allFailed'>('main');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Use the new print jobs system
  const {
    printJobs,
    printing,
    highPriorityJobs,
    normalPriorityJobs,
    completedJobs,
    failedJobs,
    handleRetryJob,
    handlePriorityChange,
    handleQuantityChange,
    duplicatePrintJob,
    refetch
  } = useJobsIntegration();

  // Trigger refetch when needed
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  if (currentView === 'currentJobs') {
    return <CurrentPrintingJobsPage onBack={() => setCurrentView('main')} />;
  }

  const handleAddJob = async (jobId: string) => {
    if (loadingJobs.has(jobId)) return;

    setLoadingJobs(prev => new Set(prev).add(jobId));

    try {
      await webhookService.classifyJob(jobId);
      
      toast({
        title: "Job Classification Started",
        description: `Job ${jobId} has been sent for classification.`,
      });

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

  const handleRepeatJob = async (jobId: string) => {
    try {
      await duplicatePrintJob(jobId);
    } catch (error) {
      console.error('Error duplicating job:', error);
    }
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

  const handlePriorityChangeWrapper = async (jobId: string, newPriority: 'high' | 'normal') => {
    try {
      await handlePriorityChange(jobId, newPriority === 'high' ? 9 : 5);
      setIsJobDetailOpen(false);
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const handleQuantityChangeWrapper = async (jobId: string, change: number) => {
    const job = printJobs.find(j => j.id === jobId);
    if (job) {
      const newQuantity = Math.max(1, job.quantity + change);
      await handleQuantityChange(jobId, newQuantity);
    }
  };

  // Convert print jobs to legacy format for display
  const convertToLegacyFormat = (jobs: any[]) => {
    return jobs.map(job => ({
      id: job.id,
      name: job.product_name,
      status: job.status === 'waiting_for_classifying' ? 'queued' : 
              job.status === 'ready_to_print' ? 'queued' :
              job.status === 'done' ? 'completed' : job.status,
      progress: job.status === 'completed' || job.status === 'done' ? 100 : 0,
      material: job.material,
      printer: job.printer_id,
      priority: job.priority > 7 ? 'high' : 'normal',
      count: job.quantity,
      estimatedTime: "2h 30m", // Default estimate
      filePath: job.gcode_file_path || "/gcode/default.gcode",
      iniFile: "/settings/default.ini",
      job_number: job.job_number
    }));
  };

  // Filter for only actually printing jobs (not dummy data)
  const actuallyPrintingJobs = printing.filter(job => job.status === 'printing');

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
          jobs={convertToLegacyFormat(highPriorityJobs)}
          title="Priority Jobs"
          icon={<ArrowUp className="h-5 w-5 text-red-500" />}
          description="High priority jobs"
          showQuantity={true}
          showAddButton={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChangeWrapper}
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
          jobs={convertToLegacyFormat(normalPriorityJobs)}
          title="Normal Jobs"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
          description="Standard priority jobs"
          showQuantity={true}
          showAddButton={true}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChangeWrapper}
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
          jobs={convertToLegacyFormat(completedJobs)}
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
          jobs={convertToLegacyFormat(failedJobs)}
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

      <div className="space-y-6">
        {/* Currently Printing - with equal spacing top and bottom */}
        <Card className="bg-green-50/50 border border-green-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('currentJobs')}>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-green-500" />
                <div>
                  <CardTitle className="text-lg">Active Jobs</CardTitle>
                  <CardDescription className="text-sm">Jobs currently being printed</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white">
                  {actuallyPrintingJobs.length}
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
          jobs={convertToLegacyFormat(highPriorityJobs)}
          title="Priority Jobs"
          icon={<ArrowUp className="h-5 w-5 text-red-500" />}
          description="High priority jobs - will be processed next"
          showQuantity={true}
          viewType="allHigh"
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChangeWrapper}
          onAddJob={handleAddJob}
          onSectionClick={() => setCurrentView('allHigh')}
          onViewAll={() => setCurrentView('allHigh')}
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
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChangeWrapper}
          onAddJob={handleAddJob}
          onSectionClick={() => setCurrentView('allNormal')}
          onViewAll={() => setCurrentView('allNormal')}
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
          onJobClick={handleJobClick}
          onRepeatJob={handleRepeatJob}
          onSectionClick={() => setCurrentView('allCompleted')}
          onViewAll={() => setCurrentView('allCompleted')}
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
          onJobClick={handleJobClick}
          onRetryJob={handleRetryJob}
          onSectionClick={() => setCurrentView('allFailed')}
          onViewAll={() => setCurrentView('allFailed')}
        />
      </div>

      <JobCreationDialog
        isOpen={isJobDialogOpen}
        onClose={() => setIsJobDialogOpen(false)}
      />

      <JobDetailDialog
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        selectedJob={selectedJob}
        loadingJobs={loadingJobs}
        onPriorityChange={handlePriorityChangeWrapper}
        onAddJob={handleAddJob}
        onRepeatJob={handleRepeatJob}
        onDownloadGCode={handleDownloadGCode}
        onDownloadIni={handleDownloadIni}
      />
    </div>
  );
};

export default JobsTab;
