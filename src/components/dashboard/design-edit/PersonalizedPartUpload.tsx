
import React from 'react';
import FileUploadSection from './FileUploadSection';
import CADParametersInputs from './CADParametersInputs';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';

interface PersonalizedPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
          required={true}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={onFileUpload}
        />

        {/* INI File Upload */}
        <FileUploadSection
          title="INI-Konfigurationsdatei"
          accept=".ini"
          extensions=".ini"
          inputId={`iniFileUpload-${partId}`}
          required={true}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={onFileUpload}
        />
      </div>

      {/* CAD Parameters */}
      <CADParametersInputs partId={partId} />

      {/* Nozzle Diameter and Filament Type */}
      <div className="grid grid-cols-2 gap-4">
        <NozzleDiameterInput
          id={`personalizedNozzleDiameter-${partId}`}
          required={true}
          onChange={handleNozzleDiameterChange}
        />
        <FilamentSelector
          id={`personalizedFilamentType-${partId}`}
          required={true}
          onChange={handleFilamentTypeChange}
        />
      </div>
    </div>
  );
};

export default PersonalizedPartUpload;
