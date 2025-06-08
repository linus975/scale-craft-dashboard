
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Machine = Database['public']['Tables']['machines']['Row'] & {
  current_job_name?: string;
};
type MachineInsert = Database['public']['Tables']['machines']['Insert'];
type MachineUpdate = Database['public']['Tables']['machines']['Update'];

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMachines = async () => {
    try {
      // First get all machines
      const { data: machinesData, error: machinesError } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (machinesError) throw machinesError;

      // Then get job names for machines that have a current_job_id
      const machineIds = machinesData?.filter(m => m.current_job_id).map(m => m.current_job_id) || [];
      
      let jobsData: any[] = [];
      if (machineIds.length > 0) {
        const { data: jobs, error: jobsError } = await supabase
          .from('print_jobs')
          .select('id, product_name')
          .in('id', machineIds);

        if (jobsError) throw jobsError;
        jobsData = jobs || [];
      }

      // Combine the data
      const machinesWithJobNames = (machinesData || []).map(machine => {
        const currentJob = jobsData.find(job => job.id === machine.current_job_id);
        return {
          ...machine,
          current_job_name: currentJob?.product_name || null
        };
      });
      
      setMachines(machinesWithJobNames);
    } catch (error: any) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Error loading machines",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMachine = async (machineData: Omit<MachineInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const { data, error } = await supabase
        .from('machines')
        .insert({ 
          ...machineData, 
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setMachines(prev => [{ ...data, current_job_name: null }, ...prev]);
      toast({
        title: "Machine added",
        description: `${data.name} was successfully added.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating machine:', error);
      toast({
        title: "Error adding machine",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMachine = async (id: string, machineData: MachineUpdate) => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .update(machineData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Get the job name if there's a current_job_id
      let currentJobName = null;
      if (data.current_job_id) {
        const { data: jobData } = await supabase
          .from('print_jobs')
          .select('product_name')
          .eq('id', data.current_job_id)
          .single();
        
        currentJobName = jobData?.product_name || null;
      }

      const updatedMachine = {
        ...data,
        current_job_name: currentJobName
      };

      setMachines(prev => prev.map(machine => 
        machine.id === id ? updatedMachine : machine
      ));

      toast({
        title: "Machine updated",
        description: `${data.name} was successfully updated.`,
      });

      return updatedMachine;
    } catch (error: any) {
      console.error('Error updating machine:', error);
      toast({
        title: "Error updating machine",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMachine = async (id: string) => {
    try {
      const machine = machines.find(m => m.id === id);
      
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMachines(prev => prev.filter(machine => machine.id !== id));
      toast({
        title: "Machine deleted",
        description: `${machine?.name} was successfully deleted.`,
      });
    } catch (error: any) {
      console.error('Error deleting machine:', error);
      toast({
        title: "Error deleting machine",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return {
    machines,
    loading,
    createMachine,
    updateMachine,
    deleteMachine,
    refetch: fetchMachines
  };
};
