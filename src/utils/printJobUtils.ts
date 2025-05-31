
import { supabase } from '@/integrations/supabase/client';
import { getProductTypeByEan } from './productTypeDetection';
import type { Database } from '@/integrations/supabase/types';

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type PrintJobInsert = Database['public']['Tables']['print_jobs']['Insert'];

export const createPrintJobFromOrderItem = async (
  orderItem: OrderItem, 
  orderId: string
): Promise<PrintJobInsert> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Benutzer nicht angemeldet');

  // Determine if personalization is needed based on EAN
  let productType: 'static' | 'personalized' | null = null;
  if (orderItem.ean_number) {
    productType = await getProductTypeByEan(orderItem.ean_number);
  }

  const printJobData: PrintJobInsert = {
    product_id: orderItem.product_id,
    product_name: orderItem.product_name,
    ean_number: orderItem.ean_number,
    source_type: 'order',
    source_order_id: orderId,
    source_order_item_id: orderItem.id,
    quantity: orderItem.quantity || 1,
    personalization_data: orderItem.personalization_data,
    personalization_applied: productType === 'static', // Static products don't need personalization
    status: productType === 'static' ? 'ready' : 'waiting', // Static goes to ready, personalized waits
    priority: 5, // Default priority
    notes: orderItem.special_instructions || undefined,
    created_by: user.id
  };

  return printJobData;
};

export const processBulkOrderItems = async (
  orderItems: OrderItem[], 
  orderId: string
): Promise<PrintJobInsert[]> => {
  const printJobs: PrintJobInsert[] = [];
  
  for (const item of orderItems) {
    try {
      const printJob = await createPrintJobFromOrderItem(item, orderId);
      printJobs.push(printJob);
    } catch (error) {
      console.error(`Error creating print job for item ${item.id}:`, error);
    }
  }
  
  return printJobs;
};

export const getJobStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'waiting': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
    case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'failed': return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled': return 'bg-slate-100 text-slate-800 border-slate-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getSourceTypeBadgeColor = (sourceType: string) => {
  switch (sourceType) {
    case 'manual': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'order': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'restock': return 'bg-green-100 text-green-800 border-green-200';
    case 'prototype': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'duplicate': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
