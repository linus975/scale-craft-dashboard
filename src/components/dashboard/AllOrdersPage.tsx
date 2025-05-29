
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  Eye,
  Search,
  Loader2
} from 'lucide-react';
import { useMarketplaceOrders } from '@/hooks/useMarketplaceOrders';

interface AllOrdersPageProps {
  onBack: () => void;
}

const AllOrdersPage: React.FC<AllOrdersPageProps> = ({ onBack }) => {
  const { orders, loading } = useMarketplaceOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.marketplace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'printed': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrintStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'printing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleDownloadDesign = (designFile: string) => {
    console.log(`Downloading design file: ${designFile}`);
    // In a real app, this would trigger a file download
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Orders</h2>
          <p className="text-slate-600">Complete order history and search</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search orders, customers, products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter by Status
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-slate-600">
          Found {filteredOrders.length} orders matching "{searchTerm}"
        </div>
      )}

      {/* Orders List */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            All Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription>Complete order history with search functionality</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found matching your search criteria.</p>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Bestellungen vorhanden</p>
                  <p className="text-sm">Synchronisieren Sie Ihre Marktplätze, um Bestellungen zu sehen</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleOrderClick(order)}
                >
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
                        <span>{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</span>
                        <span>•</span>
                        <span>{order.amount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <div className="mt-1">
                        <Badge variant="outline" className={getPrintStatusColor(order.print_status)}>
                          {order.print_status}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Complete information about this marketplace order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Product</label>
                  <p className="text-sm">{selectedOrder.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Marketplace</label>
                  <p className="text-sm">{selectedOrder.marketplace}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Customer</label>
                  <p className="text-sm">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Amount</label>
                  <p className="text-sm">{selectedOrder.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Order Date</label>
                  <p className="text-sm">{selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Quantity</label>
                  <p className="text-sm">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Material</label>
                  <p className="text-sm">{selectedOrder.material || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Order Status</label>
                  <Badge className={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Print Status</label>
                <div className="mt-1">
                  <Badge className={getPrintStatusColor(selectedOrder.print_status)}>
                    {selectedOrder.print_status}
                  </Badge>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-sm text-slate-900">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.design_file && (
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full" 
                    onClick={() => handleDownloadDesign(selectedOrder.design_file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Design File
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrdersPage;
