
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignedJobResult {
  id: string;
  job_number: string;
  product_name: string;
  status: string;
  queued_at: string | null;
  started_at: string | null;
  updated_at: string;
}

export const useJobMachineAssignment = () => {
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const assignJobToMachine = async (machineId: string): Promise<AssignedJobResult | null> => {
    setAssigning(true);
    try {
      console.log(`Assigning job to machine: ${machineId}`);
      
      // Validate machine ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(machineId)) {
        throw new Error(`Invalid machine ID format: ${machineId}. Must be a valid UUID.`);
      }

      // Call the RPC function
      const { data, error } = await supabase.rpc('assign_job_to_machine', {
        machine_id: machineId
      });

      console.log('assign_job_to_machine Response data:', data);
      console.log('assign_job_to_machine Response error:', error);

      if (error) {
        console.error('RPC Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No jobs available to assign');
        toast({
          title: "No jobs available",
          description: "There are currently no jobs ready to print.",
          variant: "default",
        });
        return null;
      }

      const assignedJob = data[0] as AssignedJobResult;
      
      toast({
        title: "Job assigned successfully",
        description: `Job ${assignedJob.job_number} (${assignedJob.product_name}) has been assigned and is now printing.`,
      });

      return assignedJob;
    } catch (error: any) {
      console.error('Error assigning job to machine:', error);
      toast({
        title: "Error assigning job",
        description: error.message || "Failed to assign job to machine",
        variant: "destructive",
      });
      return null;
    } finally {
      setAssigning(false);
    }
  };

  return {
    assignJobToMachine,
    assigning
  };
};
