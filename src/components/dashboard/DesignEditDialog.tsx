
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, ListPlus, Printer, FileText, X } from 'lucide-react';

interface DesignEditDialogProps {
  design: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (designData: any) => void;
  onAddToQueue: (designId: number) => void;
  onPrintOnMachine: (designId: number, machineId: number) => void;
  machines: any[];
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
  
  // Mock uploaded files - in real app this would come from the design data
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'design.f3d', type: 'CAD File', size: '2.5 MB', uploadDate: '2024-01-15' },
    { id: 2, name: 'model.stl', type: 'STL File', size: '1.8 MB', uploadDate: '2024-01-15' },
    { id: 3, name: 'settings.ini', type: 'Settings File', size: '12 KB', uploadDate: '2024-01-15' }
  ]);

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
    if (selectedMachine) {
      onPrintOnMachine(design.id, parseInt(selectedMachine));
      console.log(`Printing design ${design.name} on machine ${selectedMachine}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type || 'Unknown',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0]
        };
        setUploadedFiles(prev => [...prev, newFile]);
      });
    }
  };

  const handleFileRemove = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleFileDownload = (fileName: string) => {
    console.log(`Downloading file: ${fileName}`);
    // In real app, this would trigger actual file download
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

                  <Separator />

                  {/* Parameter Mapping (if it's a personalized design) */}
                  {formData.sketchName && (
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
                      />
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Files</Label>
                        <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.uploadDate}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleFileDownload(file.name)}
                                  className="h-8 px-2"
                                >
                                  Download
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleFileRemove(file.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
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
                  <Label>Select Machine</Label>
                  <Select onValueChange={setSelectedMachine} value={selectedMachine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id.toString()}>
                          {machine.name} ({machine.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handlePrintOnMachine} 
                  disabled={!selectedMachine}
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
                  <span>{design.lastModified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Version:</span>
                  <span>{formData.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span>{formData.sketchName ? 'Personalized' : 'Static'}</span>
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
