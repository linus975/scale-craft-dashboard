
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { webhookService } from '@/services/webhookService';

export const useJobOperations = () => {
  const [loadingJobs, setLoadingJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  return {
    loadingJobs,
    handleAddJob
  };
};
