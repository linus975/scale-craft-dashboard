
import React, { useState } from 'react';
import JobCreationDialog from './JobCreationDialog';
import CurrentPrintingJobsPage from './CurrentPrintingJobsPage';
import { JobDetailDialog } from './jobs/JobDetailDialog';
import { JobViewHeader } from './jobs/JobViewHeader';
import { JobsHeader } from './jobs/JobsHeader';
import { ActiveJobsCard } from './jobs/ActiveJobsCard';
import { JobSectionsLayout } from './jobs/JobSectionsLayout';
import { JobSection } from './jobs/JobSection';
import { useJobsIntegration } from '@/hooks/useJobsIntegration';
import { useJobOperations } from '@/hooks/useJobOperations';
import { convertToLegacyFormat } from '@/utils/jobFormatters';
import { 
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const JobsTab: React.FC = () => {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'currentJobs' | 'allHigh' | 'allNormal' | 'allCompleted' | 'allFailed'>('main');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  const { loadingJobs, handleAddJob } = useJobOperations();

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
      <JobsHeader onAddJob={() => setIsJobDialogOpen(true)} />

      <div className="space-y-6">
        {/* Currently Printing - with equal spacing top and bottom */}
        <ActiveJobsCard 
          activeJobsCount={actuallyPrintingJobs.length}
          onViewActiveJobs={() => setCurrentView('currentJobs')}
        />

        <JobSectionsLayout
          highPriorityJobs={highPriorityJobs}
          normalPriorityJobs={normalPriorityJobs}
          completedJobs={completedJobs}
          failedJobs={failedJobs}
          currentView={currentView}
          loadingJobs={loadingJobs}
          onJobClick={handleJobClick}
          onQuantityChange={handleQuantityChangeWrapper}
          onAddJob={handleAddJob}
          onRepeatJob={handleRepeatJob}
          onRetryJob={handleRetryJob}
          onSectionClick={setCurrentView}
          onViewAll={setCurrentView}
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
