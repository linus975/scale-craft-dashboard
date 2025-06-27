
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileCode } from 'lucide-react';

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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onGcodeFileChange) {
      console.log(`📤 GCodeFileUpload - Uploading G-code for part: ${partId}`);
      onGcodeFileChange(event);
    }
  };

  const handleRemoveFile = () => {
    if (onRemoveGcodeFile) {
      console.log(`🗑️ GCodeFileUpload - Removing G-code for part: ${partId}`);
      onRemoveGcodeFile();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`gcode-${partId}`}>
        {title}
      </Label>
      
      <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
        gcodeFile ? 'border-green-300 bg-green-50' : 'border-gray-300'
      }`}>
        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
        
        <p className="text-sm text-gray-600 mb-2">
          Upload G-code file (.gcode, .g) for this specific part
        </p>
        
        {gcodeFile && (
          <div className="mb-2 p-2 bg-white rounded border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{gcodeFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(gcodeFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        <Input
          id={`gcode-${partId}`}
          type="file"
          accept=".gcode,.g"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(`gcode-${partId}`)?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : gcodeFile ? 'Replace G-code' : 'Select G-code'}
        </Button>
      </div>
    </div>
  );
};

export default GCodeFileUpload;
