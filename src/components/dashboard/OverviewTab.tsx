
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

const OverviewTab: React.FC = () => {
  // Mock data for demonstration
  const mockJobs = [
    { id: 1, name: "Custom Gear Set", status: "printing", progress: 75, material: "PLA", printer: "X1C-2" },
    { id: 2, name: "Prototype Housing", status: "queued", progress: 0, material: "ABS", printer: "A1 Mini-1" },
    { id: 3, name: "Bracket Design", status: "completed", progress: 100, material: "PETG", printer: "X1C-1" },
    { id: 4, name: "Enclosure Part", status: "failed", progress: 45, material: "PLA", printer: "Mk3-2" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing': return <Play className="h-4 w-4 text-green-500" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'bg-green-100 text-green-800 border-green-200';
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-500">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500">85% success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Design Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">24</div>
            <p className="text-xs text-slate-500">3 updated today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Marketplace Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">68</div>
            <p className="text-xs text-slate-500">+12 this hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates from your production workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockJobs.slice(0, 3).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(job.status)}
                <div>
                  <p className="font-medium text-slate-900">{job.name}</p>
                  <p className="text-sm text-slate-500">{job.printer} • {job.material}</p>
                </div>
              </div>
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
