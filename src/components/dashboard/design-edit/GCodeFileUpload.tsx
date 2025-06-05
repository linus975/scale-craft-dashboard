
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, File } from 'lucide-react';

interface GCodeFileUploadProps {
  title: string;
  partId: string;
  uploading: boolean;
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
}

const GCodeFileUpload: React.FC<GCodeFileUploadProps> = ({
  title,
  partId,
  uploading,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile
}) => {
  const inputId = `gcodeUpload-${partId}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {title}
      </Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {gcodeFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{gcodeFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(gcodeFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(inputId)?.click()}
              >
                Change file
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemoveGcodeFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your G-code file here, or click to select
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(inputId)?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Select G-code file'}
            </Button>
          </div>
        )}
        
        <Input
          id={inputId}
          type="file"
          accept=".gcode,.g"
          onChange={onGcodeFileChange}
          className="hidden"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Supported formats: .gcode, .g
      </p>
    </div>
  );
};

export default GCodeFileUpload;
