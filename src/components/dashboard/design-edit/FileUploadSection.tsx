
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadSectionProps {
  title: string;
  accept: string;
  extensions: string;
  inputId: string;
  required?: boolean;
  partId: string;
  uploading: boolean;
  uploadedFiles: any[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  expectedFileType?: 'f3d' | 'ini' | 'gcode';
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  title,
  accept,
  extensions,
  inputId,
  required = false,
  partId,
  uploading,
  uploadedFiles,
  onFileUpload,
  expectedFileType
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event);
  };

  const getFilesByTypeAndContext = () => {
    return uploadedFiles.filter(file => {
      const hasCorrectPartId = file.partId === partId;
      const hasCorrectExtension = extensions.split(',').some(ext => 
        file.name.toLowerCase().endsWith(ext.trim())
      );
      
      // Filter by upload context if expectedFileType is specified
      const hasCorrectContext = expectedFileType ? 
        file.uploadContext === expectedFileType : true;
      
      return hasCorrectPartId && hasCorrectExtension && hasCorrectContext;
    });
  };

  const relevantFiles = getFilesByTypeAndContext();
  const hasFiles = relevantFiles.length > 0;
  const hasExactlyOne = relevantFiles.length === 1;
  const tooManyFiles = relevantFiles.length > 1;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {title} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
        tooManyFiles 
          ? 'border-red-300 bg-red-50' 
          : hasFiles 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300'
      }`}>
        <Upload className={`h-6 w-6 mx-auto mb-2 ${
          tooManyFiles ? 'text-red-400' : 'text-gray-400'
        }`} />
        
        {tooManyFiles && (
          <div className="flex items-center justify-center gap-1 mb-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Too many files! Please upload exactly one file.</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-2">
          Upload {extensions} files {!required && '(optional)'}
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

export default FileUploadSection;
