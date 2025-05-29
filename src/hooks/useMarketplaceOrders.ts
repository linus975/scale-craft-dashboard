
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type MarketplaceOrder = Database['public']['Tables']['marketplace_orders']['Row'];

export const useMarketplaceOrders = () => {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching marketplace orders:', error);
      toast({
        title: "Fehler beim Laden der Bestellungen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    order_id: string;
    marketplace: string;
    product_name: string;
    customer_email?: string;
    amount?: string;
    quantity?: number;
    material?: string;
    design_file?: string;
    ean_number?: string;
    product_id?: string;
    marketplace_integration_id?: string;
    status?: string;
    print_status?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .insert([{
          ...orderData,
          user_id: 'system', // This should be replaced with actual user ID when auth is implemented
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bestellung erstellt",
        description: `Neue Bestellung ${orderData.order_id} wurde hinzugefügt.`,
      });

      await fetchOrders(); // Refresh the orders list
      return data;
    } catch (error: any) {
      console.error('Error creating marketplace order:', error);
      toast({
        title: "Fehler beim Erstellen der Bestellung",
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
    refetch: fetchOrders,
    createOrder
  };
};
