
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PrintJob = Database['public']['Tables']['print_jobs']['Row'];
type PrintJobInsert = Omit<Database['public']['Tables']['print_jobs']['Insert'], 'job_number' | 'created_by'>; // Exclude auto-generated fields
type PrintJobUpdate = Database['public']['Tables']['print_jobs']['Update'];

export const usePrintJobs = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrintJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrintJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching print jobs:', error);
      toast({
        title: "Error loading print jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrintJob = async (jobData: PrintJobInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure job_number is not included in the insert data to avoid conflicts
      const { job_number, ...cleanJobData } = jobData as any;
      
      const { data, error } = await supabase
        .from('print_jobs')
        .insert({ ...cleanJobData, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      setPrintJobs(prev => [data, ...prev]);
      toast({
        title: "Print job created",
        description: `Job ${data.job_number} was successfully created.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating print job:', error);
      toast({
        title: "Error creating print job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePrintJob = async (id: string, jobData: PrintJobUpdate) => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .update({ ...jobData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPrintJobs(prev => prev.map(job => 
        job.id === id ? data : job
      ));

      toast({
        title: "Print job updated",
        description: `Job ${data.job_number} was successfully updated.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating print job:', error);
      toast({
        title: "Error updating print job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicatePrintJob = async (jobId: string) => {
    try {
      const originalJob = printJobs.find(job => job.id === jobId);
      if (!originalJob) throw new Error('Job not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the duplicate job data excluding auto-generated fields
      const duplicateJobData = {
        product_id: originalJob.product_id,
        product_name: `${originalJob.product_name} (Copy)`,
        ean_number: originalJob.ean_number,
        source_type: 'duplicate' as const,
        parent_job_id: originalJob.id,
        quantity: originalJob.quantity,
        material: originalJob.material,
        color: originalJob.color,
        infill_percentage: originalJob.infill_percentage,
        layer_height: originalJob.layer_height,
        nozzle_temperature: originalJob.nozzle_temperature,
        bed_temperature: originalJob.bed_temperature,
        print_speed: originalJob.print_speed,
        model_file_path: originalJob.model_file_path,
        personalization_data: originalJob.personalization_data,
        parameters: originalJob.parameters,
        priority: originalJob.priority,
        notes: `Copy of job ${originalJob.job_number}`,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('print_jobs')
        .insert(duplicateJobData)
        .select()
        .single();

      if (error) throw error;

      setPrintJobs(prev => [data, ...prev]);
      toast({
        title: "Print job duplicated",
        description: `Job ${data.job_number} was created as a copy of ${originalJob.job_number}.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error duplicating print job:', error);
      toast({
        title: "Error duplicating print job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePrintJob = async (id: string) => {
    try {
      const job = printJobs.find(j => j.id === id);
      
      const { error } = await supabase
        .from('print_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrintJobs(prev => prev.filter(job => job.id !== id));
      toast({
        title: "Print job deleted",
        description: `Job ${job?.job_number} was successfully deleted.`,
      });
    } catch (error: any) {
      console.error('Error deleting print job:', error);
      toast({
        title: "Error deleting print job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPrintJobs();
  }, []);

  return {
    printJobs,
    loading,
    createPrintJob,
    updatePrintJob,
    duplicatePrintJob,
    deletePrintJob,
    refetch: fetchPrintJobs
  };
};
