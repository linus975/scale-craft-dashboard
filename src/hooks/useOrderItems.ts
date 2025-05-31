
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

export const useOrderItems = (orderId?: string) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrderItems = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error: any) {
      console.error('Error fetching order items:', error);
      toast({
        title: "Fehler beim Laden der Bestellpositionen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrderItem = async (itemData: OrderItemInsert) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;

      setOrderItems(prev => [...prev, data]);
      toast({
        title: "Bestellposition hinzugefügt",
        description: `${data.product_name} wurde zur Bestellung hinzugefügt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating order item:', error);
      toast({
        title: "Fehler beim Erstellen der Bestellposition",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrderItem = async (id: string, itemData: OrderItemUpdate) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrderItems(prev => prev.map(item => 
        item.id === id ? data : item
      ));

      toast({
        title: "Bestellposition aktualisiert",
        description: `${data.product_name} wurde erfolgreich aktualisiert.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating order item:', error);
      toast({
        title: "Fehler beim Aktualisieren der Bestellposition",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrderItem = async (id: string) => {
    try {
      const item = orderItems.find(i => i.id === id);
      
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrderItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Bestellposition gelöscht",
        description: `${item?.product_name} wurde aus der Bestellung entfernt.`,
      });
    } catch (error: any) {
      console.error('Error deleting order item:', error);
      toast({
        title: "Fehler beim Löschen der Bestellposition",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrderItems();
  }, [orderId]);

  return {
    orderItems,
    loading,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    refetch: fetchOrderItems
  };
};
