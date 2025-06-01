
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
}

const StaticPartUpload: React.FC<StaticPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles
}) => {
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
        />
        <FilamentSelector
          id={`staticFilamentType-${partId}`}
          required={true}
        />
      </div>
    </div>
  );
};

export default StaticPartUpload;
