
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, FileText, Settings, Code } from 'lucide-react';
import { useSimpleFileUpload } from '@/hooks/useSimpleFileUpload';

const SimpleFileUpload: React.FC = () => {
  const { uploadedFiles, uploading, uploadFile, removeFile } = useSimpleFileUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log('📁 [SimpleFileUpload] Files selected:', files.length);

    try {
      for (const file of Array.from(files)) {
        console.log('📤 [SimpleFileUpload] Uploading file:', file.name);
        await uploadFile(file);
      }
    } catch (error) {
      console.error('❌ [SimpleFileUpload] Upload error:', error);
    }

    // Clear input
    event.target.value = '';
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'CAD':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'INI':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'GCODE':
        return <Code className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dateien hochladen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Dateien auswählen (CAD, INI, GCODE)</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".f3d,.step,.stp,.iges,.igs,.dwg,.dxf,.stl,.ini,.gcode,.g"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">
              Dateien werden hochgeladen...
            </p>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Hochgeladene Dateien ({uploadedFiles.length})</Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getIcon(file.fileCategory)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.fileCategory} • {file.type} • {file.size}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleFileUpload;
