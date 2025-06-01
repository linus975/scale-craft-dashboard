
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, FileCode } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
}

interface FileManagementProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
}

const FileManagement: React.FC<FileManagementProps> = ({
  uploadedFiles,
  loadingFiles,
  uploading,
  onFileUpload,
  onFileRemove,
  onFileDownload,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-medium">Dateien verwalten</h4>
        <p className="text-sm text-gray-600">Laden Sie neue Dateien hoch oder löschen Sie bestehende</p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="fileUpload">Neue Dateien hochladen</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Klicken Sie hier oder ziehen Sie Dateien hinein
          </p>
          <Input
            id="fileUpload"
            type="file"
            multiple
            onChange={onFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('fileUpload')?.click()}
            disabled={uploading}
          >
            {uploading ? 'Hochladen...' : 'Dateien auswählen'}
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {(loadingFiles || uploadedFiles.length > 0) && (
        <div className="space-y-2">
          <Label>Hochgeladene Dateien</Label>
          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
            {loadingFiles ? (
              <p className="text-sm text-gray-500">Dateien werden geladen...</p>
            ) : uploadedFiles.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Dateien hochgeladen</p>
            ) : (
              uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {file.type.includes('G-Code') ? 
                      <FileCode className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                      <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onFileDownload(file)}
                      className="h-8 px-2"
                    >
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onFileRemove(file)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title={file.id === 'legacy_gcode' ? 'Legacy G-Code kann nicht gelöscht werden' : 'Datei löschen'}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagement;
