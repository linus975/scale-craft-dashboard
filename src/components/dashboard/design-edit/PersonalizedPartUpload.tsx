
import React from 'react';
import FileUploadSection from './FileUploadSection';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';

interface PersonalizedPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => void;
  uploadedFiles: any[];
  currentPart?: {
    nozzleDiameter?: string;
    filamentType?: string;
  };
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const PersonalizedPartUpload: React.FC<PersonalizedPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles,
  currentPart,
  onPartSpecificationChange
}) => {
  // Separate upload handlers for CAD and INI files
  const handleCADFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'f3d');
  };

  const handleINIFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'ini');
  };

  const handleNozzleChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'nozzleDiameter', value);
  };

  const handleFilamentChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'filamentType', value);
  };

  return (
    <div className="space-y-4">
      {/* CAD and INI Files Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* CAD File Upload */}
        <FileUploadSection
          title={`CAD-Datei für "${partName}"`}
          accept=".f3d"
          extensions=".f3d"
          inputId={`cadFileUpload-${partId}`}
          required={false}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleCADFileUpload}
          expectedFileType="f3d"
        />

        {/* INI File Upload */}
        <FileUploadSection
          title="INI-Konfigurationsdatei"
          accept=".ini"
          extensions=".ini"
          inputId={`iniFileUpload-${partId}`}
          required={false}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleINIFileUpload}
          expectedFileType="ini"
        />
      </div>

      {/* Nozzle Diameter and Filament Type below uploads */}
      <div className="grid grid-cols-2 gap-4">
        <NozzleDiameterInput
          id={`nozzle-${partId}`}
          onChange={handleNozzleChange}
        />
        
        <FilamentSelector
          id={`filament-${partId}`}
          onChange={handleFilamentChange}
        />
      </div>
    </div>
  );
};

export default PersonalizedPartUpload;
