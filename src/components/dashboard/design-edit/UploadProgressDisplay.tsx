
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Upload, Zap } from 'lucide-react';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  speed?: string;
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
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">
                Upload Progress ({completedFiles}/{totalFiles})
              </span>
            </div>
            {overallProgress === 100 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          
          <Progress value={overallProgress} className="w-full" />
          
          {progressEntries.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {progressEntries.map((progress) => (
                <div key={progress.fileId} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1 mr-2">{progress.fileName}</span>
                    <div className="flex items-center gap-2">
                      {progress.speed && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{progress.speed}</span>
                        </div>
                      )}
                      {progress.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {progress.status === 'error' && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-500">
                        {progress.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {progress.status !== 'pending' && (
                    <Progress 
                      value={progress.progress} 
                      className="h-1"
                    />
                  )}
                  
                  {progress.error && (
                    <p className="text-red-500 text-xs">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgressDisplay;
