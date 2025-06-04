
import React from 'react';
import FileUploadSection from './FileUploadSection';
import CADParametersInputs from './CADParametersInputs';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';

interface PersonalizedPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => void;
  uploadedFiles: any[];
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const PersonalizedPartUpload: React.FC<PersonalizedPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles,
  onPartSpecificationChange
}) => {
  const handleNozzleDiameterChange = (value: string) => {
    if (onPartSpecificationChange) {
      onPartSpecificationChange(partId, 'nozzleDiameter', value);
    }
  };

  const handleFilamentTypeChange = (value: string) => {
    if (onPartSpecificationChange) {
      onPartSpecificationChange(partId, 'filamentType', value);
    }
  };

  // Separate upload handlers for CAD and INI files
  const handleCADFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'f3d');
  };

  const handleINIFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'ini');
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

      {/* CAD Parameters */}
      <CADParametersInputs partId={partId} />

      {/* Nozzle Diameter and Filament Type */}
      <div className="grid grid-cols-2 gap-4">
        <NozzleDiameterInput
          id={`personalizedNozzleDiameter-${partId}`}
          required={false}
          onChange={handleNozzleDiameterChange}
        />
        <FilamentSelector
          id={`personalizedFilamentType-${partId}`}
          required={false}
          onChange={handleFilamentTypeChange}
        />
      </div>
    </div>
  );
};

export default PersonalizedPartUpload;
