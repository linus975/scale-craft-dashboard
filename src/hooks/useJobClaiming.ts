
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClaimedJob {
  id: string;
  job_number: string;
  product_name: string;
  status: string;
  queued_at: string;
  started_at: string;
}

export const useJobClaiming = () => {
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const claimNextJob = async (machineId: string): Promise<ClaimedJob | null> => {
    setClaiming(true);
    try {
      console.log(`Attempting to claim next job for machine: ${machineId}`);
      console.log(`Machine ID type: ${typeof machineId}, value: "${machineId}"`);
      
      // Validate machine ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(machineId)) {
        throw new Error(`Invalid machine ID format: ${machineId}. Must be a valid UUID.`);
      }

      // Use the assign_job_to_machine function since claim_next_ready_job doesn't exist anymore
      const { data, error } = await supabase.rpc('assign_job_to_machine', {
        machine_id: machineId
      });

      console.log('RPC Response data:', data);
      console.log('RPC Response error:', error);

      if (error) {
        console.error('RPC Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Claim job result:', data);

      // Properly handle the response - it should be an array
      const dataArray = Array.isArray(data) ? data : [];
      
      if (!dataArray || dataArray.length === 0) {
        console.log('No jobs available to claim');
        toast({
          title: "No jobs available",
          description: "There are currently no jobs ready to print.",
          variant: "default",
        });
        return null;
      }

      const claimedJob = dataArray[0] as ClaimedJob;
      
      toast({
        title: "Job claimed successfully",
        description: `Job ${claimedJob.job_number} (${claimedJob.product_name}) has been assigned to the machine.`,
      });

      return claimedJob;
    } catch (error: any) {
      console.error('Error claiming next job:', error);
      toast({
        title: "Error claiming job",
        description: error.message || "Failed to claim the next job",
        variant: "destructive",
      });
      return null;
    } finally {
      setClaiming(false);
    }
  };

  return {
    claimNextJob,
    claiming
  };
};
