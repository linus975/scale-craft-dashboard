
import React from 'react';
import FileUploadSection from './FileUploadSection';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';

interface StaticPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const StaticPartUpload: React.FC<StaticPartUploadProps> = ({
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
    <div className="space-y-2">
      <FileUploadSection
        title={`G-code File for "${partName}"`}
        accept=".gcode,.g"
        extensions=".gcode, .g"
        inputId={`fileUpload-${partId}`}
        required={true}
        partId={partId}
        uploading={uploading}
        uploadedFiles={uploadedFiles}
        onFileUpload={onFileUpload}
      />
      
      {/* Nozzle Diameter and Filament Type for Static Design */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <NozzleDiameterInput
          id={`staticNozzleDiameter-${partId}`}
          required={true}
          onChange={handleNozzleDiameterChange}
        />
        <FilamentSelector
          id={`staticFilamentType-${partId}`}
          required={true}
          onChange={handleFilamentTypeChange}
        />
      </div>
    </div>
  );
};

export default StaticPartUpload;
