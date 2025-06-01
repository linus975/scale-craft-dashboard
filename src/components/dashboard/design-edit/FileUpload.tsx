
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`fileUpload-${partId}`}>
        Dateien für "{partName}" hochladen
      </Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Dateien für {partName} hochladen
        </p>
        <Input
          id={`fileUpload-${partId}`}
          type="file"
          multiple
          accept=".f3d,.ini,.step,.stl,.gcode"
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
          {uploading ? 'Hochladen...' : 'Dateien auswählen'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
