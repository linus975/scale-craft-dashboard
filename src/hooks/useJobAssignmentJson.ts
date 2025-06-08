
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobAssignmentResult {
  success: boolean;
  message: string;
  job_assigned: boolean;
  job_id?: string;
  job_number?: string;
  product_name?: string;
  assigned_at?: string;
  available_jobs_count?: number;
}

export const useJobAssignmentJson = () => {
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const assignJobWithJson = async (machineId: string): Promise<JobAssignmentResult | null> => {
    setAssigning(true);
    try {
      console.log(`Calling get_and_assign_next_job for machine: ${machineId}`);
      
      // Validate machine ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(machineId)) {
        throw new Error(`Invalid machine ID format: ${machineId}. Must be a valid UUID.`);
      }

      // Call the new RPC function
      const { data, error } = await supabase.rpc('get_and_assign_next_job', {
        machine_uuid: machineId
      });

      console.log('get_and_assign_next_job Response data:', data);
      console.log('get_and_assign_next_job Response error:', error);

      if (error) {
        console.error('RPC Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      // Properly type the result by converting from Json to our expected interface
      const result = data as unknown as JobAssignmentResult;

      if (result.success && result.job_assigned) {
        toast({
          title: "Job assigned successfully",
          description: `Job ${result.job_number} (${result.product_name}) has been assigned to the machine.`,
        });
      } else {
        toast({
          title: "No jobs available",
          description: `${result.message}. Available jobs: ${result.available_jobs_count || 0}`,
          variant: "default",
        });
      }

      return result;
    } catch (error: any) {
      console.error('Error in get_and_assign_next_job:', error);
      toast({
        title: "Error assigning job",
        description: error.message || "Failed to assign job with JSON function",
        variant: "destructive",
      });
      return null;
    } finally {
      setAssigning(false);
    }
  };

  return {
    assignJobWithJson,
    assigning
  };
};
