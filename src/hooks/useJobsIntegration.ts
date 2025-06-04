
import { useState, useEffect } from 'react';
import { usePrintJobs } from './usePrintJobs';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PrintJob = Database['public']['Tables']['print_jobs']['Row'];

export const useJobsIntegration = () => {
  const { printJobs, loading, createPrintJob, updatePrintJob, duplicatePrintJob, deletePrintJob, refetch } = usePrintJobs();
  const { toast } = useToast();

  // Filter jobs by status and priority
  const printing = printJobs.filter(job => job.status === 'printing');
  const highPriorityJobs = printJobs.filter(job => 
    (job.priority || 5) > 5 && 
    !['printing', 'done', 'failed'].includes(job.status)
  );
  const normalPriorityJobs = printJobs.filter(job => 
    (job.priority || 5) <= 5 && 
    !['printing', 'done', 'failed'].includes(job.status)
  );
  const completedJobs = printJobs.filter(job => job.status === 'done');
  const failedJobs = printJobs.filter(job => job.status === 'failed');

  const handleRetryJob = async (jobId: string) => {
    try {
      await updatePrintJob(jobId, { 
        status: 'waiting_for_classifying',
        failure_reason: null,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Job wird wiederholt",
        description: "Der Job wurde zurück in die Warteschlange eingereiht.",
      });
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const handlePriorityChange = async (jobId: string, newPriority: number) => {
    try {
      await updatePrintJob(jobId, { 
        priority: newPriority,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const handleQuantityChange = async (jobId: string, newQuantity: number) => {
    try {
      await updatePrintJob(jobId, { 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error changing quantity:', error);
    }
  };

  // Listen for new print jobs created from marketplace orders
  useEffect(() => {
    const handleNewPrintJob = (event: CustomEvent) => {
      console.log('New print job created from marketplace order:', event.detail);
      // Refresh the print jobs list to show the new auto-created job
      refetch();
      
      toast({
        title: "Neuer Print Job erstellt",
        description: `Print Job für "${event.detail.productName}" wurde automatisch aus Bestellung ${event.detail.orderNumber} erstellt.`,
      });
    };

    window.addEventListener('newPrintJobCreated', handleNewPrintJob as EventListener);
    
    return () => {
      window.removeEventListener('newPrintJobCreated', handleNewPrintJob as EventListener);
    };
  }, [refetch, toast]);

  return {
    printJobs,
    loading,
    printing,
    highPriorityJobs,
    normalPriorityJobs,
    completedJobs,
    failedJobs,
    createPrintJob,
    updatePrintJob,
    duplicatePrintJob,
    deletePrintJob,
    handleRetryJob,
    handlePriorityChange,
    handleQuantityChange,
    refetch
  };
};
