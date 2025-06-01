
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
}

const PersonalizedPartUpload: React.FC<PersonalizedPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* CAD Files Upload */}
        <div className="space-y-2">
          <FileUploadSection
            title={`CAD File for "${partName}"`}
            accept=".f3d,.step,.stp,.stl"
            extensions=".f3d, .step, .stp, .stl"
            inputId={`cadUpload-${partId}`}
            required={true}
            partId={partId}
            uploading={uploading}
            uploadedFiles={uploadedFiles}
            onFileUpload={onFileUpload}
          />
          
          <CADParametersInputs partId={partId} />
        </div>

        {/* Slicer INI Upload */}
        <div className="space-y-2">
          <FileUploadSection
            title={`INI File for "${partName}"`}
            accept=".ini"
            extensions=".ini"
            inputId={`iniUpload-${partId}`}
            required={true}
            partId={partId}
            uploading={uploading}
            uploadedFiles={uploadedFiles}
            onFileUpload={onFileUpload}
          />
          
          {/* Nozzle Diameter and Filament Type */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <NozzleDiameterInput
              id={`nozzleDiameter-${partId}`}
              required={true}
            />
            <FilamentSelector
              id={`filamentType-${partId}`}
              required={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedPartUpload;
