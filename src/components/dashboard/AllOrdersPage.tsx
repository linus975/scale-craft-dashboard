
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
  Search
} from 'lucide-react';

interface AllOrdersPageProps {
  onBack: () => void;
}

const AllOrdersPage: React.FC<AllOrdersPageProps> = ({ onBack }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extended mock orders data
  const mockOrders = [
    { 
      id: 1, 
      marketplace: "eBay", 
      product: "Custom Phone Case", 
      customer: "john.doe@email.com", 
      status: "processing", 
      amount: "$24.99",
      orderDate: "2024-05-27",
      printStatus: "queued",
      designFile: "phone_case_custom.stl",
      quantity: 1,
      material: "TPU",
      notes: "Blue color requested"
    },
    { 
      id: 2, 
      marketplace: "Etsy", 
      product: "Personalized Keychain", 
      customer: "jane.smith@email.com", 
      status: "printed", 
      amount: "$12.50",
      orderDate: "2024-05-26",
      printStatus: "completed",
      designFile: "keychain_personalized.stl",
      quantity: 2,
      material: "PLA",
      notes: "Name: 'Jane & Mike'"
    },
    { 
      id: 3, 
      marketplace: "eBay", 
      product: "Custom Bracket", 
      customer: "mike.wilson@email.com", 
      status: "shipped", 
      amount: "$18.75",
      orderDate: "2024-05-25",
      printStatus: "shipped",
      designFile: "bracket_custom.stl",
      quantity: 1,
      material: "PETG",
      notes: "Extra strong required"
    },
    { 
      id: 4, 
      marketplace: "Amazon", 
      product: "Custom Miniature", 
      customer: "sarah.jones@email.com", 
      status: "processing", 
      amount: "$35.00",
      orderDate: "2024-05-27",
      printStatus: "printing",
      designFile: "miniature_custom.stl",
      quantity: 1,
      material: "Resin",
      notes: "High detail required"
    },
    { 
      id: 5, 
      marketplace: "Shopify", 
      product: "Gear Set", 
      customer: "tom.brown@email.com", 
      status: "completed", 
      amount: "$45.99",
      orderDate: "2024-05-24",
      printStatus: "delivered",
      designFile: "gear_set.stl",
      quantity: 3,
      material: "PETG",
      notes: "Industrial grade"
    },
    { 
      id: 6, 
      marketplace: "Etsy", 
      product: "Custom Vase", 
      customer: "lisa.white@email.com", 
      status: "failed", 
      amount: "$28.00",
      orderDate: "2024-05-23",
      printStatus: "failed",
      designFile: "vase_custom.stl",
      quantity: 1,
      material: "PLA",
      notes: "Print failed - support issue"
    },
    { 
      id: 7, 
      marketplace: "Amazon", 
      product: "Custom Tool Holder", 
      customer: "robert.lee@email.com", 
      status: "shipped", 
      amount: "$32.50",
      orderDate: "2024-05-22",
      printStatus: "delivered",
      designFile: "tool_holder.stl",
      quantity: 1,
      material: "ABS",
      notes: "Workshop use"
    },
    { 
      id: 8, 
      marketplace: "Etsy", 
      product: "Wedding Decoration", 
      customer: "maria.garcia@email.com", 
      status: "completed", 
      amount: "$67.00",
      orderDate: "2024-05-21",
      printStatus: "delivered",
      designFile: "wedding_decor.stl",
      quantity: 5,
      material: "PLA",
      notes: "White color, elegant finish"
    }
  ];

  // Filter orders based on search term
  const filteredOrders = mockOrders.filter(order => 
    order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    <h4 className="font-medium text-slate-900">{order.product}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{order.marketplace}</span>
                      <span>•</span>
                      <span>{order.customer}</span>
                      <span>•</span>
                      <span>{order.orderDate}</span>
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
                      <Badge variant="outline" className={getPrintStatusColor(order.printStatus)}>
                        {order.printStatus}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No orders found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete information about this marketplace order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Product</label>
                  <p className="text-sm">{selectedOrder.product}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Marketplace</label>
                  <p className="text-sm">{selectedOrder.marketplace}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Customer</label>
                  <p className="text-sm">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Amount</label>
                  <p className="text-sm">{selectedOrder.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Order Date</label>
                  <p className="text-sm">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Quantity</label>
                  <p className="text-sm">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Material</label>
                  <p className="text-sm">{selectedOrder.material}</p>
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
                  <Badge className={getPrintStatusColor(selectedOrder.printStatus)}>
                    {selectedOrder.printStatus}
                  </Badge>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-sm text-slate-900">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={() => handleDownloadDesign(selectedOrder.designFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Design File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrdersPage;
