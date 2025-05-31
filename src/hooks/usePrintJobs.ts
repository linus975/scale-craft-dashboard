
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PrintJob = Database['public']['Tables']['print_jobs']['Row'];
type PrintJobInsert = Omit<Database['public']['Tables']['print_jobs']['Insert'], 'job_number'>; // Exclude job_number since it's auto-generated
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
        title: "Fehler beim Laden der Print Jobs",
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
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const { data, error } = await supabase
        .from('print_jobs')
        .insert({ ...jobData, created_by: user.id } as any)
        .select()
        .single();

      if (error) throw error;

      setPrintJobs(prev => [data, ...prev]);
      toast({
        title: "Print Job erstellt",
        description: `Job ${data.job_number} wurde erfolgreich erstellt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating print job:', error);
      toast({
        title: "Fehler beim Erstellen des Print Jobs",
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
        title: "Print Job aktualisiert",
        description: `Job ${data.job_number} wurde erfolgreich aktualisiert.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating print job:', error);
      toast({
        title: "Fehler beim Aktualisieren des Print Jobs",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicatePrintJob = async (jobId: string) => {
    try {
      const originalJob = printJobs.find(job => job.id === jobId);
      if (!originalJob) throw new Error('Job nicht gefunden');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const duplicateJobData: PrintJobInsert = {
        product_id: originalJob.product_id,
        product_name: `${originalJob.product_name} (Kopie)`,
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
        notes: `Kopie von Job ${originalJob.job_number}`,
      };

      const { data, error } = await supabase
        .from('print_jobs')
        .insert({ ...duplicateJobData, created_by: user.id } as any)
        .select()
        .single();

      if (error) throw error;

      setPrintJobs(prev => [data, ...prev]);
      toast({
        title: "Print Job dupliziert",
        description: `Job ${data.job_number} wurde als Kopie von ${originalJob.job_number} erstellt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error duplicating print job:', error);
      toast({
        title: "Fehler beim Duplizieren des Print Jobs",
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
        title: "Print Job gelöscht",
        description: `Job ${job?.job_number} wurde erfolgreich gelöscht.`,
      });
    } catch (error: any) {
      console.error('Error deleting print job:', error);
      toast({
        title: "Fehler beim Löschen des Print Jobs",
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
