
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJobClaimingDebug = () => {
  const [debugging, setDebugging] = useState(false);
  const { toast } = useToast();

  const debugJobClaiming = async (machineId: string) => {
    setDebugging(true);
    try {
      console.log(`Starting debug for machine: ${machineId}`);
      
      // 1. Check if machine exists
      const { data: machine, error: machineError } = await supabase
        .from('machines')
        .select('id, name, status')
        .eq('id', machineId)
        .single();

      if (machineError) {
        console.error('Machine check error:', machineError);
        toast({
          title: "Machine not found",
          description: `Error: ${machineError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Machine found:', machine);

      // 2. Check available jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('print_jobs')
        .select('id, job_number, product_name, status, queued_at, created_at')
        .eq('status', 'ready_to_print')
        .order('queued_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (jobsError) {
        console.error('Jobs check error:', jobsError);
        toast({
          title: "Error checking jobs",
          description: `Error: ${jobsError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Available jobs with ready_to_print status:', jobs);

      if (!jobs || jobs.length === 0) {
        toast({
          title: "No jobs available",
          description: "No jobs with status 'ready_to_print' found in database.",
          variant: "default",
        });
        return;
      }

      // 3. Try to assign using RPC function (the only one available now)
      console.log('Attempting to assign job using RPC function...');
      const { data: assignResult, error: assignError } = await supabase.rpc('assign_job_to_machine', {
        machine_id: machineId
      });

      console.log('RPC Assign result:', assignResult);
      console.log('RPC Assign error:', assignError);

      if (assignError) {
        toast({
          title: "RPC Function Error",
          description: `Error: ${assignError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Properly handle the response - it should be an array
      const resultArray = Array.isArray(assignResult) ? assignResult : [];
      
      if (!resultArray || resultArray.length === 0) {
        toast({
          title: "No job assigned",
          description: "RPC function returned empty result despite available jobs",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Debug complete",
        description: `Successfully assigned job: ${resultArray[0].job_number}`,
      });

    } catch (error: any) {
      console.error('Debug error:', error);
      toast({
        title: "Debug failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDebugging(false);
    }
  };

  return {
    debugJobClaiming,
    debugging
  };
};
