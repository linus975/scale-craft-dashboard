
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, FileCode, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'customisable';
}

interface FileListProps {
  files: UploadedFile[];
  partName: string;
  loadingFiles: boolean;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
  onFileTypeChange: (fileId: string, designType: 'static' | 'personalized') => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  partName,
  loadingFiles,
  onFileRemove,
  onFileDownload,
  onFileTypeChange
}) => {
  const handleFileRemove = (file: UploadedFile) => {
    onFileRemove(file);
  };

  return (
    <div className="space-y-2">
      <Label>Files for "{partName}"</Label>
      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
        {loadingFiles ? (
          <p className="text-sm text-gray-500">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-500">No files for this part</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {file.type.includes('G-Code') ? 
                  <FileCode className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                  <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                }
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.uploadDate}</p>
                  
                  {/* Design Type Selection per file */}
                  <div className="mt-1">
                    <Select 
                      value={file.designType === 'customisable' ? 'personalized' : 'static'} 
                      onValueChange={(value) => onFileTypeChange(file.id, value as 'static' | 'personalized')}
                    >
                      <SelectTrigger className="h-6 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Static</SelectItem>
                        <SelectItem value="personalized">Personalizable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDownload(file);
                  }}
                  className="h-8 px-2"
                >
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileRemove(file);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete file"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileList;
