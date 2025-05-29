
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ShoppingCart, Eye, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  product_name: string;
  marketplace: string;
  customer_email: string;
  status: string;
  print_status: string;
  amount: string;
  order_date: string | null;
}

interface RecentOrdersCardProps {
  orders: Order[];
  loading: boolean;
  onNavigateToAllOrders: () => void;
}

const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({
  orders,
  loading,
  onNavigateToAllOrders
}) => {
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'printed': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Orders automatically synced from marketplaces</CardDescription>
          </div>
          <Button variant="outline" onClick={onNavigateToAllOrders}>
            <Eye className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Bestellungen vorhanden</p>
            <p className="text-sm">Synchronisieren Sie Ihre Marktplätze, um Bestellungen zu sehen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id}>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{order.product_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{order.marketplace}</span>
                        <span>•</span>
                        <span>{order.customer_email}</span>
                        <span>•</span>
                        <span>{order.amount}</span>
                        <span>•</span>
                        <span>{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <div className="mt-1">
                        <Badge variant="outline" className={getOrderStatusColor(order.print_status)}>
                          {order.print_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {index < orders.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;
