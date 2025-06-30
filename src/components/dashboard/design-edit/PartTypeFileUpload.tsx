
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Code, Settings } from 'lucide-react';
import { SelectedFile } from '@/hooks/useFileSelection';

interface PartTypeFileUploadProps {
  partId: string;
  partName: string;
  partType: 'static' | 'personalizable';
  selectedFiles: SelectedFile[];
  onFileSelect: (files: File[], partId: string, expectedType?: 'static' | 'personalizable') => void;
  onFileRemove: (fileId: string) => void;
}

const PartTypeFileUpload: React.FC<PartTypeFileUploadProps> = ({
  partId,
  partName,
  partType,
  selectedFiles,
  onFileSelect,
  onFileRemove
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log(`📤 [PartTypeFileUpload] File upload for ${partType} part:`, partName);
    onFileSelect(Array.from(files), partId, partType);
    
    // Reset input
    event.target.value = '';
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'CAD': return <FileText className="h-4 w-4" />;
      case 'INI': return <Settings className="h-4 w-4" />;
      case 'GCODE': return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAcceptedFileTypes = () => {
    if (partType === 'static') {
      return '.gcode,.g';
    } else if (partType === 'personalizable') {
      return '.f3d,.ini';
    }
    return '.f3d,.ini,.gcode,.g';
  };

  const getUploadDescription = () => {
    if (partType === 'static') {
      return 'G-Code Dateien (.gcode, .g)';
    } else if (partType === 'personalizable') {
      return 'F3D Dateien (.f3d) und INI Konfigurationsdateien (.ini)';
    }
    return 'Unterstützte Dateien';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Dateien für "{partName}" ({partType === 'static' ? 'Statisch' : 'Personalisierbar'})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <Label htmlFor={`file-upload-${partId}`} className="cursor-pointer">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Dateien auswählen
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {getUploadDescription()}
            </p>
          </Label>
          <Input
            id={`file-upload-${partId}`}
            type="file"
            multiple
            accept={getAcceptedFileTypes()}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ausgewählte Dateien:</Label>
            {selectedFiles.map((selectedFile) => (
              <div 
                key={selectedFile.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.fileCategory)}
                  <span className="text-sm font-medium">{selectedFile.file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({selectedFile.fileCategory})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(selectedFile.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* File Type Requirements */}
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          {partType === 'static' ? (
            <span>📋 Statische Parts benötigen nur G-Code Dateien für den direkten Druck.</span>
          ) : (
            <span>📋 Personalisierbare Parts benötigen F3D Dateien (CAD) und INI Dateien (Konfiguration).</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartTypeFileUpload;
