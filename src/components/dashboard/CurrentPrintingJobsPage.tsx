
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Play,
  Pause,
  Clock,
  Thermometer,
  Layers,
  Timer
} from 'lucide-react';
import { useJobsIntegration } from '@/hooks/useJobsIntegration';

interface CurrentPrintingJobsPageProps {
  onBack: () => void;
}

const CurrentPrintingJobsPage: React.FC<CurrentPrintingJobsPageProps> = ({ onBack }) => {
  const { printing } = useJobsIntegration();
  
  // Filter for only actually printing jobs
  const actuallyPrintingJobs = printing.filter(job => job.status === 'printing');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Active Jobs</h2>
          <p className="text-slate-600">Live monitoring of active print jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {actuallyPrintingJobs.map((job) => (
          <Card key={job.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{job.product_name}</CardTitle>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Play className="h-3 w-3 mr-1" />
                  Printing
                </Badge>
              </div>
              <CardDescription>
                Job: {job.job_number} • Printer: {job.printer_id || 'Not assigned'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress - estimate based on start time */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-medium">
                    {job.estimated_print_time && job.started_at 
                      ? Math.min(Math.floor((new Date().getTime() - new Date(job.started_at).getTime()) / 1000 / 60 / job.estimated_print_time * 100), 99)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={
                    job.estimated_print_time && job.started_at 
                      ? Math.min(Math.floor((new Date().getTime() - new Date(job.started_at).getTime()) / 1000 / 60 / job.estimated_print_time * 100), 99)
                      : 0
                  } 
                  className="h-2" 
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-slate-500">Time Left</p>
                    <p className="font-medium">
                      {job.estimated_print_time && job.started_at 
                        ? `${Math.max(0, job.estimated_print_time - Math.floor((new Date().getTime() - new Date(job.started_at).getTime()) / 1000 / 60))}m`
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-slate-500">Started</p>
                    <p className="font-medium">
                      {job.started_at 
                        ? new Date(job.started_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-slate-500">Temperature</p>
                    <p className="font-medium">
                      {job.nozzle_temperature ? `${job.nozzle_temperature}°C` : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-slate-500">Layer Height</p>
                    <p className="font-medium">{job.layer_height || '0.2'}mm</p>
                  </div>
                </div>
              </div>

              {/* Material */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Material:</span>
                <Badge variant="outline">{job.material || 'Not specified'}</Badge>
              </div>

              {/* Additional Info */}
              {job.quantity > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Quantity:</span>
                  <Badge variant="outline">{job.quantity}</Badge>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button size="sm" variant="ghost">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actuallyPrintingJobs.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="text-slate-400 mb-4">
              <Play className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Print Jobs</h3>
            <p className="text-slate-600">All printers are currently idle. Start a new job to see live monitoring here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CurrentPrintingJobsPage;
