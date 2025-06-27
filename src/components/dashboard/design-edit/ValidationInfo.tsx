
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, FileText, Settings } from 'lucide-react';

interface ValidationInfoProps {
  partName: string;
  hasPersonalizedFiles: boolean;
  hasF3D: boolean;
  hasINI: boolean;
}

const ValidationInfo: React.FC<ValidationInfoProps> = ({
  partName,
  hasPersonalizedFiles,
  hasF3D,
  hasINI
}) => {
  const allRequiredFilesPresent = hasF3D && hasINI;
  const someFilesPresent = hasF3D || hasINI;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">File Status for "{partName}"</h3>
      
      <Alert className={`${
        allRequiredFilesPresent 
          ? 'border-green-200 bg-green-50' 
          : someFilesPresent 
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-start gap-2">
          {allRequiredFilesPresent ? (
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <AlertDescription className="text-sm">
              {allRequiredFilesPresent ? (
                <span className="text-green-700">
                  All required files uploaded for this part ✓
                </span>
              ) : (
                <span className="text-gray-700">
                  This part requires specific files to be uploaded
                </span>
              )}
            </AlertDescription>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3 w-3" />
                <span className={hasF3D ? 'text-green-600' : 'text-gray-500'}>
                  CAD File (.f3d) {hasF3D ? '✓' : '- Required for this part'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Settings className="h-3 w-3" />
                <span className={hasINI ? 'text-green-600' : 'text-gray-500'}>
                  Configuration File (.ini) {hasINI ? '✓' : '- Required for this part'}
                </span>
              </div>
            </div>
            
            {!allRequiredFilesPresent && (
              <div className="text-xs text-gray-600 mt-2">
                Each part needs its own files, even if other parts have similar files.
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default ValidationInfo;
