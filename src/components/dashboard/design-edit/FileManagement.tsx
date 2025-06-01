
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, X, FileCode, Plus, Settings } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
}

interface FileManagementProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => void;
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
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'main', name: 'Hauptteil', files: [] }
  ]);
  const [activeTab, setActiveTab] = useState('main');
  const [newPartName, setNewPartName] = useState('');

  // Organize files by parts
  const organizeFilesByParts = () => {
    const organizedParts = designParts.map(part => ({
      ...part,
      files: uploadedFiles.filter(file => file.partId === part.id || (!file.partId && part.id === 'main'))
    }));
    return organizedParts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event, activeTab);
  };

  const handleFileRemove = (file: UploadedFile) => {
    onFileRemove(file);
  };

  const addNewPart = () => {
    if (newPartName.trim()) {
      const newPart: DesignPart = {
        id: `part-${Date.now()}`,
        name: newPartName.trim(),
        files: []
      };
      setDesignParts(prev => [...prev, newPart]);
      setActiveTab(newPart.id);
      setNewPartName('');
    }
  };

  const removePart = (partId: string) => {
    if (partId === 'main') return; // Can't remove main part
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    setActiveTab('main');
  };

  const renamePart = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const organizedParts = organizeFilesByParts();

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <div>
        <h4 className="text-lg font-medium">Dateien verwalten</h4>
        <p className="text-sm text-gray-600">Organisieren Sie Ihr Design in Teile und laden Sie Dateien für jeden Teil hoch</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <TabsList className="flex-1">
            {designParts.map((part) => (
              <TabsTrigger key={part.id} value={part.id} className="relative group">
                {part.name}
                {part.id !== 'main' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePart(part.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Neuer Teil..."
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              className="w-32"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNewPart();
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={addNewPart}
              disabled={!newPartName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {organizedParts.map((part) => (
          <TabsContent key={part.id} value={part.id} className="space-y-4">
            {/* File Upload for current part */}
            <div className="space-y-2">
              <Label htmlFor={`fileUpload-${part.id}`}>
                Dateien für "{part.name}" hochladen
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Klicken Sie hier oder ziehen Sie Dateien für {part.name} hinein
                </p>
                <Input
                  id={`fileUpload-${part.id}`}
                  type="file"
                  multiple
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
                    document.getElementById(`fileUpload-${part.id}`)?.click();
                  }}
                  disabled={uploading}
                >
                  {uploading ? 'Hochladen...' : 'Dateien auswählen'}
                </Button>
              </div>
            </div>

            {/* Files for current part */}
            {(loadingFiles || part.files.length > 0) && (
              <div className="space-y-2">
                <Label>Dateien für "{part.name}"</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {loadingFiles ? (
                    <p className="text-sm text-gray-500">Dateien werden geladen...</p>
                  ) : part.files.length === 0 ? (
                    <p className="text-sm text-gray-500">Keine Dateien für diesen Teil</p>
                  ) : (
                    part.files.map((file) => (
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
                            title={file.id === 'legacy_gcode' ? 'Legacy G-Code kann nicht gelöscht werden' : 'Datei löschen'}
                            disabled={file.id === 'legacy_gcode'}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FileManagement;
