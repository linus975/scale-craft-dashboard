
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  partType?: 'static' | 'personalized';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: any[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  partType = 'static',
  onFileUpload,
  uploadedFiles = []
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event);
  };

  const getFilesByType = (fileExtension: string) => {
    return uploadedFiles.filter(file => 
      file.partId === partId && file.name.toLowerCase().endsWith(fileExtension)
    );
  };

  const FileUploadSection = ({ 
    title, 
    accept, 
    extensions, 
    inputId, 
    required = false 
  }: { 
    title: string; 
    accept: string; 
    extensions: string; 
    inputId: string; 
    required?: boolean;
  }) => {
    const relevantFiles = extensions.split(',').map(ext => ext.trim()).reduce((acc, ext) => {
      return acc.concat(getFilesByType(ext));
    }, []);

    const hasFiles = relevantFiles.length > 0;
    const hasExactlyOne = relevantFiles.length === 1;
    const tooManyFiles = relevantFiles.length > 1;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>
          {title} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
          required && !hasExactlyOne 
            ? 'border-red-300 bg-red-50' 
            : hasFiles 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300'
        }`}>
          <Upload className={`h-6 w-6 mx-auto mb-2 ${
            required && !hasExactlyOne ? 'text-red-400' : 'text-gray-400'
          }`} />
          
          {tooManyFiles && (
            <div className="flex items-center justify-center gap-1 mb-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Too many files! Please upload exactly one file.</span>
            </div>
          )}
          
          {required && !hasFiles && (
            <div className="flex items-center justify-center gap-1 mb-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">This file is required</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-2">
            Upload {extensions} files
          </p>
          
          {hasFiles && (
            <div className="mb-2">
              <p className="text-sm text-green-600">
                {hasExactlyOne ? '✓ ' : ''}
                {relevantFiles.length} file{relevantFiles.length > 1 ? 's' : ''} uploaded
              </p>
              {relevantFiles.map(file => (
                <p key={file.id} className="text-xs text-gray-500">{file.name}</p>
              ))}
            </div>
          )}
          
          <Input
            id={inputId}
            type="file"
            multiple={false}
            accept={accept}
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
              document.getElementById(inputId)?.click();
            }}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : hasFiles ? 'Replace file' : 'Select file'}
          </Button>
        </div>
      </div>
    );
  };

  if (partType === 'personalized') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* CAD Files Upload */}
          <div className="space-y-2">
            <FileUploadSection
              title={`CAD File for "${partName}"`}
              accept=".f3d,.step,.stp,.stl"
              extensions=".f3d, .step, .stp, .stl"
              inputId={`cadUpload-${partId}`}
              required={true}
            />
            
            {/* CAD Parameters */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="space-y-1">
                <Label htmlFor={`sketchName-${partId}`} className="text-xs">
                  Sketch Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`sketchName-${partId}`}
                  placeholder="Enter sketch name"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`replacementType-${partId}`} className="text-xs">
                  Replacement Type <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text from Marketplace</SelectItem>
                    <SelectItem value="dimension">Dimension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Slicer INI Upload */}
          <div className="space-y-2">
            <FileUploadSection
              title={`INI File for "${partName}"`}
              accept=".ini"
              extensions=".ini"
              inputId={`iniUpload-${partId}`}
              required={true}
            />
            
            {/* Nozzle Diameter */}
            <div className="mt-3">
              <Label htmlFor={`nozzleDiameter-${partId}`} className="text-xs">
                Nozzle Diameter (mm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`nozzleDiameter-${partId}`}
                placeholder="0.4"
                type="number"
                step="0.1"
                min="0.1"
                max="2.0"
                className="h-8 text-xs mt-1"
                required
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Static part type - single G-code upload with nozzle diameter
  return (
    <div className="space-y-2">
      <FileUploadSection
        title={`G-code File for "${partName}"`}
        accept=".gcode,.g"
        extensions=".gcode, .g"
        inputId={`fileUpload-${partId}`}
        required={true}
      />
      
      {/* Nozzle Diameter for Static Design */}
      <div className="mt-3">
        <Label htmlFor={`staticNozzleDiameter-${partId}`} className="text-xs">
          Nozzle Diameter (mm) <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`staticNozzleDiameter-${partId}`}
          placeholder="0.4"
          type="number"
          step="0.1"
          min="0.1"
          max="2.0"
          className="h-8 text-xs"
          required
        />
      </div>
    </div>
  );
};

export default FileUpload;
