
import { usePrintJobs } from './usePrintJobs';
import { getJobStatusBadgeColor, getSourceTypeBadgeColor } from '@/utils/printJobUtils';

export const useJobsIntegration = () => {
  const { printJobs, loading, createPrintJob, updatePrintJob, duplicatePrintJob, deletePrintJob, refetch } = usePrintJobs();

  // Filter jobs by status
  const activeJobs = printJobs.filter(job => job.status === 'in_progress');
  const queuedJobs = printJobs.filter(job => ['waiting', 'ready', 'queued'].includes(job.status || ''));
  const highPriorityJobs = queuedJobs.filter(job => (job.priority || 0) > 7);
  const normalPriorityJobs = queuedJobs.filter(job => (job.priority || 0) <= 7);
  const completedJobs = printJobs.filter(job => job.status === 'completed');
  const failedJobs = printJobs.filter(job => job.status === 'failed');

  const handleCreateJobFromDesign = async (designData: any) => {
    try {
      await createPrintJob({
        product_name: designData.designName || designData.name,
        product_id: designData.designId,
        ean_number: designData.eanNumber,
        quantity: designData.quantity || 1,
        material: designData.material,
        priority: designData.priority === 'high' ? 9 : 5,
        source_type: 'manual',
        notes: designData.notes
      });
    } catch (error) {
      console.error('Error creating job from design:', error);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await updatePrintJob(jobId, {
        status: 'waiting',
        failure_reason: null,
        queued_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const handlePriorityChange = async (jobId: string, newPriority: number) => {
    try {
      await updatePrintJob(jobId, { priority: newPriority });
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const handleQuantityChange = async (jobId: string, newQuantity: number) => {
    try {
      await updatePrintJob(jobId, { quantity: Math.max(1, newQuantity) });
    } catch (error) {
      console.error('Error changing quantity:', error);
    }
  };

  return {
    // Data
    printJobs,
    loading,
    activeJobs,
    queuedJobs,
    highPriorityJobs,
    normalPriorityJobs,
    completedJobs,
    failedJobs,
    
    // Actions
    createPrintJob: handleCreateJobFromDesign,
    updatePrintJob,
    duplicatePrintJob,
    deletePrintJob,
    handleRetryJob,
    handlePriorityChange,
    handleQuantityChange,
    refetch,
    
    // Utils
    getJobStatusBadgeColor,
    getSourceTypeBadgeColor
  };
};
