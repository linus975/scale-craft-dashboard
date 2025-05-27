
import React, { useState } from 'react';
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
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import JobCreationDialog from './JobCreationDialog';

const JobsTab: React.FC = () => {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobs, setJobs] = useState([
    { id: 1, name: "Custom Gear Set", status: "printing", progress: 75, material: "PLA", printer: "X1C-2", priority: "normal" },
    { id: 2, name: "Prototype Housing", status: "queued", progress: 0, material: "ABS", printer: "A1 Mini-1", priority: "high" },
    { id: 3, name: "Bracket Design", status: "completed", progress: 100, material: "PETG", printer: "X1C-1", priority: "normal" },
    { id: 4, name: "Enclosure Part", status: "failed", progress: 45, material: "PLA", printer: "Mk3-2", priority: "normal" },
    { id: 5, name: "Phone Case Custom", status: "queued", progress: 0, material: "TPU", printer: "X1C-1", priority: "normal" },
  ]);

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

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? 
      <ArrowUp className="h-3 w-3 text-red-500" /> : 
      <ArrowDown className="h-3 w-3 text-blue-500" />;
  };

  const handleCreateJob = (jobData: any) => {
    const newJob = {
      ...jobData,
      id: Date.now(),
      name: jobData.designName,
      status: 'queued',
      progress: 0
    };

    setJobs(prev => {
      if (jobData.priority === 'high') {
        // Add to beginning of queue (after any currently printing jobs)
        const printingJobs = prev.filter(job => job.status === 'printing');
        const otherJobs = prev.filter(job => job.status !== 'printing');
        return [...printingJobs, newJob, ...otherJobs];
      } else {
        // Add to end of queue
        return [...prev, newJob];
      }
    });
  };

  // Separate jobs by priority and status
  const printingJobs = jobs.filter(job => job.status === 'printing');
  const highPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'high');
  const normalPriorityQueued = jobs.filter(job => job.status === 'queued' && job.priority === 'normal');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  const renderJobSection = (jobs: any[], title: string, icon: React.ReactNode, description: string) => {
    if (jobs.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <Badge variant="outline">{jobs.length}</Badge>
        </div>
        <p className="text-sm text-slate-600 mb-3">{description}</p>
        <div className="space-y-2">
          {jobs.map((job, index) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-4">
                {getStatusIcon(job.status)}
                <div className="flex items-center gap-2">
                  {job.priority && getPriorityIcon(job.priority)}
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
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Production Jobs</h2>
          <p className="text-slate-600">Monitor and manage your print queue with priority management</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => setIsJobDialogOpen(true)}
        >
          <Play className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Job Queue Management</CardTitle>
          <CardDescription>Jobs organisiert nach Priorität und Status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Currently Printing */}
          {renderJobSection(
            printingJobs, 
            "Aktuell druckend", 
            <Play className="h-4 w-4 text-green-500" />,
            "Jobs die gerade gedruckt werden"
          )}

          {printingJobs.length > 0 && (highPriorityQueued.length > 0 || normalPriorityQueued.length > 0) && (
            <Separator />
          )}

          {/* High Priority Queue */}
          {renderJobSection(
            highPriorityQueued, 
            "Vorrangige Jobs", 
            <ArrowUp className="h-4 w-4 text-red-500" />,
            "Jobs mit hoher Priorität - werden als nächstes abgearbeitet"
          )}

          {highPriorityQueued.length > 0 && normalPriorityQueued.length > 0 && (
            <Separator />
          )}

          {/* Normal Priority Queue */}
          {renderJobSection(
            normalPriorityQueued, 
            "Normale Jobs", 
            <ArrowDown className="h-4 w-4 text-blue-500" />,
            "Jobs mit normaler Priorität"
          )}

          {(printingJobs.length > 0 || highPriorityQueued.length > 0 || normalPriorityQueued.length > 0) && 
           (completedJobs.length > 0 || failedJobs.length > 0) && (
            <Separator />
          )}

          {/* Completed Jobs */}
          {renderJobSection(
            completedJobs.slice(-3), // Show only last 3 completed jobs
            "Abgeschlossene Jobs", 
            <CheckCircle className="h-4 w-4 text-blue-500" />,
            "Erfolgreich abgeschlossene Jobs (letzte 3)"
          )}

          {/* Failed Jobs */}
          {renderJobSection(
            failedJobs.slice(-2), // Show only last 2 failed jobs
            "Fehlgeschlagene Jobs", 
            <AlertCircle className="h-4 w-4 text-red-500" />,
            "Jobs die einen Fehler hatten (letzte 2)"
          )}
        </CardContent>
      </Card>

      <JobCreationDialog
        isOpen={isJobDialogOpen}
        onClose={() => setIsJobDialogOpen(false)}
        onCreateJob={handleCreateJob}
      />
    </div>
  );
};

export default JobsTab;
