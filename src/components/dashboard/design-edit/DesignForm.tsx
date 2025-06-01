
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import FileManagement from './FileManagement';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
}

interface FormData {
  name: string;
  cadSoftware: string;
  slicer: string;
  sketchName: string;
  replacementValue: string;
  version: string;
}

interface DesignFormProps {
  design: any;
  formData: FormData;
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
}

const DesignForm: React.FC<DesignFormProps> = ({
  design,
  formData,
  uploadedFiles,
  loadingFiles,
  uploading,
  onInputChange,
  onSelectChange,
  onSubmit,
  onClose,
  onFileUpload,
  onFileRemove,
  onFileDownload,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Design Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          value={formData.version}
          onChange={(e) => onInputChange('version', e.target.value)}
          required
        />
      </div>

      {/* Only show CAD Software and Slicer for personalized designs */}
      {design.design_type === 'personalized' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="cadSoftware">CAD Software</Label>
            <Select onValueChange={(value) => onSelectChange('cadSoftware', value)} value={formData.cadSoftware}>
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
            <Select onValueChange={(value) => onSelectChange('slicer', value)} value={formData.slicer}>
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
              onChange={(e) => onInputChange('sketchName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="replacementValue">Replacement Parameter</Label>
            <Input
              id="replacementValue"
              value={formData.replacementValue}
              onChange={(e) => onInputChange('replacementValue', e.target.value)}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* File Management */}
      <FileManagement
        uploadedFiles={uploadedFiles}
        loadingFiles={loadingFiles}
        uploading={uploading}
        onFileUpload={onFileUpload}
        onFileRemove={onFileRemove}
        onFileDownload={onFileDownload}
      />

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
  );
};

export default DesignForm;
