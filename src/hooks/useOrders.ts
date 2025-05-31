
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Fehler beim Laden der Bestellungen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<OrderInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const { data, error } = await supabase
        .from('orders')
        .insert({ ...orderData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => [data, ...prev]);
      toast({
        title: "Bestellung erstellt",
        description: `Bestellung ${data.order_number} wurde erfolgreich erstellt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Fehler beim Erstellen der Bestellung",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, orderData: OrderUpdate) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...orderData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === id ? data : order
      ));

      toast({
        title: "Bestellung aktualisiert",
        description: `Bestellung ${data.order_number} wurde erfolgreich aktualisiert.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Fehler beim Aktualisieren der Bestellung",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== id));
      toast({
        title: "Bestellung gelöscht",
        description: `Bestellung ${order?.order_number} wurde erfolgreich gelöscht.`,
      });
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: "Fehler beim Löschen der Bestellung",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders
  };
};
