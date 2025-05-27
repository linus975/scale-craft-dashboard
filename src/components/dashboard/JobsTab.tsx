
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

const JobsTab: React.FC = () => {
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Production Jobs</h2>
          <p className="text-slate-600">Monitor and manage your print queue</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Play className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Job Queue</CardTitle>
          <CardDescription>Current and recent production jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockJobs.map((job, index) => (
              <div key={job.id}>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium text-slate-900">{job.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{job.printer}</span>
                        <span>•</span>
                        <span>{job.material}</span>
                        {job.progress > 0 && (
                          <>
                            <span>•</span>
                            <span>{job.progress}% complete</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.status === 'printing' && (
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                {index < mockJobs.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TODO: Implement job management features */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Advanced Job Management</h3>
          <p className="text-slate-600 mb-4">Batch processing, automated scheduling, and production analytics will be available here.</p>
          <Badge variant="outline">Under Development</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsTab;
