
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  ShoppingCart,
  Calendar,
  Euro,
  Package,
  User,
  ExternalLink
} from 'lucide-react';

interface RecentOrdersPageProps {
  onBack: () => void;
}

const RecentOrdersPage: React.FC<RecentOrdersPageProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');

  // Mock order data
  const mockOrders = [
    { id: 1, orderNumber: 'ORD-2024-001', marketplace: 'eBay', product: 'Custom Phone Case', customer: 'john.doe@email.com', status: 'processing', amount: 24.99, date: '2024-01-15', customization: 'Blue color, Name: John' },
    { id: 2, orderNumber: 'ORD-2024-002', marketplace: 'Etsy', product: 'Personalized Keychain', customer: 'jane.smith@email.com', status: 'printed', amount: 12.50, date: '2024-01-14', customization: 'Text: Jane & Mike' },
    { id: 3, orderNumber: 'ORD-2024-003', marketplace: 'eBay', product: 'Custom Bracket', customer: 'mike.wilson@email.com', status: 'shipped', amount: 18.75, date: '2024-01-13', customization: 'Size: Large, Material: ABS' },
    { id: 4, orderNumber: 'ORD-2024-004', marketplace: 'Amazon', product: 'Custom Gear Set', customer: 'sarah.jones@email.com', status: 'delivered', amount: 35.00, date: '2024-01-12', customization: 'Gear ratio: 3:1' },
    { id: 5, orderNumber: 'ORD-2024-005', marketplace: 'Shopify', product: 'Prototype Housing', customer: 'alex.brown@email.com', status: 'cancelled', amount: 28.90, date: '2024-01-11', customization: 'Color: Black, Size: Medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'printed': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesMarketplace = marketplaceFilter === 'all' || order.marketplace === marketplaceFilter;
    
    return matchesSearch && matchesStatus && matchesMarketplace;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
          <p className="text-slate-600">All marketplace orders and their current status</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search orders, products, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="printed">Printed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Marketplace</label>
              <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Marketplaces</SelectItem>
                  <SelectItem value="eBay">eBay</SelectItem>
                  <SelectItem value="Etsy">Etsy</SelectItem>
                  <SelectItem value="Amazon">Amazon</SelectItem>
                  <SelectItem value="Shopify">Shopify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription>Complete order history with details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{order.product}</h4>
                        <Badge variant="outline" className="text-xs">{order.orderNumber}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.customer}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {order.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {order.marketplace}
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          €{order.amount.toFixed(2)}
                        </div>
                      </div>
                      {order.customization && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium">Customization: </span>
                          {order.customization}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No orders found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentOrdersPage;
