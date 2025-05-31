
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Machine = Database['public']['Tables']['machines']['Row'];
type MachineInsert = Database['public']['Tables']['machines']['Insert'];
type MachineUpdate = Database['public']['Tables']['machines']['Update'];

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachines(data || []);
    } catch (error: any) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Fehler beim Laden der Maschinen",
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
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const { data, error } = await supabase
        .from('machines')
        .insert({ ...machineData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setMachines(prev => [data, ...prev]);
      toast({
        title: "Maschine hinzugefügt",
        description: `${data.name} wurde erfolgreich hinzugefügt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating machine:', error);
      toast({
        title: "Fehler beim Hinzufügen der Maschine",
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

      setMachines(prev => prev.map(machine => 
        machine.id === id ? data : machine
      ));

      toast({
        title: "Maschine aktualisiert",
        description: `${data.name} wurde erfolgreich aktualisiert.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating machine:', error);
      toast({
        title: "Fehler beim Aktualisieren der Maschine",
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
        title: "Maschine gelöscht",
        description: `${machine?.name} wurde erfolgreich gelöscht.`,
      });
    } catch (error: any) {
      console.error('Error deleting machine:', error);
      toast({
        title: "Fehler beim Löschen der Maschine",
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
