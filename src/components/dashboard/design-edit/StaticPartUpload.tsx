
import React from 'react';
import FileUploadSection from './FileUploadSection';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';
import GCodeFileUpload from './GCodeFileUpload';

interface StaticPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
}

const StaticPartUpload: React.FC<StaticPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles,
  onPartSpecificationChange,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile
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
      <GCodeFileUpload
        title={`G-code File for "${partName}"`}
        partId={partId}
        uploading={uploading}
        gcodeFile={gcodeFile}
        onGcodeFileChange={onGcodeFileChange}
        onRemoveGcodeFile={onRemoveGcodeFile}
      />
      
      {/* Nozzle Diameter and Filament Type for Static Design */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <NozzleDiameterInput
          id={`staticNozzleDiameter-${partId}`}
          required={false}
          onChange={handleNozzleDiameterChange}
        />
        <FilamentSelector
          id={`staticFilamentType-${partId}`}
          required={false}
          onChange={handleFilamentTypeChange}
        />
      </div>
    </div>
  );
};

export default StaticPartUpload;
