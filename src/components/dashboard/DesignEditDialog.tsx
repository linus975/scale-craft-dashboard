import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, ListPlus, Printer, FileText, X, FileCode } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';

interface DesignEditDialogProps {
  design: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (designData: any) => void;
  onAddToQueue: (designId: number) => void;
  onPrintOnMachine: (designId: number, machineId: number) => void;
  machines: any[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
}

const DesignEditDialog: React.FC<DesignEditDialogProps> = ({ 
  design, 
  isOpen, 
  onClose, 
  onSave, 
  onAddToQueue,
  onPrintOnMachine,
  machines 
}) => {
  const [formData, setFormData] = useState({
    name: design?.name || '',
    cadSoftware: design?.cadSoftware || '',
    slicer: design?.slicer || '',
    sketchName: design?.sketchName || '',
    replacementValue: design?.replacementValue || '',
    version: design?.version || 'v1.0'
  });

  const [selectedMachine, setSelectedMachine] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  
  const { uploadFile, getFileUrl, deleteFile, uploading } = useFileUpload();

  // Filter machines to only show idle ones
  const idleMachines = machines.filter(machine => machine.status === 'idle');

  // Load real files from database and storage when dialog opens
  useEffect(() => {
    if (isOpen && design?.id) {
      loadDesignFiles();
    }
  }, [isOpen, design?.id]);

  const loadDesignFiles = async () => {
    if (!design?.id) return;
    
    setLoadingFiles(true);
    try {
      const files: UploadedFile[] = [];
      
      // Add G-Code file if exists (for static designs)
      if (design.design_type === 'static' && design.gcode_file_path) {
        const gcodeFileUrl = getFileUrl(design.gcode_file_path);
        const fileName = extractOriginalFileName(design.gcode_file_path, 'G-Code File');
        files.push({
          id: 'gcode_file',
          name: fileName,
          type: 'G-Code File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.gcode_file_path,
          originalName: fileName
        });
      }

      // Add legacy G-Code if exists and no file path
      if (design.design_type === 'static' && design.gcode && !design.gcode_file_path) {
        files.push({
          id: 'legacy_gcode',
          name: `${design.name || 'design'}.gcode`,
          type: 'G-Code (Legacy)',
          size: `${(design.gcode.length / 1024).toFixed(1)} KB`,
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: '',
          originalName: `${design.name || 'design'}.gcode`
        });
      }
      
      // Add CAD file if exists (for personalized designs)
      if (design.design_type === 'personalized' && design.cad_file_path) {
        const cadFileUrl = getFileUrl(design.cad_file_path);
        const fileName = extractOriginalFileName(design.cad_file_path, 'CAD File');
        files.push({
          id: 'cad_file',
          name: fileName,
          type: 'CAD File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.cad_file_path,
          originalName: fileName
        });
      }

      // Add INI file if exists
      if (design.ini_file_path) {
        const iniFileUrl = getFileUrl(design.ini_file_path);
        const fileName = extractOriginalFileName(design.ini_file_path, 'Settings File');
        files.push({
          id: 'ini_file',
          name: fileName,
          type: 'Settings File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.ini_file_path,
          originalName: fileName
        });
      }

      // Add preview image if exists
      if (design.preview_image_path) {
        const previewFileUrl = getFileUrl(design.preview_image_path);
        const fileName = extractOriginalFileName(design.preview_image_path, 'Preview Image');
        files.push({
          id: 'preview_image',
          name: fileName,
          type: 'Image File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.preview_image_path,
          originalName: fileName
        });
      }

      // Load additional files from storage bucket if they exist
      try {
        const { data: storageFiles, error } = await supabase.storage
          .from('design-files')
          .list(`${design.user_id}/designs/`, {
            limit: 100,
            search: design.id
          });

        if (storageFiles && !error) {
          for (const file of storageFiles) {
            // Skip if this file is already included above
            const fullPath = `${design.user_id}/designs/${file.name}`;
            if (!files.find(f => f.path === fullPath)) {
              files.push({
                id: file.id || file.name,
                name: file.name,
                type: getFileType(file.name),
                size: file.metadata?.size ? `${(file.metadata.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                uploadDate: new Date(file.created_at || design.created_at).toISOString().split('T')[0],
                path: fullPath,
                originalName: file.name
              });
            }
          }
        }
      } catch (storageError) {
        console.error('Error loading storage files:', storageError);
      }

      setUploadedFiles(files);
    } catch (error) {
      console.error('Error loading design files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Extract original file name from storage path
  const extractOriginalFileName = (path: string, fallbackType: string): string => {
    if (!path) return fallbackType;
    
    // Extract the filename from the path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    // Try to extract original name if it follows the pattern randomString.extension
    // You might want to adjust this based on how your files are stored
    if (fileName.includes('.')) {
      const extension = fileName.split('.').pop();
      
      // Check if it's a CAD file extension
      if (['f3d', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf'].includes(extension?.toLowerCase() || '')) {
        return `${design.name || 'design'}.${extension}`;
      }
      
      // Check if it's a G-Code file
      if (extension?.toLowerCase() === 'gcode') {
        return `${design.name || 'design'}.gcode`;
      }
      
      // Check if it's an INI file
      if (extension?.toLowerCase() === 'ini') {
        return `${design.name || 'settings'}.ini`;
      }
      
      // Check if it's an image
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension?.toLowerCase() || '')) {
        return `${design.name || 'preview'}.${extension}`;
      }
      
      return fileName;
    }
    
    return fileName || fallbackType;
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'iges':
      case 'igs':
        return 'IGES File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'Image File';
      case 'gcode':
        return 'G-Code File';
      default:
        return 'Unknown';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...design, ...formData });
    onClose();
  };

  const handleAddToQueue = () => {
    onAddToQueue(design.id);
    console.log(`Added design ${design.name} to queue`);
  };

  const handlePrintOnMachine = () => {
    if (selectedMachine && selectedMachine !== 'no-machines') {
      onPrintOnMachine(design.id, parseInt(selectedMachine));
      console.log(`Printing design ${design.name} on machine ${selectedMachine}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !design?.id) return;

    try {
      for (const file of Array.from(files)) {
        const filePath = await uploadFile(file, `designs`);
        
        // Add the new file to the list
        const newFile: UploadedFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: filePath,
          originalName: file.name
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileRemove = async (file: UploadedFile) => {
    if (file.id === 'legacy_gcode') {
      // Can't delete legacy G-Code stored in database
      return;
    }
    
    try {
      await deleteFile(file.path);
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileDownload = (file: UploadedFile) => {
    if (file.id === 'legacy_gcode') {
      // Create blob for legacy G-Code
      const blob = new Blob([design.gcode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const fileUrl = getFileUrl(file.path);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Design: {design.name}</DialogTitle>
          <DialogDescription>
            Modify design settings and manage printing options
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Design Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Design Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Design Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      required
                    />
                  </div>

                  {/* Only show CAD Software and Slicer for personalized designs */}
                  {design.design_type === 'personalized' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cadSoftware">CAD Software</Label>
                        <Select onValueChange={(value) => handleSelectChange('cadSoftware', value)} value={formData.cadSoftware}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CAD software" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fusion360">Fusion 360</SelectItem>
                            <SelectItem value="solidworks">SolidWorks</SelectItem>
                            <SelectItem value="blender">Blender</SelectItem>
                            <SelectItem value="freecad">FreeCAD</SelectItem>
                            <SelectItem value="onshape">Onshape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slicer">Slicer</Label>
                        <Select onValueChange={(value) => handleSelectChange('slicer', value)} value={formData.slicer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select slicer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
                            <SelectItem value="bambuuslicer">Bambu Studio</SelectItem>
                            <SelectItem value="orcaslicer">OrcaSlicer</SelectItem>
                            <SelectItem value="cura">Cura</SelectItem>
                            <SelectItem value="superslicer">SuperSlicer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Parameter Mapping (only for personalized designs) */}
                  {design.design_type === 'personalized' && formData.sketchName && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-medium">Parameter Mapping</h4>
                        <p className="text-sm text-gray-600">Customizable parameters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sketchName">Sketch Name</Label>
                        <Input
                          id="sketchName"
                          value={formData.sketchName}
                          onChange={(e) => handleInputChange('sketchName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="replacementValue">Replacement Parameter</Label>
                        <Input
                          id="replacementValue"
                          value={formData.replacementValue}
                          onChange={(e) => handleInputChange('replacementValue', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* File Management */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium">Files</h4>
                      <p className="text-sm text-gray-600">Manage uploaded files for this design</p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="fileUpload">Upload New Files</Label>
                      <Input
                        id="fileUpload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                        disabled={uploading}
                      />
                      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
                    </div>

                    {/* Uploaded Files List */}
                    {(loadingFiles || uploadedFiles.length > 0) && (
                      <div className="space-y-2">
                        <Label>Uploaded Files</Label>
                        <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                          {loadingFiles ? (
                            <p className="text-sm text-gray-500">Loading files...</p>
                          ) : uploadedFiles.length === 0 ? (
                            <p className="text-sm text-gray-500">No files uploaded yet</p>
                          ) : (
                            uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div className="flex items-center gap-2">
                                  {file.type.includes('G-Code') ? 
                                    <FileCode className="h-4 w-4 text-green-500" /> : 
                                    <FileText className="h-4 w-4 text-slate-500" />
                                  }
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.uploadDate}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleFileDownload(file)}
                                    className="h-8 px-2"
                                  >
                                    Download
                                  </Button>
                                  {file.id !== 'legacy_gcode' && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleFileRemove(file)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            {/* Add to Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add to QueueBoard</CardTitle>
                <CardDescription>Queue this design for printing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleAddToQueue} className="w-full">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add to Queue
                </Button>
              </CardContent>
            </Card>

            {/* Print on Machine */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Print on Machine</CardTitle>
                <CardDescription>Start printing directly on a machine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Select Machine (Idle Only)</Label>
                  <Select onValueChange={setSelectedMachine} value={selectedMachine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {idleMachines.length === 0 ? (
                        <SelectItem value="no-machines" disabled>No idle machines available</SelectItem>
                      ) : (
                        idleMachines.map((machine) => (
                          <SelectItem key={machine.id} value={machine.id.toString()}>
                            {machine.name} (idle)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handlePrintOnMachine} 
                  disabled={!selectedMachine || selectedMachine === 'no-machines' || idleMachines.length === 0}
                  className="w-full"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Start Print
                </Button>
              </CardContent>
            </Card>

            {/* File Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Modified:</span>
                  <span>{design.lastModified || new Date(design.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Version:</span>
                  <span>{formData.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span>{design.design_type === 'static' ? 'Static' : 'Personalized'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Files:</span>
                  <span>{uploadedFiles.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignEditDialog;
