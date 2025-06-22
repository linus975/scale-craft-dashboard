
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Upload, Zap, Clock, HardDrive } from 'lucide-react';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  speed?: string;
  bytesUploaded?: number;
  totalBytes?: number;
  timeRemaining?: string;
  error?: string;
}

interface UploadProgressDisplayProps {
  uploadProgress: Record<string, UploadProgress>;
  uploading: boolean;
}

const UploadProgressDisplay: React.FC<UploadProgressDisplayProps> = ({
  uploadProgress,
  uploading
}) => {
  const progressEntries = Object.values(uploadProgress);
  
  if (progressEntries.length === 0 && !uploading) {
    return null;
  }

  const totalFiles = progressEntries.length;
  const completedFiles = progressEntries.filter(p => p.status === 'completed').length;
  const failedFiles = progressEntries.filter(p => p.status === 'error').length;
  const uploadingFiles = progressEntries.filter(p => p.status === 'uploading').length;
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">
                High-Speed Upload ({completedFiles}/{totalFiles})
                {uploadingFiles > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {uploadingFiles} aktiv
                  </span>
                )}
              </span>
            </div>
            {overallProgress === 100 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">Blitzschnell!</span>
              </div>
            )}
          </div>
          
          <Progress 
            value={overallProgress} 
            className="w-full h-2" 
          />
          
          {progressEntries.length > 0 && (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {progressEntries.map((progress) => (
                <div key={progress.fileId} className="text-xs space-y-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1 mr-2 font-medium">{progress.fileName}</span>
                    <div className="flex items-center gap-3">
                      {progress.speed && progress.status === 'uploading' && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Zap className="h-3 w-3" />
                          <span className="font-mono">{progress.speed}</span>
                        </div>
                      )}
                      
                      {progress.timeRemaining && progress.status === 'uploading' && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="h-3 w-3" />
                          <span className="font-mono">{progress.timeRemaining}</span>
                        </div>
                      )}
                      
                      {progress.status === 'completed' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Fertig!</span>
                        </div>
                      )}
                      
                      {progress.status === 'error' && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      
                      <span className={`font-mono ${
                        progress.status === 'completed' ? 'text-green-600' : 
                        progress.status === 'error' ? 'text-red-500' : 
                        'text-gray-600'
                      }`}>
                        {progress.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {progress.bytesUploaded && progress.totalBytes && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <HardDrive className="h-3 w-3" />
                      <span>
                        {formatBytes(progress.bytesUploaded)} / {formatBytes(progress.totalBytes)}
                      </span>
                    </div>
                  )}
                  
                  {progress.status !== 'pending' && (
                    <Progress 
                      value={progress.progress} 
                      className={`h-1 ${
                        progress.status === 'completed' ? 'bg-green-100' :
                        progress.status === 'error' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}
                    />
                  )}
                  
                  {progress.error && (
                    <p className="text-red-500 text-xs bg-red-50 p-1 rounded">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {uploading && (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <Zap className="h-3 w-3 animate-pulse" />
              <span>Optimierter Hochgeschwindigkeits-Upload aktiv...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgressDisplay;
