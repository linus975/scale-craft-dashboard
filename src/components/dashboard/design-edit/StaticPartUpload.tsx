
import React from 'react';
import GCodeFileUpload from './GCodeFileUpload';
import NozzleDiameterInput from './NozzleDiameterInput';
import FilamentSelector from './FilamentSelector';

interface StaticPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
  currentPart?: {
    nozzleDiameter?: string;
    filamentType?: string;
  };
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const StaticPartUpload: React.FC<StaticPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile,
  currentPart,
  onPartSpecificationChange
}) => {
  const handleNozzleChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'nozzleDiameter', value);
  };

  const handleFilamentChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'filamentType', value);
  };

  return (
    <div className="space-y-4">
      <GCodeFileUpload
        title={`G-code File for "${partName}"`}
        partId={partId}
        uploading={uploading}
        gcodeFile={gcodeFile}
        onGcodeFileChange={onGcodeFileChange}
        onRemoveGcodeFile={onRemoveGcodeFile}
      />
      
      {/* Nozzle Diameter and Filament Type below G-code */}
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

export default StaticPartUpload;
