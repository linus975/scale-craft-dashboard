
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignedJob {
  job_id: string;
  job_number: string;
  product_name: string;
  job_status: string;
  queued_at: string;
  started_at: string;
}

export const useJobAssignment = () => {
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const assignNextJob = async (machineId: string): Promise<AssignedJob | null> => {
    setAssigning(true);
    try {
      console.log(`Attempting to assign next job to machine: ${machineId}`);
      console.log(`Machine ID type: ${typeof machineId}, value: "${machineId}"`);
      
      // Validate machine ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(machineId)) {
        throw new Error(`Invalid machine ID format: ${machineId}. Must be a valid UUID.`);
      }

      // Call the alternative RPC function
      const { data, error } = await supabase.rpc('assign_next_job_to_machine', {
        p_machine_id: machineId
      });

      console.log('Assignment RPC Response data:', data);
      console.log('Assignment RPC Response error:', error);

      if (error) {
        console.error('Assignment RPC Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Job assignment result:', data);

      if (!data || data.length === 0) {
        console.log('No jobs available to assign');
        toast({
          title: "No jobs available",
          description: "There are currently no jobs ready to print.",
          variant: "default",
        });
        return null;
      }

      const assignedJob = data[0] as AssignedJob;
      
      toast({
        title: "Job assigned successfully",
        description: `Job ${assignedJob.job_number} (${assignedJob.product_name}) has been assigned to the machine.`,
      });

      return assignedJob;
    } catch (error: any) {
      console.error('Error assigning next job:', error);
      toast({
        title: "Error assigning job",
        description: error.message || "Failed to assign the next job",
        variant: "destructive",
      });
      return null;
    } finally {
      setAssigning(false);
    }
  };

  return {
    assignNextJob,
    assigning
  };
};
