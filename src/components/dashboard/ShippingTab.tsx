
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Archive,
  PackageCheck
} from 'lucide-react';

const ShippingTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const mockShipments = [
    { 
      id: 1, 
      orderId: "ORD-001", 
      jobName: "Custom Gear Set",
      customer: "John Smith",
      address: "123 Main St, Berlin, Germany",
      status: "printed", 
      priority: "normal",
      carrier: "",
      trackingNumber: ""
    },
    { 
      id: 2, 
      orderId: "ORD-002", 
      jobName: "Phone Case Custom",
      customer: "Anna Mueller",
      address: "456 Oak Ave, Munich, Germany", 
      status: "ready", 
      priority: "high",
      carrier: "",
      trackingNumber: ""
    },
    { 
      id: 3, 
      orderId: "ORD-003", 
      jobName: "Bracket Design",
      customer: "Michael Weber",
      address: "789 Pine St, Hamburg, Germany",
      status: "assigned", 
      priority: "normal",
      carrier: "DHL",
      trackingNumber: "DHL123456789"
    },
    { 
      id: 4, 
      orderId: "ORD-004", 
      jobName: "Custom Mount",
      customer: "Sarah Johnson",
      address: "321 Elm St, Frankfurt, Germany",
      status: "shipped", 
      priority: "normal",
      carrier: "UPS",
      trackingNumber: "UPS987654321"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printed': return <PackageCheck className="h-4 w-4" />;
      case 'ready': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'printed': return 'Printed & Ready for Packing';
      case 'ready': return 'Ready to Ship';
      case 'assigned': return 'Assigned';
      case 'shipped': return 'In Transit';
      case 'delivered': return 'Delivered (Last 30 Days)';
      default: return status;
    }
  };

  const getShipmentsByStatus = (status: string) => {
    return mockShipments.filter(shipment => shipment.status === status);
  };

  const handleAssignCarrier = (shipmentId: number, carrier: string) => {
    console.log(`Assigning carrier ${carrier} to shipment ${shipmentId}`);
  };

  const filteredShipments = mockShipments.filter(shipment =>
    shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.jobName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Shipping Management</h2>
          <p className="text-slate-600">Manage shipping assignments and track deliveries</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="carrier-select">Select Carrier</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dhl">DHL</SelectItem>
                    <SelectItem value="ups">UPS</SelectItem>
                    <SelectItem value="fedex">FedEx</SelectItem>
                    <SelectItem value="dpd">DPD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="package-size">Package Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">XS (15x10x5 cm)</SelectItem>
                    <SelectItem value="s">S (20x15x10 cm)</SelectItem>
                    <SelectItem value="m">M (30x20x15 cm)</SelectItem>
                    <SelectItem value="l">L (40x30x20 cm)</SelectItem>
                    <SelectItem value="xl">XL (50x40x30 cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="0.5" step="0.1" />
              </div>
              <Button className="w-full">Create Shipment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search by customer, order ID, or job name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Shipping Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <PackageCheck className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">2</p>
                    <p className="text-sm text-slate-600">Printed & Ready for Packing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Printed & Ready for Packing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getShipmentsByStatus('printed').map((shipment) => (
                <Card key={shipment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{shipment.orderId}</h4>
                        <p className="text-sm text-slate-600">{shipment.jobName}</p>
                        <p className="text-sm text-slate-500">{shipment.customer}</p>
                      </div>
                      <Button size="sm">Start Packing</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                    <p className="text-sm text-slate-600">Ready to Ship</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Ready to Ship</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getShipmentsByStatus('ready').map((shipment) => (
                <Card key={shipment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{shipment.orderId}</h4>
                        <p className="text-sm text-slate-600">{shipment.jobName}</p>
                        <p className="text-sm text-slate-500">{shipment.customer}</p>
                      </div>
                      <Button size="sm">Assign Carrier</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                    <p className="text-sm text-slate-600">Assigned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Assigned Shipments</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getShipmentsByStatus('assigned').map((shipment) => (
                <Card key={shipment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{shipment.orderId}</h4>
                        <p className="text-sm text-slate-600">{shipment.jobName}</p>
                        <p className="text-sm text-slate-500">{shipment.customer}</p>
                        <p className="text-xs text-slate-400">{shipment.carrier}: {shipment.trackingNumber}</p>
                      </div>
                      <Button size="sm">Ship Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                    <p className="text-sm text-slate-600">In Transit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>In Transit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getShipmentsByStatus('shipped').map((shipment) => (
                <Card key={shipment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{shipment.orderId}</h4>
                        <p className="text-sm text-slate-600">{shipment.jobName}</p>
                        <p className="text-sm text-slate-500">{shipment.customer}</p>
                        <p className="text-xs text-slate-400">{shipment.carrier}: {shipment.trackingNumber}</p>
                      </div>
                      <Button size="sm" variant="outline">Track Package</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-slate-900">42</p>
                <p className="text-sm text-slate-600">Delivered (Last 30 Days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archive Link */}
      <div className="flex justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          View Archive (Older than 30 Days)
        </Button>
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {filteredShipments.map((shipment) => (
          <Card key={shipment.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(shipment.status)}
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900">{shipment.orderId}</h4>
                      <Badge className={getStatusColor(shipment.status)}>
                        {getStatusDisplayName(shipment.status)}
                      </Badge>
                      {shipment.priority === 'high' && (
                        <Badge variant="destructive">High Priority</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{shipment.jobName}</p>
                    <p className="text-sm text-slate-500">{shipment.customer}</p>
                    <p className="text-xs text-slate-400">{shipment.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {shipment.status === 'ready' ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`carrier-${shipment.id}`} className="text-sm">Assign Carrier:</Label>
                      <Select onValueChange={(value) => handleAssignCarrier(shipment.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhl">DHL</SelectItem>
                          <SelectItem value="ups">UPS</SelectItem>
                          <SelectItem value="fedex">FedEx</SelectItem>
                          <SelectItem value="dpd">DPD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : shipment.carrier && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{shipment.carrier}</p>
                      {shipment.trackingNumber && (
                        <p className="text-xs text-slate-500">{shipment.trackingNumber}</p>
                      )}
                    </div>
                  )}
                  
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShippingTab;
