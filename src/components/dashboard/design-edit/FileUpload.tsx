
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  partType?: 'static' | 'personalized';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  partType = 'static',
  onFileUpload
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event);
  };

  if (partType === 'personalized') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* CAD Files Upload */}
          <div className="space-y-2">
            <Label htmlFor={`cadUpload-${partId}`}>
              CAD Files for "{partName}"
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload CAD files (.f3d, .step, .stl)
              </p>
              <Input
                id={`cadUpload-${partId}`}
                type="file"
                multiple
                accept=".f3d,.step,.stp,.stl"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`cadUpload-${partId}`)?.click();
                }}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select CAD files'}
              </Button>
            </div>
          </div>

          {/* Slicer INI Upload */}
          <div className="space-y-2">
            <Label htmlFor={`iniUpload-${partId}`}>
              Slicer Settings for "{partName}"
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload slicer settings (.ini)
              </p>
              <Input
                id={`iniUpload-${partId}`}
                type="file"
                multiple
                accept=".ini"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`iniUpload-${partId}`)?.click();
                }}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select INI files'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Static part type - single G-code upload
  return (
    <div className="space-y-2">
      <Label htmlFor={`fileUpload-${partId}`}>
        G-code files for "{partName}"
      </Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Upload G-code files (.gcode, .g)
        </p>
        <Input
          id={`fileUpload-${partId}`}
          type="file"
          multiple
          accept=".gcode,.g"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById(`fileUpload-${partId}`)?.click();
          }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select G-code files'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
