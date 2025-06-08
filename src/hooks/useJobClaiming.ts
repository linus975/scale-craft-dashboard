
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
      
      const { data, error } = await supabase.rpc('claim_next_ready_job', {
        machine_id: machineId
      });

      if (error) {
        console.error('Error claiming job:', error);
        throw error;
      }

      console.log('Claim job result:', data);

      if (!data || data.length === 0) {
        console.log('No jobs available to claim');
        toast({
          title: "No jobs available",
          description: "There are currently no jobs ready to print.",
          variant: "default",
        });
        return null;
      }

      const claimedJob = data[0] as ClaimedJob;
      
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
