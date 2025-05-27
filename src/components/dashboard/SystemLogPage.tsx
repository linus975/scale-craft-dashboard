
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface SystemLogPageProps {
  onBack: () => void;
}

const SystemLogPage: React.FC<SystemLogPageProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const mockLogs = [
    { id: 1, timestamp: '2024-01-15 14:30:25', type: 'success', message: 'Job "Custom Gear Set" completed successfully', source: 'Job Manager' },
    { id: 2, timestamp: '2024-01-15 14:28:12', type: 'info', message: 'New print job added to queue: "Prototype Housing"', source: 'Queue System' },
    { id: 3, timestamp: '2024-01-15 14:25:45', type: 'warning', message: 'Low filament detected on X1C-2 (PLA - Red)', source: 'Machine Monitor' },
    { id: 4, timestamp: '2024-01-15 14:20:30', type: 'error', message: 'Print job "Enclosure Part" failed - bed adhesion issue', source: 'Printer Mk3-2' },
    { id: 5, timestamp: '2024-01-15 14:15:18', type: 'info', message: 'Machine X1C-1 status: idle → printing', source: 'Machine Monitor' },
    { id: 6, timestamp: '2024-01-15 14:10:55', type: 'success', message: 'Material order shipped - Tracking: DHL123456789', source: 'Shipping System' },
    { id: 7, timestamp: '2024-01-15 14:05:33', type: 'info', message: 'User login: admin@scalecraft.com', source: 'Authentication' },
    { id: 8, timestamp: '2024-01-15 14:00:15', type: 'warning', message: 'Scheduled maintenance reminder: A1 Mini-1 (due in 2 days)', source: 'Maintenance System' },
    { id: 9, timestamp: '2024-01-15 13:55:42', type: 'error', message: 'Network connectivity issue with Bambu Lab X1 Carbon', source: 'Network Monitor' },
    { id: 10, timestamp: '2024-01-15 13:50:28', type: 'success', message: 'Backup completed successfully', source: 'System Backup' },
    { id: 11, timestamp: '2024-01-15 13:45:10', type: 'info', message: 'Design file uploaded: "Phone_Case_v2.stl"', source: 'File Manager' },
    { id: 12, timestamp: '2024-01-15 13:40:05', type: 'warning', message: 'High CPU usage detected on print server', source: 'System Monitor' },
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Log</h2>
          <p className="text-slate-600">All system messages and activity history</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>System Messages</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {mockLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getLogColor(log.type)}>
                      {log.type}
                    </Badge>
                    <span className="text-sm text-slate-500">{log.source}</span>
                    <span className="text-sm text-slate-400">•</span>
                    <span className="text-sm text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-900">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogPage;
