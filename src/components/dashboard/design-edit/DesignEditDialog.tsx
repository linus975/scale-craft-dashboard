import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesignFiles } from '@/hooks/useDesignFiles';
import DesignForm from './design-edit/DesignForm';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import ActionsPanel from './design-edit/ActionsPanel';

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

  const {
    uploadedFiles,
    loadingFiles,
    uploading,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload
  } = useDesignFiles(design, isOpen);

  // Filter machines to only show idle ones
  const idleMachines = machines.filter(machine => machine.status === 'idle');

  const handleDesignChange = (field: string, value: string) => {
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Information</CardTitle>
              </CardHeader>
              <CardContent>
                <DesignForm
                  design={{ ...design, ...formData }}
                  onDesignChange={handleDesignChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiPartFileManager
                  uploadedFiles={uploadedFiles}
                  loadingFiles={loadingFiles}
                  uploading={uploading}
                  onFileUpload={handleFileUpload}
                  onFileRemove={handleFileRemove}
                  onFileDownload={handleFileDownload}
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <ActionsPanel
            design={design}
            formData={formData}
            uploadedFiles={uploadedFiles}
            selectedMachine={selectedMachine}
            setSelectedMachine={setSelectedMachine}
            idleMachines={idleMachines}
            onAddToQueue={handleAddToQueue}
            onPrintOnMachine={handlePrintOnMachine}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignEditDialog;
